package controllers

import (
	"encoding/json"
	"net/http"

	"github.com/Entity069/Zesty-Go/pkg/models"
)

type AdminController struct{}

func NewAdminController() *AdminController {
	return &AdminController{}
}

func (ac *AdminController) jsonResp(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func (ac *AdminController) AllOrders(w http.ResponseWriter, r *http.Request) {
	orders, err := models.GetAllOrders()
	if err != nil {
		ac.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to fetch orders"})
		return
	}

	ac.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "All orders fetched successfully.", "orders": orders})
}

func (ac *AdminController) AllUsers(w http.ResponseWriter, r *http.Request) {
	users, err := models.GetAllUsers()
	if err != nil {
		ac.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to fetch users"})
		return
	}

	ac.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "All users fetched successfully.", "users": users})
}

func (ac *AdminController) UpdateUserByAdmin(w http.ResponseWriter, r *http.Request) {
	type reqBody struct {
		ID        int    `json:"id"`
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Email     string `json:"email"`
		UserType  string `json:"user_type"`
	}

	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		ac.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid JSON"})
		return
	}

	user, err := models.GetUserByID(body.ID)
	if err != nil {
		ac.jsonResp(w, http.StatusNotFound, map[string]any{"success": false, "msg": "User not found"})
		return
	}

	user.FirstName = body.FirstName
	user.LastName = body.LastName
	user.UserType = body.UserType

	if err := user.Update(); err != nil {
		ac.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Update failed"})
		return
	}

	ac.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "User updated successfully."})
}

func (ac *AdminController) AllCategories(w http.ResponseWriter, r *http.Request) {
	categories, err := models.GetAllCategories()
	if err != nil {
		ac.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to fetch categories"})
		return
	}

	ac.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "All categories fetched successfully.", "categories": categories})
}

func (ac *AdminController) AddCategory(w http.ResponseWriter, r *http.Request) {
	type reqBody struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}

	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		ac.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid JSON"})
		return
	}

	category := &models.Category{
		Name:        body.Name,
		Description: body.Description,
	}

	if err := category.Create(); err != nil {
		ac.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to create category"})
		return
	}

	ac.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Category added successfully."})
}

func (ac *AdminController) EditCategory(w http.ResponseWriter, r *http.Request) {
	type reqBody struct {
		ID          int    `json:"id"`
		Name        string `json:"name"`
		Description string `json:"description"`
	}

	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		ac.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid JSON"})
		return
	}

	category, err := models.GetCategoryByID(body.ID)
	if err != nil {
		ac.jsonResp(w, http.StatusNotFound, map[string]any{"success": false, "msg": "Category not found"})
		return
	}

	category.Name = body.Name
	category.Description = body.Description

	if err := category.Update(); err != nil {
		ac.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Update failed"})
		return
	}

	ac.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Category updated successfully."})
}

func (ac *AdminController) AllItems(w http.ResponseWriter, _ *http.Request) {
	items, err := models.GetAllItems()
	if err != nil {
		ac.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to fetch items"})
		return
	}
	ac.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "All items fetched successfully.", "items": items})
}

func (ac *AdminController) UpdateItemStatus(w http.ResponseWriter, r *http.Request) {
	type reqBody struct {
		ItemID int    `json:"itemId"`
		Status string `json:"status"`
	}
	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.ItemID == 0 || body.Status == "" {
		ac.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Bad json data"})
		return
	}
	item, err := models.GetItemByID(body.ItemID)
	if err != nil {
		ac.jsonResp(w, http.StatusNotFound, map[string]any{"success": false, "msg": "Item not found"})
		return
	}
	item.Status = body.Status
	if err := item.Update(); err != nil {
		ac.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Update failed"})
		return
	}
	ac.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Item status updated successfully."})
}
