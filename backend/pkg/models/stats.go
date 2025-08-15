package models

func GetSellerRevenue(sellerID int) (float64, error) {
	var revenue float64
	query := `
    SELECT COALESCE(SUM(oi.unit_price * oi.quantity), 0) AS revenue
    FROM order_items oi
    JOIN items i ON oi.item_id = i.id
    JOIN orders o ON oi.order_id = o.id
    WHERE i.seller_id = ? AND o.status <> 'cart'
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
    WHERE i.seller_id = ? AND o.status <> 'cart'
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
    WHERE i.seller_id = ? AND o.status <> 'cart'
    `
	err := DB.QueryRow(query, sellerID).Scan(&count)
	return count, err
}

func GetTotalRevenue() (float64, error) {
	var revenue float64
	query := `
	SELECT COALESCE(SUM(oi.unit_price * oi.quantity), 0) AS revenue
	FROM order_items oi
	JOIN orders o ON oi.order_id = o.id
	WHERE o.status <> 'cart'
	`
	err := DB.QueryRow(query).Scan(&revenue)
	return revenue, err
}

func GetTotalOrders() (int, error) {
	var count int
	query := `
	SELECT COUNT(*) AS orders FROM orders WHERE orders.status <> 'cart'
	`
	err := DB.QueryRow(query).Scan(&count)
	return count, err
}

func GetTotalCustomers() (int, error) {
	var count int
	query := `
	SELECT COUNT(*) FROM users WHERE user_type='user'
	`
	err := DB.QueryRow(query).Scan(&count)
	return count, err
}

func GetTotalSellers() (int, error) {
	var count int
	query := `
	SELECT COUNT(*) FROM users WHERE user_type='seller'
	`
	err := DB.QueryRow(query).Scan(&count)
	return count, err
}

func GetTotalItems() (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM items`
	err := DB.QueryRow(query).Scan(&count)
	return count, err
}

func GetTotalCategories() (int, error) {
	var count int
	query := `
	SELECT COUNT(*) FROM categories
	`
	err := DB.QueryRow(query).Scan(&count)
	return count, err
}

func GetPendingOrdersCount() (int, error) {
	var count int
	query := `
	SELECT COUNT(*) FROM orders WHERE status <> 'delivered' AND status <> 'cancelled' AND status <> 'cart'
	`
	err := DB.QueryRow(query).Scan(&count)
	return count, err
}

func GetTotalReviews() (int, error) {
	var count int
	query := `
	SELECT COUNT(*) FROM reviews
	`
	err := DB.QueryRow(query).Scan(&count)
	return count, err
}
