package config_test

import (
	"os"
	"reflect"
	"testing"
	"time"

	"github.com/Entity069/Zesty-Go/pkg/config"
	"github.com/Entity069/Zesty-Go/pkg/middleware"
	"github.com/golang-jwt/jwt/v5"
)

func createToken(t *testing.T, claims jwt.MapClaims, secret []byte) string {
	t.Helper()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	s, err := token.SignedString(secret)
	if err != nil {
		t.Fatalf("failed to create token: %v", err)
	}
	return s
}

func TestDBConnString(t *testing.T) {
	os.Setenv("DB_HOST", "srv")
	os.Setenv("DB_PORT", "3307")
	os.Setenv("DB_USER", "zee")
	os.Setenv("DB_PASS", "secret")
	os.Setenv("DB_NAME", "zesty")

	want := "zee:secret@tcp(srv:3307)/zesty?parseTime=true"

	got := config.DBConnString()

	if got != want {
		t.Fatalf("DBConnString() = %s, want %s", got, want)
	}
}

func TestJWTSecret(t *testing.T) {
	os.Setenv("JWT_SECRET", "topsecret")
	got := config.JWTSecret()
	want := []byte("topsecret")

	if !reflect.DeepEqual(got, want) {
		t.Fatalf("JWTSecret() = %v, want %v", got, want)
	}
}

func TestLoadEmailConfig(t *testing.T) {
	os.Setenv("EMAIL_ADDRESS", "heyjude@dontmake.it")
	os.Setenv("EMAIL_APP_PASSWORD", "superpassword69")
	os.Setenv("EMAIL_PORT", "587")
	os.Setenv("EMAIL_SMTP_HOST", "smtp.dontmake.it")

	want := config.EmailConfig{
		Address:  "heyjude@dontmake.it",
		Password: "superpassword69",
		Port:     "587",
		Host:     "smtp.dontmake.it",
	}

	got := config.LoadEmailConfig()

	if !reflect.DeepEqual(got, want) {
		t.Fatalf("LoadEmailConfig() = %+v, want %+v", got, want)
	}
}

func TestValidateTokenSuccess(t *testing.T) {
	secret := config.JWTSecret()
	claims := jwt.MapClaims{
		"id":   69,
		"role": "admin",
		"exp":  time.Now().Add(1 * time.Hour).Unix(),
	}
	tokenStr := createToken(t, claims, secret)

	userClaims, err := middleware.ValidateToken(tokenStr)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if userClaims.ID != 69 || userClaims.Role != "admin" {
		t.Fatalf("unexpected claims: %+v", userClaims)
	}
}

func TestValidateTokenExpired(t *testing.T) {
	secret := config.JWTSecret()
	claims := jwt.MapClaims{
		"id":   69,
		"role": "user",
		"exp":  time.Now().Add(-1 * time.Hour).Unix(),
	}
	tokenStr := createToken(t, claims, secret)

	_, err := middleware.ValidateToken(tokenStr)
	if err == nil {
		t.Fatal("expected expiration error, got nil")
	}
}

func TestValidateTokenWrong(t *testing.T) {
	badSecret := []byte("obviouslyawrongkey69")
	claims := jwt.MapClaims{
		"id":   "69",
		"role": "seller",
		"exp":  time.Now().Add(1 * time.Hour).Unix(),
	}
	tokenStr := createToken(t, claims, badSecret)

	_, err := middleware.ValidateToken(tokenStr)
	if err == nil {
		t.Fatal("expected signature error, got nil")
	}
}
