package models

import (
	"time"
)

type User struct {
	ID         int       `json:"id"`
	ProfilePic string    `json:"profile_pic"`
	FirstName  string    `json:"first_name"`
	LastName   string    `json:"last_name"`
	UserType   string    `json:"user_type"`
	Password   string    `json:"password"`
	Email      string    `json:"email"`
	Address    string    `json:"address"`
	Balance    float64   `json:"balance"`
	IsVerified bool      `json:"is_verified"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (u *User) Create() error {
	query := `INSERT INTO users (profile_pic, first_name, last_name, user_type, password, email, address, balance, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

	result, err := DB.Exec(query, u.ProfilePic, u.FirstName, u.LastName, u.UserType, u.Password, u.Email, u.Address, u.Balance, u.IsVerified)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	u.ID = int(id)
	return nil
}

func (u *User) Update() error {
	query := `UPDATE users SET profile_pic = ?, first_name = ?, last_name = ?, user_type = ?, email = ?, address = ?, balance = ?, is_verified = ? WHERE id = ?`

	_, err := DB.Exec(query, u.ProfilePic, u.FirstName, u.LastName, u.UserType,
		u.Email, u.Address, u.Balance, u.IsVerified, u.ID)
	return err
}

func (u *User) UpdatePassword(newPassword string) error {
	query := `UPDATE users SET password = ? WHERE id = ?`
	_, err := DB.Exec(query, newPassword, u.ID)
	if err == nil {
		u.Password = newPassword
	}
	return err
}

func (u *User) UpdateBalance(newBalance float64) error {
	query := `UPDATE users SET balance = ? WHERE id = ?`
	_, err := DB.Exec(query, newBalance, u.ID)
	if err == nil {
		u.Balance = newBalance
	}
	return err
}

func (u *User) Delete() error {
	query := `DELETE FROM users WHERE id = ?`
	_, err := DB.Exec(query, u.ID)
	return err
}

func (u *User) EmailVerify() error {
	query := `UPDATE users SET is_verified = true WHERE id = ?`
	_, err := DB.Exec(query, u.ID)
	if err == nil {
		u.IsVerified = true
	}
	return err
}

func GetUserByID(id int) (*User, error) {
	user := &User{}
	query := `SELECT id, profile_pic, first_name, last_name, user_type, password, email, address, balance, is_verified, created_at, updated_at FROM users WHERE id = ?`

	err := DB.QueryRow(query, id).Scan(
		&user.ID, &user.ProfilePic, &user.FirstName, &user.LastName, &user.UserType,
		&user.Password, &user.Email, &user.Address, &user.Balance, &user.IsVerified,
		&user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func GetUserByEmail(email string) (*User, error) {
	user := &User{}
	query := `SELECT id, profile_pic, first_name, last_name, user_type, password, email, address, balance, is_verified, created_at, updated_at FROM users WHERE email = ?`

	err := DB.QueryRow(query, email).Scan(
		&user.ID, &user.ProfilePic, &user.FirstName, &user.LastName, &user.UserType,
		&user.Password, &user.Email, &user.Address, &user.Balance, &user.IsVerified,
		&user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func GetAllUsers() ([]*User, error) {
	query := `SELECT id, profile_pic, first_name, last_name, user_type, password, email, address, balance, is_verified, created_at, updated_at FROM users ORDER BY created_at DESC`

	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*User
	for rows.Next() {
		user := &User{}
		err := rows.Scan(
			&user.ID, &user.ProfilePic, &user.FirstName, &user.LastName, &user.UserType,
			&user.Password, &user.Email, &user.Address, &user.Balance, &user.IsVerified,
			&user.CreatedAt, &user.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}
