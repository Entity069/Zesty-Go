package controllers

import (
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

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

func (uc *UserController) saveProfilePic(file multipart.File, header *multipart.FileHeader) (string, error) {
	uploadsDir := filepath.Join(".", "uploads", "user")
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
	filename := fmt.Sprintf("profile_%d%s", timestamp, ext)
	filePath := filepath.Join(uploadsDir, filename)

	dst, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %v", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return "", fmt.Errorf("failed to save file: %v", err)
	}

	return "/uploads/user/" + filename, nil
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

	contentType := r.Header.Get("Content-Type")
	isMultipart := strings.Contains(contentType, "multipart/form-data")

	var firstName, lastName, email, address, currentPwd, newPassword string
	var profilePicPath string
	var updateProfilePic bool

	if isMultipart {
		if err := r.ParseMultipartForm(10 << 20); err != nil { // 10MB max
			uc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Failed to parse form data"})
			return
		}

		firstName = r.FormValue("first_name")
		lastName = r.FormValue("last_name")
		email = r.FormValue("email")
		address = r.FormValue("addr")
		currentPwd = r.FormValue("currPwd")
		newPassword = r.FormValue("newPwd")

		file, header, err := r.FormFile("profilePic")
		if err == nil {
			defer file.Close()

			profilePicPath, err = uc.saveProfilePic(file, header)
			if err != nil {
				uc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": err.Error()})
				return
			}
			updateProfilePic = true
		}
	} else {
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

		firstName = body.FirstName
		lastName = body.LastName
		email = body.Email
		address = body.Address
		currentPwd = body.CurrentPwd
		newPassword = body.NewPassword
	}

	if firstName == "" || lastName == "" || email == "" || currentPwd == "" {
		uc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Please fill in all required fields"})
		return
	}

	user, err := models.GetUserByID(userID)
	if err != nil {
		uc.jsonResp(w, http.StatusNotFound, map[string]any{"success": false, "msg": "User not found"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(currentPwd)); err != nil {
		uc.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid current password"})
		return
	}

	oldProfilePicPath := user.ProfilePic

	user.FirstName = firstName
	user.LastName = lastName
	user.Address = address

	if updateProfilePic {
		user.ProfilePic = profilePicPath
	}

	if newPassword != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), 10)
		if err != nil {
			if updateProfilePic && profilePicPath != "" {
				os.Remove(filepath.Join(".", strings.TrimPrefix(profilePicPath, "/")))
			}
			uc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Password hashing failed"})
			return
		}
		user.Password = string(hashedPassword)
	}

	if user.Email != email {
		user.Email = email
		user.IsVerified = false
	}

	if err := user.Update(); err != nil {
		if updateProfilePic && profilePicPath != "" {
			os.Remove(filepath.Join(".", strings.TrimPrefix(profilePicPath, "/")))
		}
		uc.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Update failed"})
		return
	}

	if updateProfilePic && oldProfilePicPath != "/placeholder.svg" && oldProfilePicPath != profilePicPath && strings.Contains(contentType, "multipart/form-data") {
		go func() {
			os.Remove(filepath.Join(".", strings.TrimPrefix(oldProfilePicPath, "/")))
		}()
	}
	response := map[string]any{
		"success":     true,
		"msg":         "Profile updated successfully.",
		"is_verified": user.IsVerified,
	}
	if updateProfilePic {
		response["profile_pic"] = user.ProfilePic
	}

	uc.jsonResp(w, http.StatusOK, response)
}
