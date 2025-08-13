package controllers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/Entity069/Zesty-Go/pkg/middleware"
	"github.com/Entity069/Zesty-Go/pkg/models"
	"github.com/gorilla/mux"
)

type OrderController struct{}

func NewOrderController() *OrderController {
	return &OrderController{}
}

func (oc *OrderController) jsonResp(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func (oc *OrderController) AddToCart(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		oc.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Unauthorized"})
		return
	}

	userID := claims.ID

	type reqBody struct {
		ItemID   int `json:"itemId"`
		Quantity int `json:"quantity"`
	}
	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		oc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid JSON"})
		return
	}

	_, err := models.CreateOrGetCart(userID)
	if err != nil {
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Cart creation failed"})
		return
	}

	_, err = models.AddItemToCart(userID, body.ItemID, body.Quantity)
	if err != nil {
		fmt.Println("Error adding item to cart:", body.ItemID, "Quantity:", body.Quantity, "Error:", err)
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to add item to cart"})
		return
	}

	oc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Item added to cart."})
}

func (oc *OrderController) PlaceOrder(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		oc.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Unauthorized"})
		return
	}

	userID := claims.ID

	cart, err := models.GetCartByUserID(userID)
	if err != nil {
		oc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "No active cart found"})
		return
	}

	// change status to "ordered" of all order_items in the cart
	if len(cart.Items) == 0 {
		oc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Your cart is empty"})
		return
	}

	for _, item := range cart.Items {
		if err := item.UpdateStatus("ordered"); err != nil {
			oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to update item status"})
			return
		}
	}

	total, err := models.CalculateCartTotal(cart.ID)
	if err != nil {
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to calculate total"})
		return
	}

	user, err := models.GetUserByID(userID)
	if err != nil {
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to get user info"})
		return
	}

	if user.Balance < total {
		oc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Insufficient balance"})
		return
	}

	if err := user.UpdateBalance(user.Balance - total); err != nil {
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to update balance"})
		return
	}

	if err := cart.UpdateStatus("ordered"); err != nil {
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Order failed"})
		return
	}

	oc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Your order was placed."})
}

func (oc *OrderController) CancelOrder(w http.ResponseWriter, r *http.Request) {
	type reqBody struct {
		OrderID int `json:"orderId"`
	}
	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		oc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid JSON"})
		return
	}

	order, err := models.GetOrderByID(body.OrderID)
	if err != nil {
		oc.jsonResp(w, http.StatusNotFound, map[string]any{"success": false, "msg": "Order not found"})
		return
	}

	if order.Status != "ordered" {
		oc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "This order cannot be cancelled!"})
		return
	}

	if err := order.Cancel(); err != nil {
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Cancellation failed"})
		return
	}

	user, err := models.GetUserByID(order.UserID)
	if err != nil {
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Internal server error!"})
		return
	}

	if err := user.UpdateBalance(user.Balance + order.TotalAmount); err != nil {
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to refund"})
		return
	}
	oc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Your order was cancelled. AND you WILL be refunded."})
}

func (oc *OrderController) GetUserOrders(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		oc.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Unauthorized"})
		return
	}

	userID := claims.ID

	orders, err := models.GetOrdersByUserID(userID, 0)
	if err != nil {
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to fetch orders"})
		return
	}

	oc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Orders fetched successfully", "orders": orders})
}

func (oc *OrderController) GetUserCart(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		oc.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Unauthorized"})
		return
	}

	userID := claims.ID

	cart, err := models.GetCartByUserID(userID)
	if err != nil {
		if err == sql.ErrNoRows {
			oc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "No active cart", "cart": map[string]any{"id": 0, "total_amount": 0, "items": []any{}, "status": "empty"}})
			return
		}
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to fetch cart"})
		return
	}

	oc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Cart fetched successfully", "cart": cart})
}

func (oc *OrderController) UpdateOrderItemCount(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		oc.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Unauthorized"})
		return
	}
	userID := claims.ID

	type reqBody struct {
		ItemID int    `json:"itemId"`
		Action string `json:"action"`
	}
	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		oc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid JSON"})
		return
	}
	if body.ItemID == 0 || (body.Action != "increase" && body.Action != "decrease") {
		oc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Bad json data"})
		return
	}

	cart, err := models.CreateOrGetCart(userID)
	if err != nil {
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Cart error"})
		return
	}

	switch body.Action {
	case "increase":
		if err := models.IncrementCartItem(cart.ID, body.ItemID, 1); err != nil {
			oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Update failed"})
			return
		}
	case "decrease":
		if err := models.DecrementCartItem(cart.ID, body.ItemID, 1); err != nil {
			oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Update failed"})
			return
		}
	}

	oc.jsonResp(w, http.StatusOK, map[string]any{"success": true})
}

