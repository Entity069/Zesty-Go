package models

import (
	"time"
)

type Item struct {
	ID          int       `json:"id"`
	SellerID    int       `json:"seller_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	CategoryID  int       `json:"category_id"`
	Status      string    `json:"status"`
	Image       string    `json:"image"`
	CreatedAt   time.Time `json:"created_at"`
}

func (i *Item) Create() error {
	query := `INSERT INTO items (seller_id, name, description, price, category_id, status, image) VALUES (?, ?, ?, ?, ?, ?, ?)`
	result, err := DB.Exec(query, i.SellerID, i.Name, i.Description, i.Price, i.CategoryID, i.Status, i.Image)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	i.ID = int(id)
	return nil
}

func (i *Item) Update() error {
	query := `UPDATE items SET name = ?, description = ?, price = ?, category_id = ?, status = ?, image = ? WHERE id = ?`
	_, err := DB.Exec(query, i.Name, i.Description, i.Price, i.CategoryID, i.Status, i.Image, i.ID)
	return err
}

func (i *Item) Delete() error {
	query := `DELETE FROM items WHERE id = ?`
	_, err := DB.Exec(query, i.ID)
	return err
}

func GetAllItems() ([]*Item, error) {
	query := `
	SELECT 
		i.id, i.seller_id, i.name, i.description, i.price, i.category_id, i.status, i.image, i.created_at, i.updated_at,
		c.name AS category_name,
		ROUND(COALESCE(AVG(r.rating), 0), 1) AS rating
	FROM items i
	LEFT JOIN categories c ON i.category_id = c.id
	LEFT JOIN reviews r ON r.item_id = i.id
	GROUP BY i.id
	`
	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*Item
	for rows.Next() {
		item := &Item{}
		var categoryName string
		var rating float64
		err := rows.Scan(&item.ID, &item.SellerID, &item.Name, &item.Description, &item.Price, &item.CategoryID, &item.Status, &item.Image, &item.CreatedAt, &categoryName, &rating)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

func GetItemByID(id int) (*Item, error) {
	item := &Item{}
	query := `SELECT id, seller_id, name, description, price, category_id, status, image, created_at FROM items WHERE id = ?`
	err := DB.QueryRow(query, id).Scan(&item.ID, &item.SellerID, &item.Name, &item.Description, &item.Price, &item.CategoryID, &item.Status, &item.Image, &item.CreatedAt)
	if err != nil {
		return nil, err
	}
	return item, nil
}

func GetItemsBySellerID(sellerID int) ([]*Item, error) {
	query := `
    SELECT 
        i.id, i.seller_id, i.name, i.description, i.price, i.category_id, i.status, i.image, i.created_at, i.updated_at,
        c.name AS category_name,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS rating
    FROM items i
    LEFT JOIN categories c ON i.category_id = c.id
    LEFT JOIN reviews r ON r.item_id = i.id
    WHERE i.seller_id = ?
    GROUP BY i.id
    `
	rows, err := DB.Query(query, sellerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*Item
	for rows.Next() {
		item := &Item{}
		var categoryName string
		var rating float64
		err := rows.Scan(&item.ID, &item.SellerID, &item.Name, &item.Description, &item.Price,
			&item.CategoryID, &item.Status, &item.Image, &item.CreatedAt,
			&categoryName, &rating)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

func GetSellerRevenue(sellerID int) (float64, error) {
	var revenue float64
	query := `
    SELECT COALESCE(SUM(oi.unit_price * oi.quantity), 0) AS revenue
    FROM order_items oi
    JOIN items i ON oi.item_id = i.id
    JOIN orders o ON oi.order_id = o.id
    WHERE i.seller_id = ? AND o.status != 'cart'
    `
	err := DB.QueryRow(query, sellerID).Scan(&revenue)
	return revenue, err
}

func GetSellerItemCount(sellerID int) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM items WHERE seller_id = ?`
	err := DB.QueryRow(query, sellerID).Scan(&count)
	return count, err
}

func GetSellerOrderCount(sellerID int) (int, error) {
	var count int
	query := `
    SELECT COUNT(DISTINCT o.id) AS orders
    FROM order_items oi
    JOIN items i ON oi.item_id = i.id
    JOIN orders o ON oi.order_id = o.id
    WHERE i.seller_id = ? AND o.status != 'cart'
    `
	err := DB.QueryRow(query, sellerID).Scan(&count)
	return count, err
}

func GetSellerCustomerCount(sellerID int) (int, error) {
	var count int
	query := `
    SELECT COUNT(DISTINCT o.user_id) AS customers
    FROM order_items oi
    JOIN items i ON oi.item_id = i.id
    JOIN orders o ON oi.order_id = o.id
    WHERE i.seller_id = ? AND o.status != 'cart'
    `
	err := DB.QueryRow(query, sellerID).Scan(&count)
	return count, err
}

func IncrementCartItem(orderID, itemID, delta int) error {
	_, err := DB.Exec(`INSERT INTO order_items (order_id, item_id, quantity, unit_price)
		VALUES (?, ?, ?, (SELECT price FROM items WHERE id = ?))
		ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
		orderID, itemID, delta, itemID)
	return err
}

func DecrementCartItem(orderID, itemID, delta int) error {
	_, err := DB.Exec(`UPDATE order_items SET quantity = quantity - ? WHERE order_id = ? AND item_id = ?`,
		delta, orderID, itemID)
	if err != nil {
		return err
	}
	_, _ = DB.Exec(`DELETE FROM order_items WHERE order_id = ? AND item_id = ? AND quantity <= 0`,
		orderID, itemID)
	_, _ = DB.Exec(`DELETE FROM orders WHERE id = ? AND status = 'cart' AND
		(SELECT COUNT(*) FROM order_items WHERE order_id = ?) = 0`, orderID, orderID)
	return nil
}

func UserBought(userID, itemID int) (bool, error) {
	var count int
	err := DB.QueryRow(`SELECT COUNT(*) FROM orders o
		JOIN order_items oi ON oi.order_id = o.id
		WHERE o.user_id = ? AND oi.item_id = ? AND o.status = 'delivered'`,
		userID, itemID).Scan(&count)
	return count > 0, err
}

func UserReviewed(userID, itemID int) (bool, error) {
	var count int
	err := DB.QueryRow(`SELECT COUNT(*) FROM reviews WHERE user_id = ? AND item_id = ?`,
		userID, itemID).Scan(&count)
	return count > 0, err
}

func InsertReview(userID, itemID, rating int) error {
	_, err := DB.Exec(`INSERT INTO reviews (user_id, item_id, rating) VALUES (?, ?, ?)`,
		userID, itemID, rating)
	return err
}

func MarkDelivered(orderID int) error {
	_, err := DB.Exec(`UPDATE order_items SET status = 'delivered' WHERE order_id = ?`, orderID)
	return err
}
