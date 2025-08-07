package controllers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Entity069/Zesty-Go/pkg/middleware"
	"github.com/Entity069/Zesty-Go/pkg/models"
)

type SellerController struct{}

func NewSellerController() *SellerController {
	return &SellerController{}
}

func (sc *SellerController) jsonResp(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func (sc *SellerController) AddItem(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		sc.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Unauthorized"})
		return
	}

	sellerID, _ := strconv.Atoi(claims.ID)

	type reqBody struct {
		Name        string  `json:"name"`
		Description string  `json:"description"`
		Price       float64 `json:"price"`
		CategoryID  int     `json:"category"`
		Status      string  `json:"status"`
		Image       string  `json:"image"`
	}

	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid JSON"})
		return
	}

	if body.Name == "" || body.Description == "" || body.Price <= 0 || body.CategoryID == 0 || body.Status == "" {
		sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Please input all the fields"})
		return
	}

	if _, err := models.GetCategoryByID(body.CategoryID); err != nil {
		sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid category"})
		return
	}

	item := &models.Item{
		SellerID:    sellerID,
		Name:        body.Name,
		Description: body.Description,
		Price:       body.Price,
		CategoryID:  body.CategoryID,
		Status:      body.Status,
		Image:       body.Image,
	}

	if err := item.Create(); err != nil {
		sc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to add item"})
		return
	}

	sc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Item added successfully."})
}

func (sc *SellerController) GetSellerItems(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		sc.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Unauthorized"})
		return
	}

	sellerID, _ := strconv.Atoi(claims.ID)

	items, err := models.GetItemsBySellerID(sellerID)
	if err != nil {
		sc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to fetch items"})
		return
	}

	sc.jsonResp(w, http.StatusOK, map[string]any{
		"success": true,
		"msg":     "All items fetched successfully!",
		"items":   items,
	})
}

func (sc *SellerController) UpdateItem(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		sc.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Unauthorized"})
		return
	}

	sellerID, _ := strconv.Atoi(claims.ID)

	type reqBody struct {
		ID          int     `json:"id"`
		Name        string  `json:"name"`
		Description string  `json:"description"`
		Price       float64 `json:"price"`
		CategoryID  int     `json:"category"`
		Status      string  `json:"status"`
		Image       string  `json:"image,omitempty"`
	}

	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid JSON"})
		return
	}

	if body.Name == "" || body.Description == "" || body.Price <= 0 || body.CategoryID == 0 || body.Status == "" {
		sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Please input all the fields"})
		return
	}

	item, err := models.GetItemByID(body.ID)
	if err != nil {
		sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "No such item exists!"})
		return
	}

	if item.SellerID != sellerID {
		sc.jsonResp(w, http.StatusForbidden, map[string]any{"success": false, "msg": "Go away and never show your face!"})
		return
	}

	item.Name = body.Name
	item.Description = body.Description
	item.Price = body.Price
	item.CategoryID = body.CategoryID
	item.Status = body.Status
	if body.Image != "" {
		item.Image = body.Image
	}

	if err := item.Update(); err != nil {
		sc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Update failed"})
		return
	}

	sc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Item edited successfully."})
}

func (sc *SellerController) GetSellerOrders(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		sc.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Unauthorized"})
		return
	}

	sellerID, _ := strconv.Atoi(claims.ID)

	orders, err := models.GetOrdersBySellerID(sellerID)
	if err != nil {
		sc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to fetch orders"})
		return
	}

	sc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "All orders fetched successfully!", "orders": orders})
}

func (sc *SellerController) UpdateItemStatus(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetUserClaims(r)
	if !ok {
		sc.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Unauthorized"})
		return
	}

	type reqBody struct {
		ID int `json:"id"`
	}

	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid JSON"})
		return
	}

	if body.ID == 0 {
		sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Item ID is required."})
		return
	}

	orderItem, err := models.GetOrderItemByID(body.ID)
	if err != nil {
		sc.jsonResp(w, http.StatusNotFound, map[string]any{"success": false, "msg": "Order item not found"})
		return
	}

	var newStatus string
	switch orderItem.Status {
	case "ordered":
		newStatus = "preparing"
	case "preparing":
		newStatus = "prepared"
	default:
		newStatus = orderItem.Status
	}

	if err := orderItem.UpdateStatus(newStatus); err != nil {
		sc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Status update failed"})
		return
	}

	order, _ := models.GetOrderByID(orderItem.OrderID)
	if order != nil {
		models.SyncStatus(orderItem.OrderID)
	}

	sc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Item status updated!"})
}

func (sc *SellerController) Dashboard(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		sc.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Unauthorized"})
		return
	}

	sellerID, _ := strconv.Atoi(claims.ID)

	revenue, _ := models.GetSellerRevenue(sellerID)
	itemCount, _ := models.GetSellerItemCount(sellerID)
	orderCount, _ := models.GetSellerOrderCount(sellerID)
	customerCount, _ := models.GetSellerCustomerCount(sellerID)

	sc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "data": map[string]any{"revenue": revenue, "items": itemCount, "orders": orderCount, "customers": customerCount}})
}
