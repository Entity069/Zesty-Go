package models

type OrderItem struct {
	ID        int     `json:"id"`
	OrderID   int     `json:"order_id"`
	ItemID    int     `json:"item_id"`
	Quantity  int     `json:"quantity"`
	UnitPrice float64 `json:"unit_price"`
	Status    string  `json:"status"`
}

func (oi *OrderItem) Create() error {
	query := `INSERT INTO order_items (order_id, item_id, quantity, unit_price, status) VALUES (?, ?, ?, ?, ?)`
	result, err := DB.Exec(query, oi.OrderID, oi.ItemID, oi.Quantity, oi.UnitPrice, oi.Status)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	oi.ID = int(id)
	return nil
}

func (oi *OrderItem) UpdateStatus(status string) error {
	query := `UPDATE order_items SET status = ? WHERE id = ?`
	_, err := DB.Exec(query, status, oi.ID)
	if err == nil {
		oi.Status = status
	}
	return err
}

func GetOrderItemByID(id int) (*OrderItem, error) {
	orderItem := &OrderItem{}
	query := `SELECT id, order_id, item_id, quantity, unit_price, status FROM order_items WHERE id = ?`
	err := DB.QueryRow(query, id).Scan(&orderItem.ID, &orderItem.OrderID, &orderItem.ItemID,
		&orderItem.Quantity, &orderItem.UnitPrice, &orderItem.Status)
	if err != nil {
		return nil, err
	}
	return orderItem, nil
}

func GetOrdersBySellerID(sellerID int) ([]map[string]interface{}, error) {
	query := `
    SELECT 
        o.id AS id,
        o.created_at AS created_at,
        o.status AS status,
        o.message AS message,
        c.id AS uid,
        c.first_name AS cfname,
        c.last_name AS clname,
        c.email AS cemail,
        c.address AS caddr,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'item_id', oi.id,
                'name', i.name,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'item_status', oi.status,
                'image', i.image
            )
        ) AS my_items
    FROM orders AS o
    JOIN order_items AS oi ON oi.order_id = o.id
    JOIN items AS i ON i.id = oi.item_id
    JOIN users AS c ON c.id = o.user_id
    WHERE i.seller_id = ? AND o.status != 'cancelled' AND o.status != 'cart'
    GROUP BY o.id, o.created_at, o.status, o.message, c.id, c.first_name, c.last_name, c.email, c.address
    ORDER BY o.created_at DESC
    `

	rows, err := DB.Query(query, sellerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []map[string]any
	for rows.Next() {
		var order map[string]any
		orders = append(orders, order)
	}
	return orders, nil
}
