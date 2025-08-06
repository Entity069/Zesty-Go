package models

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/go-sql-driver/mysql"

	"github.com/Entity069/Zesty-Go/pkg/config"
)

var DB *sql.DB

func InitDB() {
	dsn := config.DBConnString()

	var err error
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		panic(fmt.Errorf("models.InitDB: sql.Open failed: %w", err))
	}

	maxOpen := 25
	maxIdle := 5
	maxLife := 5 * time.Minute

	DB.SetMaxOpenConns(maxOpen)
	DB.SetMaxIdleConns(maxIdle)
	DB.SetConnMaxLifetime(maxLife)

	if err := DB.Ping(); err != nil {
		panic(fmt.Errorf("models.InitDB: ping failed: %w", err))
	}

	fmt.Printf("db connected (open=%d, idle=%d, max-life=%s)\n",
		maxOpen, maxIdle, maxLife)
}

func CloseDB() error {
	if DB == nil {
		return nil
	}
	fmt.Println("closing database connection pool...")
	return DB.Close()
}
