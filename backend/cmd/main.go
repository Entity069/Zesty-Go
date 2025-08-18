package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gorilla/handlers"
	"github.com/joho/godotenv"

	"github.com/Entity069/Zesty-Go/pkg/api"
	"github.com/Entity069/Zesty-Go/pkg/config"
	"github.com/Entity069/Zesty-Go/pkg/models"
)

func main() {
	_ = godotenv.Load()

	models.InitDB()
	defer func() {
		if err := models.CloseDB(); err != nil {
			log.Printf("nay: error closing DB: %v", err)
		}
	}()

	models.StartCacheCleanup()

	router := api.NewRouter()

	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{
			config.FrontendUrl(),
		}),
		handlers.AllowedMethods([]string{"GET", "POST"}),
		handlers.AllowedHeaders([]string{
			"Accept",
			"Content-Type",
			"Content-Length",
			"Accept-Encoding",
			"X-CSRF-Token",
		}),
		handlers.AllowCredentials(),
	)(router)

	addr := config.SiteName()

	srv := &http.Server{
		Addr:              addr,
		Handler:           corsHandler,
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		log.Printf("app listening on %s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("nay: server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("shutting down...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("nay: graceful shutdown failed: %v", err)
	}
	log.Println("server exited")
}
