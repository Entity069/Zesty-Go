package controllers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/Entity069/Zesty-Go/pkg/config"
	"github.com/Entity069/Zesty-Go/pkg/models"
	"github.com/Entity069/Zesty-Go/pkg/utils"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthController struct{}

func NewAuthController() *AuthController {
	return &AuthController{}
}

func (ac *AuthController) jsonResp(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func (ac *AuthController) getEmailFromJWT(tokenStr string) (string, error) {
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (any, error) {
		return config.JWTSecret(), nil
	})
	if err != nil {
		return "", err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", errors.New("invalid claims")
	}

	email, ok := claims["email"].(string)
	if !ok {
		return "", errors.New("email not found in token")
	}

	return email, nil
}

func (ac *AuthController) Register(w http.ResponseWriter, r *http.Request) {
	type reqBody struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Password  string `json:"password"`
		Email     string `json:"email"`
		Address   string `json:"address"`
	}

	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		ac.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid JSON"})
		return
	}

	if body.FirstName == "" || body.LastName == "" || body.Email == "" || body.Password == "" || body.Address == "" {
		ac.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Some fields are missing!"})
		return
	}

	if existingUser, _ := models.GetUserByEmail(body.Email); existingUser != nil {
		ac.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "User already exists!"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.Password), 10)
	if err != nil {
		ac.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Hashing failed"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": body.Email,
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, _ := token.SignedString(config.JWTSecret())

	activationURL := fmt.Sprintf("http://%s/api/auth/verify?token=%s", config.SiteName(), tokenString)

	emailData := map[string]string{"activation_url": activationURL}
	if err := utils.SendEmail(body.Email, "Action Required [Zesty]", "templates/email/confirm.html", emailData); err != nil {
		ac.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to send confirmation email."})
		return
	}

	user := &models.User{
		ProfilePic: "https://s3.tebi.io/zesty-test/80216737.jpeg",
		FirstName:  body.FirstName,
		LastName:   body.LastName,
		Password:   string(hashedPassword),
		Email:      body.Email,
		Address:    body.Address,
		UserType:   "user",
		Balance:    0,
		IsVerified: false,
	}

	if err := user.Create(); err != nil {
		ac.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Registration failed"})
		return
	}

	ac.jsonResp(w, http.StatusCreated, map[string]any{"success": true, "msg": "User registered successfully! Please check your email for a confirmation email."})
}

func (ac *AuthController) Login(w http.ResponseWriter, r *http.Request) {
	type reqBody struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		ac.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid JSON"})
		return
	}

	if body.Email == "" || body.Password == "" {
		ac.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Email and password are required!"})
		return
	}

	user, err := models.GetUserByEmail(body.Email)
	if err != nil {
		ac.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid Credentials!"})
		return
	}

	if !user.IsVerified {
		ac.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "You need to activate your account first."})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password)); err != nil {
		ac.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid Credentials!"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":   user.ID,
		"role": user.UserType,
		"exp":  time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, _ := token.SignedString(config.JWTSecret())

	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    tokenString,
		Path:     "/",
		HttpOnly: true,
		MaxAge:   24 * 60 * 60,
		SameSite: http.SameSiteLaxMode,
	})

	ac.jsonResp(w, http.StatusCreated, map[string]any{"success": true, "msg": "You will be redirected in a minute..."})
}

func (ac *AuthController) Logout(w http.ResponseWriter, r *http.Request) {
	utils.ClearCookie(w)
	http.Redirect(w, r, "/", http.StatusFound)
}

func (ac *AuthController) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	tokenString := r.URL.Query().Get("token")
	if tokenString == "" {
		ac.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Missing token"})
		return
	}

	email, err := ac.getEmailFromJWT(tokenString)
	if err != nil {
		ac.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid token"})
		return
	}

	user, err := models.GetUserByEmail(email)
	if err != nil {
		ac.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "User not found"})
		return
	}

	if err := user.EmailVerify(); err != nil {
		ac.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Verification failed"})
		return
	}

	ac.jsonResp(w, http.StatusCreated, map[string]any{"success": true, "msg": "Your email has been verified successfully!"})
}

func (ac *AuthController) ResetPassword(w http.ResponseWriter, r *http.Request) {
	type reqBody struct {
		Email string `json:"email"`
	}

	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		ac.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid JSON"})
		return
	}

	user, err := models.GetUserByEmail(body.Email)
	if err != nil {
		ac.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid user!"})
		return
	}

	// reset token secret = user password hash + updated_at
	// this ensures that the jwt signatrue changes if the password is updated
	// prevents replay attacks
	key := fmt.Appendf(nil, "%s%s", user.Password, user.UpdatedAt.String())
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": body.Email,
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, _ := token.SignedString(key)

	resetURL := fmt.Sprintf("http://%s/pwd-reset?token=%s", config.SiteName(), tokenString)
	emailData := map[string]string{"reset_url": resetURL}

	if err := utils.SendEmail(body.Email, "Action Required [Zesty]", "templates/email/forgot.html", emailData); err != nil {
		ac.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Failed to send password reset email."})
		return
	}

	ac.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "An email has been send to your email."})
}

func (ac *AuthController) PostResetPassword(w http.ResponseWriter, r *http.Request) {
	tokenString := r.URL.Query().Get("token")
	if tokenString == "" {
		ac.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Missing token"})
		return
	}

	email, err := ac.getEmailFromJWT(tokenString)
	if err != nil {
		ac.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid token"})
		return
	}

	type reqBody struct {
		Password string `json:"password"`
	}
	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Password == "" {
		ac.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid payload"})
		return
	}

	user, err := models.GetUserByEmail(email)
	if err != nil {
		ac.jsonResp(w, http.StatusBadRequest, map[string]any{"success": false, "msg": "Invalid user!"})
		return
	}

	key := []byte(fmt.Sprintf("%s%s", user.Password, user.UpdatedAt.String()))
	_, err = jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		return key, nil
	})
	if err != nil {
		ac.jsonResp(w, http.StatusUnauthorized, map[string]any{"success": false, "msg": "Invalid token"})
		return
	}

	newHash, err := bcrypt.GenerateFromPassword([]byte(body.Password), 10)
	if err != nil {
		ac.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Hashing failed"})
		return
	}

	if err := user.UpdatePassword(string(newHash)); err != nil {
		ac.jsonResp(w, http.StatusInternalServerError, map[string]any{"success": false, "msg": "Update failed"})
		return
	}

	ac.jsonResp(w, http.StatusOK, map[string]any{"success": true, "msg": "Password Updated Successfully!"})
}
