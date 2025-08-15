package models

import (
	"encoding/json"
	"fmt"
	"slices"
	"time"
)

type Order struct {
	ID          int         `json:"id"`
	UserID      int         `json:"user_id"`
	Status      string      `json:"status"`
	Message     string      `json:"message"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
	TotalAmount float64     `json:"total_amount"`
	Items       []OrderItem `json:"items"`
	// extra fields for some endpoints
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Address   string `json:"address"`
}

func (o *Order) Create() error {
	query := `INSERT INTO orders (user_id, status, message) VALUES (?, ?, ?)`

	result, err := DB.Exec(query, o.UserID, o.Status, o.Message)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	o.ID = int(id)
	return nil
}

func (o *Order) Update() error {
	query := `UPDATE orders SET status = ?, message = ? WHERE id = ?`
	_, err := DB.Exec(query, o.Status, o.Message, o.ID)
	return err
}

func (o *Order) UpdateStatus(status string) error {
	query := `UPDATE orders SET status = ? WHERE id = ?`
	_, err := DB.Exec(query, status, o.ID)
	if err == nil {
		o.Status = status
	}
	return err
}

func (o *Order) UpdateMessage(message string) error {
	query := `UPDATE orders SET message = ? WHERE id = ?`
	_, err := DB.Exec(query, message, o.ID)
	if err == nil {
		o.Message = message
	}
	return err
}

func (o *Order) Delete() error {
	query := `DELETE FROM orders WHERE id = ?`
	_, err := DB.Exec(query, o.ID)
	return err
}

func (o *Order) Cancel() error {
	return o.UpdateStatus("cancelled")
}

func GetOrderByID(id int) (*Order, error) {
	query := `
			SELECT
			o.id            AS order_id,
			o.user_id       AS user_id,
			o.status        AS status,
			o.message       AS message,
			o.created_at    AS created_at,
			o.updated_at    AS updated_at,
			COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_amount,
			CASE 
				WHEN COUNT(oi.id) > 0 THEN
					JSON_ARRAYAGG(
						JSON_OBJECT(
							'id',         oi.id,
							'order_id',   oi.order_id,
							'name',    	  i.name,
							'quantity',   oi.quantity,
							'unit_price', oi.unit_price,
							'status',     oi.status
						)
					)
				ELSE JSON_ARRAY()
			END AS items_json
		FROM orders o
		LEFT JOIN order_items oi ON oi.order_id = o.id
		LEFT JOIN items i        ON i.id        = oi.item_id
		WHERE o.id = ? AND o.status <> 'cart'
		GROUP BY o.id, o.user_id, o.status, o.message, o.created_at, o.updated_at
		ORDER BY o.created_at DESC
		LIMIT 1`
	rows, err := DB.Query(query, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []*Order
	for rows.Next() {
		order := &Order{}
		var itemsJSON *string
		err := rows.Scan(&order.ID, &order.UserID, &order.Status, &order.Message, &order.CreatedAt, &order.UpdatedAt, &order.TotalAmount, &itemsJSON)
		if err != nil {
			return nil, err
		}
		if itemsJSON != nil && *itemsJSON != "" && *itemsJSON != "null" {
			if err := json.Unmarshal([]byte(*itemsJSON), &order.Items); err != nil {
				return nil, err
			}
		} else {
			order.Items = []OrderItem{}
		}
		orders = append(orders, order)
	}
	if len(orders) == 0 {
		return nil, nil
	}
	return orders[0], nil
}

func GetOrdersByUserID(userID int, limit int) ([]*Order, error) {
	query := `
			SELECT
			o.id            AS order_id,
			o.user_id       AS user_id,
			o.status        AS status,
			o.message       AS message,
			o.created_at    AS created_at,
			o.updated_at    AS updated_at,
			COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_amount,
			CASE 
				WHEN COUNT(oi.id) > 0 THEN
					JSON_ARRAYAGG(
						JSON_OBJECT(
							'id',         oi.id,
							'order_id',   oi.order_id,
							'name',    	  i.name,
							'quantity',   oi.quantity,
							'unit_price', oi.unit_price,
							'status',     oi.status
						)
					)
				ELSE JSON_ARRAY()
			END AS items_json
		FROM orders o
		LEFT JOIN order_items oi ON oi.order_id = o.id
		LEFT JOIN items i        ON i.id        = oi.item_id
		WHERE o.user_id = ? AND o.status <> 'cart'
		GROUP BY o.id, o.user_id, o.status, o.message, o.created_at, o.updated_at
		ORDER BY o.created_at DESC`

	args := []any{}
	if limit > 0 {
		query += " LIMIT ?"
		args = append(args, limit)
	}
	rows, err := DB.Query(query, append([]any{userID}, args...)...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []*Order
	for rows.Next() {
		order := &Order{}
		var itemsJSON *string
		err := rows.Scan(&order.ID, &order.UserID, &order.Status, &order.Message, &order.CreatedAt, &order.UpdatedAt, &order.TotalAmount, &itemsJSON)
		if err != nil {
			return nil, err
		}
		if itemsJSON != nil && *itemsJSON != "" && *itemsJSON != "null" {
			if err := json.Unmarshal([]byte(*itemsJSON), &order.Items); err != nil {
				return nil, err
			}
		} else {
			order.Items = []OrderItem{}
		}
		orders = append(orders, order)
	}
	if orders == nil {
		orders = []*Order{}
	}
	return orders, nil
}

func GetOrdersBySellerID(sellerID int, limit int) ([]*Order, error) {
	query := `
		SELECT
		o.id               AS id,
		o.created_at       AS created_at,
		o.status           AS status,
		o.message          AS message,
		SUM(oi.quantity * oi.unit_price) AS total_amount,
		c.id               AS cid,
		c.first_name       AS cfname,
		c.last_name        AS clname,
		c.email            AS cemail,
		c.address          AS caddr,
		JSON_ARRAYAGG(
			JSON_OBJECT(
			'id',           oi.id,
			'item_id',      oi.item_id,
			'name',         i.name,
			'quantity',     oi.quantity,
			'unit_price',   oi.unit_price,
			'status',       COALESCE(oi.status, 'ordered'),
			'item_status',  COALESCE(oi.status, 'ordered'),
			'image',        COALESCE(i.image, '')
			)
		) AS my_items
		FROM orders AS o
		JOIN order_items AS oi ON oi.order_id = o.id
		JOIN items AS i  ON i.id = oi.item_id
		JOIN users AS c ON c.id = o.user_id
		WHERE i.seller_id = ? AND o.status <> 'cancelled' AND o.status <> 'cart'
		GROUP BY o.id, o.created_at, o.status, o.message, c.id, c.first_name, c.last_name, c.email, c.address
		ORDER BY o.created_at DESC`

	args := []any{}
	if limit > 0 {
		query += " LIMIT ?"
		args = append(args, limit)
	}
	rows, err := DB.Query(query, append([]any{sellerID}, args...)...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []*Order
	for rows.Next() {
		order := &Order{}
		var itemsJSON *string

		err := rows.Scan(&order.ID, &order.CreatedAt, &order.Status, &order.Message,
			&order.TotalAmount,
			&order.UserID, &order.FirstName, &order.LastName, &order.Email, &order.Address, &itemsJSON)
		if err != nil {
			return nil, err
		}

		if itemsJSON != nil && *itemsJSON != "" && *itemsJSON != "null" {
			if err := json.Unmarshal([]byte(*itemsJSON), &order.Items); err != nil {
				return nil, err
			}
		} else {
			order.Items = []OrderItem{}
		}
		orders = append(orders, order)
	}
	if orders == nil {
		orders = []*Order{}
	}
	return orders, nil
}

func GetOrdersByStatus(status string) ([]*Order, error) {
	query := `SELECT id, user_id, status, message, created_at, updated_at FROM orders WHERE status = ? ORDER BY created_at DESC`

	rows, err := DB.Query(query, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []*Order
	for rows.Next() {
		order := &Order{}
		err := rows.Scan(&order.ID, &order.UserID, &order.Status, &order.Message, &order.CreatedAt, &order.UpdatedAt)
		if err != nil {
			return nil, err
		}
		orders = append(orders, order)
	}
	return orders, nil
}

func GetAllOrders() ([]*Order, error) {
	query := `
	SELECT 
		o.id 			AS id,
		o.user_id 		AS user_id,
		o.status 		AS status,
		o.message 		AS message,
		o.created_at 	AS created_at,
		o.updated_at 	AS updated_at,
		u.first_name 	AS first_name,
		u.last_name 	AS last_name,
		u.email 		AS email,
		u.address 		AS address,
		COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_amount
	FROM orders o
	LEFT JOIN users u ON u.id = o.user_id
	LEFT JOIN order_items oi ON oi.order_id = o.id
	GROUP BY o.id, u.first_name, u.last_name, u.email, u.address
	ORDER BY o.created_at DESC`

	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []*Order
	for rows.Next() {
		order := &Order{}
		err := rows.Scan(&order.ID, &order.UserID, &order.Status, &order.Message, &order.CreatedAt, &order.UpdatedAt, &order.FirstName, &order.LastName, &order.Email, &order.Address, &order.TotalAmount)
		if err != nil {
			return nil, err
		}
		orders = append(orders, order)
	}
	return orders, nil
}

func GetCartByUserID(userID int) (*Order, error) {
	cart := &Order{}
	var itemsJSON *string
	var totalAmount *float64

	query := `
		SELECT
			o.id            AS order_id,
			o.user_id       AS user_id,
			o.status        AS status,
			o.message       AS message,
			o.created_at    AS created_at,
			o.updated_at    AS updated_at,
			COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_amount,
			CASE 
				WHEN COUNT(oi.id) > 0 THEN
					JSON_ARRAYAGG(
						JSON_OBJECT(
							'id',         oi.id,
							'order_id',   oi.order_id,
							'item_id',    oi.item_id,
							'quantity',   oi.quantity,
							'unit_price', oi.unit_price,
							'status',     oi.status
						)
					)
				ELSE JSON_ARRAY()
			END AS items_json
		FROM orders o
		LEFT JOIN order_items oi ON oi.order_id = o.id
		LEFT JOIN items i        ON i.id        = oi.item_id
		WHERE o.user_id = ? AND o.status = 'cart'
		GROUP BY o.id, o.user_id, o.status, o.message, o.created_at, o.updated_at
		ORDER BY o.created_at DESC`

	err := DB.QueryRow(query, userID).Scan(
		&cart.ID,
		&cart.UserID,
		&cart.Status,
		&cart.Message,
		&cart.CreatedAt,
		&cart.UpdatedAt,
		&totalAmount,
		&itemsJSON,
	)
	if err != nil {
		return nil, err
	}

	if totalAmount != nil {
		cart.TotalAmount = *totalAmount
	}

	if itemsJSON != nil && *itemsJSON != "" && *itemsJSON != "null" {
		err = json.Unmarshal([]byte(*itemsJSON), &cart.Items)
		if err != nil {
			return nil, fmt.Errorf("failed to parse items JSON: %w", err)
		}
	} else {
		cart.Items = []OrderItem{}
	}

	return cart, nil
}

func CreateOrGetCart(userID int) (*Order, error) {
	cart, err := GetCartByUserID(userID)
	if err == nil {
		return cart, nil
	}

	newCart := &Order{
		UserID: userID,
		Status: "cart",
	}

	err = newCart.Create()
	if err != nil {
		return nil, err
	}

	return newCart, nil
}

func SyncStatus(orderID int) error {
	query := `SELECT status FROM order_items WHERE order_id = ?`
	rows, err := DB.Query(query, orderID)
	if err != nil {
		return err
	}
	defer rows.Close()

	var statuses []string
	for rows.Next() {
		var status string
		if err := rows.Scan(&status); err != nil {
			return err
		}
		statuses = append(statuses, status)
	}

	var newStatus string
	allSame := func(slice []string, value string) bool {
		for _, s := range slice {
			if s != value {
				return false
			}
		}
		return true
	}

	if allSame(statuses, "ordered") {
		newStatus = "ordered"
	} else if allSame(statuses, "preparing") {
		newStatus = "preparing"
	} else if allSame(statuses, "prepared") {
		newStatus = "prepared"
	} else {
		if slices.Contains(statuses, "preparing") {
			newStatus = "preparing"
		}
		if newStatus == "" {
			newStatus = "ordered"
		}
	}

	order, err := GetOrderByID(orderID)
	if err != nil {
		return err
	}
	return order.UpdateStatus(newStatus)
}

func CalculateCartTotal(cartID int) (float64, error) {
	query := `SELECT SUM(oi.unit_price * oi.quantity) FROM order_items oi WHERE oi.order_id = ?`
	var total float64
	err := DB.QueryRow(query, cartID).Scan(&total)
	if err != nil {
		fmt.Println("Error calculating cart total:", err)
		return 0, err
	}
	return total, nil
}

func AddItemToCart(userID int, itemID int, quantity int) (*OrderItem, error) {
	cart, err := CreateOrGetCart(userID)
	if err != nil {
		return nil, err
	}

	item, err := GetItemByID(itemID)
	if err != nil {
		return nil, err
	}
	var existingItem *OrderItem
	for i := range cart.Items {
		if cart.Items[i].ItemID == itemID {
			existingItem = &cart.Items[i]
			break
		}
	}

	if existingItem != nil {
		existingItem.Quantity += quantity
		query := `UPDATE order_items SET quantity = ? WHERE id = ?`
		_, err = DB.Exec(query, existingItem.Quantity, existingItem.ID)
		if err != nil {
			fmt.Println("Error updating existing item in cart:", err)
			return nil, err
		}
		return existingItem, nil
	} else {
		orderItem := &OrderItem{
			OrderID:   cart.ID,
			ItemID:    itemID,
			Quantity:  quantity,
			UnitPrice: item.Price,
			Status:    "cart",
		}

		err = orderItem.Create()
		if err != nil {
			fmt.Println("Error creating new order item:", err)
			return nil, err
		}

		return orderItem, nil
	}
}
