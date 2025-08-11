package config

import (
	"fmt"
	"os"
)

type EmailConfig struct {
	Address  string
	Password string
	Port     string
	Host     string
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func DBConnString() string {
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "3306")
	user := getEnv("DB_USER", "rootroot")
	pass := getEnv("DB_PASS", "rootroot")
	name := getEnv("DB_NAME", "zestydb")
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", user, pass, host, port, name)
}

func JWTSecret() []byte {
	secret := getEnv("JWT_SECRET", "thisisnotaproductionkey")
	return []byte(secret)
}

func LoadEmailConfig() EmailConfig {
	address := getEnv("EMAIL_ADDRESS", "")
	if address == "" {
		panic("EMAIL_ADDRESS environment variable is not set!")
	}

	password := getEnv("EMAIL_APP_PASSWORD", "")
	if password == "" {
		panic("EMAIL_APP_PASSWORD environment variable is not set!")
	}

	port := getEnv("EMAIL_PORT", "")
	if port == "" {
		panic("EMAIL_PORT environment variable is not set!")
	}

	host := getEnv("EMAIL_SMTP_HOST", "")
	if host == "" {
		panic("EMAIL_SMTP_HOST environment variable is not set!")
	}

	return EmailConfig{
		Address:  address,
		Password: password,
		Port:     port,
		Host:     host,
	}
}

func SiteName() string {
	site := getEnv("SITE_NAME", "0.0.0.0:3001")
	if site == "" {
		panic("SITE_NAME environment variable is not set!")
	}
	return site
}
