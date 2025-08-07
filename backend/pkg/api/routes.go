package api

import (
	"net/http"

	"github.com/gorilla/mux"

	"github.com/Entity069/Zesty-Go/pkg/controllers"
	"github.com/Entity069/Zesty-Go/pkg/middleware"
)

func NewRouter() *mux.Router {
	r := mux.NewRouter()

	authC := controllers.NewAuthController()
	adminC := controllers.NewAdminController()
	orderC := controllers.NewOrderController()
	sellerC := controllers.NewSellerController()
	userC := controllers.NewUserController()

	r.HandleFunc("/api/auth/register", authC.Register).Methods(http.MethodPost)
	r.HandleFunc("/api/auth/login", authC.Login).Methods(http.MethodPost)
	r.HandleFunc("/api/auth/logout", authC.Logout).Methods(http.MethodGet)
	r.HandleFunc("/api/auth/verify", authC.VerifyEmail).Methods(http.MethodGet)
	r.HandleFunc("/api/auth/forgot-password", authC.ResetPassword).Methods(http.MethodPost)
	r.HandleFunc("/api/auth/reset-password", authC.PostResetPassword).Methods(http.MethodPost)

	ord := r.PathPrefix("/api/order").Subrouter()
	ord.Use(middleware.VerifyToken, middleware.LoginRequired, middleware.UserRequired)
	ord.HandleFunc("/add-to-cart", orderC.AddToCart).Methods(http.MethodPost)
	ord.HandleFunc("/place-order", orderC.PlaceOrder).Methods(http.MethodPost)
	ord.HandleFunc("/cancel-order", orderC.CancelOrder).Methods(http.MethodPost)
	ord.HandleFunc("/update-count", orderC.UpdateOrderItemCount).Methods("POST")

	usr := r.PathPrefix("/api/user").Subrouter()
	usr.Use(middleware.VerifyToken, middleware.LoginRequired)
	usr.HandleFunc("/update-balance", userC.UpdateBalance).Methods(http.MethodPost)
	usr.HandleFunc("/update-address", userC.UpdateAddress).Methods(http.MethodPost)
	usr.HandleFunc("/update-details", userC.UpdateDetails).Methods(http.MethodPost)

	ad := r.PathPrefix("/api/admin").Subrouter()
	ad.Use(middleware.VerifyToken, middleware.LoginRequired, middleware.AdminRequired)
	ad.HandleFunc("/all-orders", adminC.AllOrders).Methods(http.MethodGet)
	ad.HandleFunc("/all-users", adminC.AllUsers).Methods(http.MethodGet)
	ad.HandleFunc("/all-categories", adminC.AllCategories).Methods(http.MethodGet)
	ad.HandleFunc("/edit-user", adminC.UpdateUser).Methods(http.MethodPost)
	ad.HandleFunc("/add-category", adminC.AddCategory).Methods(http.MethodPost)
	ad.HandleFunc("/edit-category", adminC.EditCategory).Methods(http.MethodPost)
	ad.HandleFunc("/all-items", adminC.AllItems).Methods("GET")

	sel := r.PathPrefix("/api/seller").Subrouter()
	sel.Use(middleware.VerifyToken, middleware.LoginRequired, middleware.SellerRequired)
	sel.HandleFunc("/all-items", sellerC.GetSellerItems).Methods(http.MethodGet)
	sel.HandleFunc("/current-orders", sellerC.GetSellerOrders).Methods(http.MethodGet)
	sel.HandleFunc("/add-item", sellerC.AddItem).Methods(http.MethodPost)
	sel.HandleFunc("/edit-item", sellerC.UpdateItem).Methods(http.MethodPost)
	sel.HandleFunc("/current-orders/update", sellerC.UpdateItemStatus).Methods(http.MethodPost)

	return r
}
