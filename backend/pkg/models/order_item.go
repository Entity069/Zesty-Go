package models

type OrderItem struct {
	ID        int     `json:"id"`
	OrderID   int     `json:"order_id"`
	Name      string  `json:"name,omitempty"` // for some order endpoints
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

func GetItemsByCategoryID(categoryID int) ([]*Item, error) {
	query := `SELECT id, name, description, price, image FROM items WHERE category_id = ?`
	rows, err := DB.Query(query, categoryID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*Item
	for rows.Next() {
		item := &Item{}
		err := rows.Scan(&item.ID, &item.Name, &item.Description, &item.Price, &item.Image)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}
