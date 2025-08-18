package models

import (
	"fmt"
	"sync"
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
	UpdatedAt   time.Time `json:"updated_at"`
	// this fields are for extra fields for some endpoints
	SellerFirstName string  `json:"seller_fname"`
	SellerLastName  string  `json:"seller_lname"`
	CategoryName    string  `json:"cname"`
	Rating          float64 `json:"rating"`
}

type ItemsCache struct {
	mu     sync.RWMutex
	items  map[int][]*Item
	expiry map[int]time.Time
	ttl    time.Duration
}

var itemsCache = &ItemsCache{
	items:  make(map[int][]*Item),
	expiry: make(map[int]time.Time),
	ttl:    5 * time.Minute,
}

func (c *ItemsCache) SetCache(limit int, items []*Item) {
	c.mu.Lock()
	defer c.mu.Unlock()

	itemsCopy := make([]*Item, len(items))
	copy(itemsCopy, items)

	c.items[limit] = itemsCopy
	c.expiry[limit] = time.Now().Add(c.ttl)
}

func (c *ItemsCache) GetFromCache(limit int) ([]*Item, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	items, exists := c.items[limit]
	if !exists {
		return nil, false
	}

	expiry, exists := c.expiry[limit]
	if !exists || time.Now().After(expiry) {
		return nil, false
	}

	itemsCopy := make([]*Item, len(items))
	copy(itemsCopy, items)
	return itemsCopy, true
}

// need to invalidate cache when items are created, updated or deleted
func (c *ItemsCache) InvalidateCache() {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items = make(map[int][]*Item)
	c.expiry = make(map[int]time.Time)
}

func (c *ItemsCache) CleanExpiredEntries() {
	c.mu.Lock()
	defer c.mu.Unlock()

	now := time.Now()
	for limit, expiry := range c.expiry {
		if now.After(expiry) {
			delete(c.items, limit)
			delete(c.expiry, limit)
		}
	}
}

func StartCacheCleanup() {
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()

		for range ticker.C {
			itemsCache.CleanExpiredEntries()
		}
	}()
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

	itemsCache.InvalidateCache()

	return nil
}

func (i *Item) Update() error {
	query := `UPDATE items SET name = ?, description = ?, price = ?, category_id = ?, status = ?, image = ? WHERE id = ?`
	_, err := DB.Exec(query, i.Name, i.Description, i.Price, i.CategoryID, i.Status, i.Image, i.ID)

	if err == nil {
		itemsCache.InvalidateCache()
	}

	return err
}

func (i *Item) Delete() error {
	query := `DELETE FROM items WHERE id = ?`
	_, err := DB.Exec(query, i.ID)

	if err == nil {
		itemsCache.InvalidateCache()
	}

	return err
}

func GetAllItems(limit int) ([]*Item, error) {
	if cachedItems, found := itemsCache.GetFromCache(limit); found {
		return cachedItems, nil
	}

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

	args := []any{}

	if limit > 0 {
		query += " LIMIT ?"
		args = append(args, limit)
	}

	rows, err := DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*Item
	for rows.Next() {
		item := &Item{}
		var categoryName string
		var rating float64
		err := rows.Scan(&item.ID, &item.SellerID, &item.Name, &item.Description, &item.Price, &item.CategoryID, &item.Status, &item.Image, &item.CreatedAt, &item.UpdatedAt, &categoryName, &rating)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	itemsCache.SetCache(limit, items)

	return items, nil
}

func GetItemByID(id int) (*Item, error) {
	item := &Item{}
	query := `
		SELECT
			i.id		  		AS id,
			i.seller_id  		AS sid,
			i.name       		AS name,
			i.image     		AS image,
			i.description 		AS description,
			i.price     		AS price,
			i.category_id 		AS cid,
			i.status     		AS status,
			i.created_at 		AS created_at,
			i.updated_at 		AS updated_at,
			u.first_name 		AS fname,
			u.last_name  		AS lname,
			c.name      		AS cname,
			ROUND(COALESCE(AVG(r.rating), 0), 1) AS rating
		FROM items i
		INNER JOIN users      u ON i.seller_id   = u.id
		INNER JOIN categories c ON i.category_id = c.id
		LEFT  JOIN reviews    r ON r.item_id     = i.id
		WHERE i.id = ?
		GROUP BY
			i.id, i.seller_id, i.name, i.image, i.description, i.price, i.category_id, i.status, i.created_at, i.updated_at,
			u.first_name, u.last_name,
			c.name
    `

	err := DB.QueryRow(query, id).Scan(
		&item.ID,
		&item.SellerID,
		&item.Name,
		&item.Image,
		&item.Description,
		&item.Price,
		&item.CategoryID,
		&item.Status,
		&item.CreatedAt,
		&item.UpdatedAt,
		&item.SellerFirstName,
		&item.SellerLastName,
		&item.CategoryName,
		&item.Rating,
	)
	if err != nil {
		fmt.Println("Error fetching item by ID:", err)
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
			&item.CategoryID, &item.Status, &item.Image, &item.CreatedAt, &item.UpdatedAt,
			&categoryName, &rating)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
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
