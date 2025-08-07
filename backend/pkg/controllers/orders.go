package controllers

import (
	"encoding/json"
	"net/http"
	"strconv"

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

	userID, _ := strconv.Atoi(claims.ID)

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

	userID, _ := strconv.Atoi(claims.ID)

	cart, err := models.GetCartByUserID(userID)
	if err != nil {
		oc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "No active cart found"})
		return
	}

	// TODO: calc total, check balance, update status

	if err := cart.UpdateStatus("ordered"); err != nil {
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Order placement failed"})
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

	userID, _ := strconv.Atoi(claims.ID)

	orders, err := models.GetOrdersByUserID(userID)
	if err != nil {
		oc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to fetch orders"})
		return
	}

	oc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "orders": orders})
}
