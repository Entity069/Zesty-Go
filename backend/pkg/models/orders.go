package models

import (
	"slices"
	"time"
)

type Order struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Status    string    `json:"status"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
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
	order := &Order{}
	query := `SELECT id, user_id, status, message, created_at, updated_at FROM orders WHERE id = ?`

	err := DB.QueryRow(query, id).Scan(&order.ID, &order.UserID, &order.Status, &order.Message, &order.CreatedAt, &order.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return order, nil
}

func GetOrdersByUserID(userID int) ([]*Order, error) {
	query := `SELECT id, user_id, status, message, created_at, updated_at FROM orders WHERE user_id = ? ORDER BY created_at DESC`

	rows, err := DB.Query(query, userID)
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
	query := `SELECT id, user_id, status, message, created_at, updated_at FROM orders ORDER BY created_at DESC`

	rows, err := DB.Query(query)
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

func GetCartByUserID(userID int) (*Order, error) {
	order := &Order{}
	query := `SELECT id, user_id, status, message, created_at, updated_at FROM orders WHERE user_id = ? AND status = 'cart'`

	err := DB.QueryRow(query, userID).Scan(&order.ID, &order.UserID, &order.Status, &order.Message, &order.CreatedAt, &order.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return order, nil
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
	query := `SELECT SUM(oi.price * oi.count) FROM order_items oi WHERE oi.order_id = ?`
	var total float64
	err := DB.QueryRow(query, cartID).Scan(&total)
	if err != nil {
		return 0, err
	}
	return total, nil
}
