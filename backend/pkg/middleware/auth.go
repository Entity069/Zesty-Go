package middleware

import (
	"context"
	"net/http"
	"time"

	"github.com/Entity069/Zesty-Go/pkg/config"
	"github.com/Entity069/Zesty-Go/pkg/utils"
	"github.com/golang-jwt/jwt/v5"
)

type UserClaims struct {
	ID   string `json:"id"`
	Role string `json:"role"`
	jwt.RegisteredClaims
}

type contextKeyUserType struct{}

var contextKeyUser = contextKeyUserType{}

func ValidateToken(tokenStr string) (*UserClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &UserClaims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrTokenUnverifiable
		}
		return config.JWTSecret(), nil
	}, jwt.WithValidMethods([]string{"HS256", "HS384", "HS512"}))
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*UserClaims)
	if !ok || !token.Valid {
		return nil, jwt.ErrTokenInvalidClaims
	}

	if claims.ExpiresAt != nil && time.Now().After(claims.ExpiresAt.Time) {
		return nil, jwt.ErrTokenExpired
	}

	return claims, nil
}

func withUserClaims(ctx context.Context, c *UserClaims) context.Context {
	return context.WithValue(ctx, contextKeyUser, c)
}

func GetUserClaims(r *http.Request) (*UserClaims, bool) {
	v := r.Context().Value(contextKeyUser)
	c, ok := v.(*UserClaims)
	return c, ok
}

// middleware functions
func VerifyToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tok, err := utils.GetToken(r)
		if err != nil || tok == "" {
			http.Redirect(w, r, "/register", http.StatusUnauthorized)
			return
		}

		claims, err := ValidateToken(tok)
		if err != nil {
			utils.ClearCookie(w)
			http.Redirect(w, r, "/register", http.StatusUnauthorized)
			return
		}

		ctx := withUserClaims(r.Context(), claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func RedirectIfIn(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tok, err := utils.GetToken(r)
		if err == nil && tok != "" {
			if claims, err := ValidateToken(tok); err == nil {
				var path string
				switch claims.Role {
				case "admin":
					path = "/admin/dashboard"
				case "seller":
					path = "/seller/dashboard"
				default:
					path = "/home"
				}
				http.Redirect(w, r, path, http.StatusFound)
				return
			}
			utils.ClearCookie(w)
		}
		next.ServeHTTP(w, r)
	})
}

func LoginRequired(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tok, err := utils.GetToken(r)
		if err != nil || tok == "" {
			http.Redirect(w, r, "/login", http.StatusFound)
			return
		}
		if _, err := ValidateToken(tok); err != nil {
			utils.ClearCookie(w)
			http.Redirect(w, r, "/register", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func RoleRequired(requiredRole string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tok, err := utils.GetToken(r)
			if err != nil || tok == "" {
				http.Redirect(w, r, "/login", http.StatusFound)
				return
			}

			claims, err := ValidateToken(tok)
			if err != nil {
				utils.ClearCookie(w)
				http.Redirect(w, r, "/register", http.StatusUnauthorized)
				return
			}

			if claims.Role != requiredRole {
				http.Error(w, "Forbidden", http.StatusForbidden)
				return
			}

			ctx := withUserClaims(r.Context(), claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

var (
	UserRequired   = RoleRequired("user")
	AdminRequired  = RoleRequired("admin")
	SellerRequired = RoleRequired("seller")
)
