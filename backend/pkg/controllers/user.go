package controllers

import (
	"encoding/json"
	"net/http"

	"github.com/Entity069/Zesty-Go/pkg/middleware"
	"github.com/Entity069/Zesty-Go/pkg/models"
	"golang.org/x/crypto/bcrypt"
)

type UserController struct{}

func NewUserController() *UserController {
	return &UserController{}
}

func (uc *UserController) jsonResp(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func (uc *UserController) UpdateUserAddress(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		uc.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Unauthorized"})
		return
	}

	userID := claims.ID

	type reqBody struct {
		Address string `json:"addr"`
	}
	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		uc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid JSON"})
		return
	}

	user, err := models.GetUserByID(userID)
	if err != nil {
		uc.jsonResp(w, http.StatusNotFound, map[string]any{"success": false, "msg": "User not found"})
		return
	}

	user.Address = body.Address
	if err := user.Update(); err != nil {
		uc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Update failed"})
		return
	}

	uc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Address updated successfully."})
}

func (uc *UserController) UpdateUserBalance(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		uc.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Unauthorized"})
		return
	}

	userID := claims.ID

	type reqBody struct {
		Balance float64 `json:"balance"`
	}
	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		uc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid JSON"})
		return
	}

	if body.Balance <= 0 || body.Balance > 99999999 {
		uc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Balance should be between 0 and 99,999,999!"})
		return
	}

	user, err := models.GetUserByID(userID)
	if err != nil {
		uc.jsonResp(w, http.StatusNotFound, map[string]any{"success": false, "msg": "User not found"})
		return
	}

	if err := user.UpdateBalance(body.Balance + user.Balance); err != nil {
		uc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Update failed"})
		return
	}

	uc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Balance added successfully."})
}

func (uc *UserController) UpdateUserDetails(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		uc.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Unauthorized"})
		return
	}

	userID := claims.ID

	type reqBody struct {
		FirstName   string `json:"first_name"`
		LastName    string `json:"last_name"`
		Email       string `json:"email"`
		Address     string `json:"addr"`
		CurrentPwd  string `json:"currPwd"`
		NewPassword string `json:"newPwd"`
	}
	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		uc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid JSON"})
		return
	}

	user, err := models.GetUserByID(userID)
	if err != nil {
		uc.jsonResp(w, http.StatusNotFound, map[string]any{"success": false, "msg": "User not found"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.CurrentPwd)); err != nil {
		uc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid current password"})
		return
	}

	user.FirstName = body.FirstName
	user.LastName = body.LastName
	user.Address = body.Address

	if body.NewPassword != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.NewPassword), 10)
		if err != nil {
			uc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Password hashing failed"})
			return
		}
		user.Password = string(hashedPassword)
	}

	if user.Email != body.Email {
		user.Email = body.Email
		user.IsVerified = false
	}

	if err := user.Update(); err != nil {
		uc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Update failed"})
		return
	}

	uc.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Profile updated successfully.", "is_verified": user.IsVerified})
}
