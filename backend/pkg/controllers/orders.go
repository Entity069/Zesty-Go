package controllers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/Entity069/Zesty-Go/pkg/middleware"
	"github.com/Entity069/Zesty-Go/pkg/models"
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

	oc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Your order was cancelled. But you won't be refunded."})
}

func (oc *OrderController) GetUserOrders(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		oc.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Unauthorized"})
		return
	}

	userID := claims.ID

	orders, err := models.GetOrdersByUserID(userID)
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
		oc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Item not eligible for rating"})
		return
	}
	if already, _ := models.UserReviewed(userID, body.ItemID); already {
		oc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Already reviewed"})
		return
	}
	if err := models.InsertReview(userID, body.ItemID, body.Rating); err != nil {
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Insert failed"})
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
