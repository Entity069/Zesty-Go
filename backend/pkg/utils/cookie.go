package utils

import (
	"net/http"
	"time"
)

const cname = "token"

func GetToken(r *http.Request) (string, error) {
	c, err := r.Cookie(cname)
	if err != nil {
		return "", err
	}
	return c.Value, nil
}

func ClearCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     cname,
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
}