func (ac *OrderController) GetAllItems(w http.ResponseWriter, _ *http.Request) {
	items, err := models.GetAllItems(0)
	if err != nil {
		ac.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to fetch items"})
		return
	}
	ac.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "All items fetched successfully.", "items": items})
}

func (oc *OrderController) RateItem(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		oc.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Unauthorized"})
		return
	}
	userID := claims.ID

	type reqBody struct {
		ItemID int `json:"itemId"`
		Rating int `json:"rating"`
	}
	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.ItemID == 0 || body.Rating < 1 || body.Rating > 5 {
		oc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Bad json data"})
		return
	}

	eligible, err := models.UserBought(userID, body.ItemID)
	if err != nil || !eligible {
		oc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Have some shame. You are reviewing an item which you didn't even bought. No wonder you are a brokie."})
		return
	}
	if already, _ := models.UserReviewed(userID, body.ItemID); already {
		oc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "You've already submitted a review for this item."})
		return
	}
	if err := models.InsertReview(userID, body.ItemID, body.Rating); err != nil {
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Internal server error."})
		return
	}
	oc.jsonResp(w, http.StatusCreated, map[string]any{"success": true, "msg": "Your review was submitted!"})
}

func (oc *OrderController) DeliverOrder(w http.ResponseWriter, r *http.Request) {
	type reqBody struct {
		OrderID int `json:"orderId"`
	}
	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.OrderID == 0 {
		oc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Bad json data"})
		return
	}
	order, err := models.GetOrderByID(body.OrderID)
	if err != nil {
		oc.jsonResp(w, http.StatusNotFound, map[string]any{"success": false, "msg": "Order not found"})
		return
	}
	if err := order.UpdateStatus("delivered"); err != nil {
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed"})
		return
	}
	_ = models.MarkDelivered(order.ID)
	oc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Order marked as delivered."})
}

func (oc *OrderController) GetAllCategories(w http.ResponseWriter, r *http.Request) {
	categories, err := models.GetAllCategories(0)
	if err != nil {
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to fetch categories"})
		return
	}

	oc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Categories fetched successfully", "categories": categories})
}

func (oc *OrderController) GetItemsByCategoryID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	categoryID, err := strconv.Atoi(vars["category_id"])
	if err != nil {
		oc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid category ID"})
		return
	}

	items, err := models.GetItemsByCategoryID(categoryID)
	if err != nil {
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to fetch items"})
		return
	}

	category, err := models.GetCategoryByID(categoryID)
	if err != nil {
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to fetch items"})
		return
	}

	oc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Items fetched successfully", "items": items, "category": category})
}

func (oc *OrderController) GetItemByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	itemID, err := strconv.Atoi(vars["item_id"])
	if err != nil {
		oc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid item ID"})
		return
	}

	item, err := models.GetItemByID(itemID)
	if err != nil {
		if err == sql.ErrNoRows {
			oc.jsonResp(w, http.StatusNotFound, map[string]any{"success": false, "msg": "Item not found"})
			return
		}
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to fetch item"})
		return
	}

	oc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Item fetched successfully", "item": item})
}

func (oc *OrderController) HomePageItems(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetUserClaims(r)
	if !ok {
		oc.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Unauthorized"})
		return
	}

	items, err := models.GetAllItems(3)
	if err != nil {
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to fetch items"})
		return
	}

	oc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Homepage items fetched successfully", "items": items})
}

func (oc *OrderController) HomePageOrders(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		oc.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Unauthorized"})
		return
	}

	userID := claims.ID
	orders, err := models.GetOrdersByUserID(userID, 3)
	if err != nil {
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to fetch orders"})
		return
	}

	oc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Homepage orders fetched successfully", "orders": orders})
}

func (oc *OrderController) HomePageCategories(w http.ResponseWriter, r *http.Request) {
	categories, err := models.GetAllCategories(6)
	if err != nil {
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to fetch categories"})
		return
	}

	oc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "All categories fetched successfully.", "categories": categories})
}
