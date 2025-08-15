package controllers

import (
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

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

func (sc *SellerController) saveUploadedFile(file multipart.File, header *multipart.FileHeader) (string, error) {
	uploadsDir := filepath.Join(".", "uploads", "item-images")
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create upload directory: %v", err)
	}

	allowed := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".webp": true,
	}

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowed[ext] {
		return "", fmt.Errorf("invalid file type. Only images are allowed")
	}

	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("%d_%s", timestamp, header.Filename)
	filePath := filepath.Join(uploadsDir, filename)

	dst, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %v", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return "", fmt.Errorf("failed to save file: %v", err)
	}

	return "/uploads/item-images/" + filename, nil
}

func (sc *SellerController) AddItem(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		sc.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Unauthorized"})
		return
	}

	sellerID := claims.ID

	if err := r.ParseMultipartForm(10 << 20); err != nil { // 10MB max
		sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Failed to parse form data"})
		return
	}

	name := r.FormValue("name")
	description := r.FormValue("description")
	priceStr := r.FormValue("price")
	categoryIDStr := r.FormValue("category")
	status := r.FormValue("status")

	if name == "" || description == "" || priceStr == "" || categoryIDStr == "" || status == "" {
		sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Please input all the fields"})
		return
	}

	price, err := strconv.ParseFloat(priceStr, 64)
	if err != nil || price <= 0 {
		sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid price"})
		return
	}

	categoryID, err := strconv.Atoi(categoryIDStr)
	if err != nil || categoryID == 0 {
		sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid category"})
		return
	}

	if _, err := models.GetCategoryByID(categoryID); err != nil {
		sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid category"})
		return
	}

	var imagePath string
	file, header, err := r.FormFile("itemImage")
	if err != nil {
		imagePath = "/placeholder.svg"
	} else {
		defer file.Close()

		imagePath, err = sc.saveUploadedFile(file, header)
		if err != nil {
			sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": err.Error()})
			return
		}
	}

	item := &models.Item{
		SellerID:    sellerID,
		Name:        name,
		Description: description,
		Price:       price,
		CategoryID:  categoryID,
		Status:      status,
		Image:       imagePath,
	}

	if err := item.Create(); err != nil {
		if imagePath != "/placeholder.svg" {
			cleanupPath := filepath.Join(".", strings.TrimPrefix(imagePath, "/"))
			os.Remove(cleanupPath)
		}
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

	sellerID := claims.ID

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

	sellerID := claims.ID

	contentType := r.Header.Get("Content-Type")

	var itemID int
	var name, description, priceStr, categoryIDStr, status string
	var imagePath string
	var updateImage bool

	if strings.Contains(contentType, "multipart/form-data") {
		if err := r.ParseMultipartForm(10 << 20); err != nil {
			sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Failed to parse form data"})
			return
		}

		idStr := r.FormValue("id")
		name = r.FormValue("name")
		description = r.FormValue("description")
		priceStr = r.FormValue("price")
		categoryIDStr = r.FormValue("category")
		status = r.FormValue("status")

		var err error
		itemID, err = strconv.Atoi(idStr)
		if err != nil {
			sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid item ID"})
			return
		}

		file, header, err := r.FormFile("itemImage")
		if err == nil {
			defer file.Close()

			imagePath, err = sc.saveUploadedFile(file, header)
			if err != nil {
				sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": err.Error()})
				return
			}
			updateImage = true
		}
	} else {
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

		itemID = body.ID
		name = body.Name
		description = body.Description
		priceStr = fmt.Sprintf("%.2f", body.Price)
		categoryIDStr = fmt.Sprintf("%d", body.CategoryID)
		status = body.Status
		if body.Image != "" {
			imagePath = body.Image
			updateImage = true
		}
	}

	if name == "" || description == "" || priceStr == "" || categoryIDStr == "" || status == "" {
		sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Please input all the fields"})
		return
	}

	price, err := strconv.ParseFloat(priceStr, 64)
	if err != nil || price <= 0 {
		sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid price"})
		return
	}

	categoryID, err := strconv.Atoi(categoryIDStr)
	if err != nil || categoryID == 0 {
		sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid category"})
		return
	}

	item, err := models.GetItemByID(itemID)
	if err != nil {
		sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "No such item exists!"})
		return
	}

	if item.SellerID != sellerID {
		sc.jsonResp(w, http.StatusForbidden, map[string]any{"success": false, "msg": "Go away and never show your face!"})
		return
	}

	oldImagePath := item.Image

	item.Name = name
	item.Description = description
	item.Price = price
	item.CategoryID = categoryID
	item.Status = status
	if updateImage {
		item.Image = imagePath
	}

	if err := item.Update(); err != nil {
		if updateImage && imagePath != "/placeholder.svg" && strings.Contains(contentType, "multipart/form-data") {
			os.Remove(strings.TrimPrefix(imagePath, "/"))
		}
		sc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Update failed"})
		return
	}

	if updateImage && oldImagePath != "/placeholder.svg" && oldImagePath != imagePath && strings.Contains(contentType, "multipart/form-data") {
		go func() {
			os.Remove(strings.TrimPrefix(oldImagePath, "/"))
		}()
	}

	sc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Item edited successfully."})
}

func (sc *SellerController) GetSellerOrders(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		sc.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Unauthorized"})
		return
	}

	sellerID := claims.ID

	orders, err := models.GetOrdersBySellerID(sellerID, 0)
	if err != nil {
		sc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to fetch orders"})
		return
	}

	sc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "All orders fetched successfully!", "orders": orders})
}

func (sc *SellerController) GetSellerStats(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		sc.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Unauthorized"})
		return
	}

	sellerID := claims.ID

	revenue, _ := models.GetSellerRevenue(sellerID)
	itemCount, _ := models.GetSellerItemCount(sellerID)
	orderCount, _ := models.GetSellerOrderCount(sellerID)
	customerCount, _ := models.GetSellerCustomerCount(sellerID)

	sc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "data": map[string]any{"revenue": revenue, "items": itemCount, "orders": orderCount, "customers": customerCount}})
}

func (sc *SellerController) UpdateOrderItemStatus(w http.ResponseWriter, r *http.Request) {
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

	item, err := models.GetOrderItemByID(body.ID)
	if err != nil {
		sc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "No such item exists!"})
		return
	}

	if item.Status == "ordered" {
		item.Status = "preparing"
	} else if item.Status == "preparing" {
		item.Status = "prepared"
	}

	if err := item.UpdateStatus(item.Status); err != nil {
		sc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Update failed"})
		return
	}

	err = models.SyncStatus(item.OrderID)
	if err != nil {
		sc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to sync status"})
		return
	}

	sc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Item status updated successfully."})
}
