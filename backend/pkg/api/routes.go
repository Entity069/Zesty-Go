package api

import (
	"net/http"

	"github.com/gorilla/mux"

	"github.com/Entity069/Zesty-Go/pkg/controllers"
	"github.com/Entity069/Zesty-Go/pkg/middleware"
)

func NewRouter() *mux.Router {
	r := mux.NewRouter()

	authController := controllers.NewAuthController()
	adminController := controllers.NewAdminController()
	orderController := controllers.NewOrderController()
	sellerController := controllers.NewSellerController()
	userController := controllers.NewUserController()

	r.HandleFunc("/api/auth/register", authController.Register).Methods(http.MethodPost)
	r.HandleFunc("/api/auth/whoami", authController.WhoAmI).Methods(http.MethodGet)
	r.HandleFunc("/api/auth/login", authController.Login).Methods(http.MethodPost)
	r.HandleFunc("/api/auth/logout", authController.Logout).Methods(http.MethodGet)
	r.HandleFunc("/api/auth/verify", authController.VerifyEmail).Methods(http.MethodGet)
	r.HandleFunc("/api/auth/forgot-password", authController.ResetPassword).Methods(http.MethodPost)
	r.HandleFunc("/api/auth/reset-password", authController.PostResetPassword).Methods(http.MethodPost)

	orderSubroute := r.PathPrefix("/api/order").Subrouter()
	orderSubroute.Use(middleware.VerifyToken, middleware.LoginRequired, middleware.UserRequired)
	orderSubroute.HandleFunc("/add-to-cart", orderController.AddToCart).Methods(http.MethodPost)
	orderSubroute.HandleFunc("/place-order", orderController.PlaceOrder).Methods(http.MethodPost)
	orderSubroute.HandleFunc("/cancel-order", orderController.CancelOrder).Methods(http.MethodPost)
	orderSubroute.HandleFunc("/update-count", orderController.UpdateOrderItemCount).Methods(http.MethodPost)
	orderSubroute.HandleFunc("/user-cart", orderController.GetUserCart).Methods(http.MethodGet)

	userSubroute := r.PathPrefix("/api/user").Subrouter()
	userSubroute.Use(middleware.VerifyToken, middleware.LoginRequired)
	userSubroute.HandleFunc("/update-balance", userController.UpdateUserBalance).Methods(http.MethodPost)
	userSubroute.HandleFunc("/update-address", userController.UpdateUserAddress).Methods(http.MethodPost)
	userSubroute.HandleFunc("/update-details", userController.UpdateUserDetails).Methods(http.MethodPost)

	adminSubroute := r.PathPrefix("/api/admin").Subrouter()
	adminSubroute.Use(middleware.VerifyToken, middleware.LoginRequired, middleware.AdminRequired)
	adminSubroute.HandleFunc("/all-orders", adminController.AllOrders).Methods(http.MethodGet)
	adminSubroute.HandleFunc("/all-users", adminController.AllUsers).Methods(http.MethodGet)
	adminSubroute.HandleFunc("/all-categories", adminController.AllCategories).Methods(http.MethodGet)
	adminSubroute.HandleFunc("/edit-user", adminController.UpdateUserByAdmin).Methods(http.MethodPost)
	adminSubroute.HandleFunc("/add-category", adminController.AddCategory).Methods(http.MethodPost)
	adminSubroute.HandleFunc("/edit-category", adminController.EditCategory).Methods(http.MethodPost)
	adminSubroute.HandleFunc("/all-items", adminController.AllItems).Methods("GET")

	sellerSubroute := r.PathPrefix("/api/seller").Subrouter()
	sellerSubroute.Use(middleware.VerifyToken, middleware.LoginRequired, middleware.SellerRequired)
	sellerSubroute.HandleFunc("/all-items", sellerController.GetSellerItems).Methods(http.MethodGet)
	sellerSubroute.HandleFunc("/current-orders", sellerController.GetSellerOrders).Methods(http.MethodGet)
	sellerSubroute.HandleFunc("/add-item", sellerController.AddItem).Methods(http.MethodPost)
	sellerSubroute.HandleFunc("/edit-item", sellerController.UpdateItem).Methods(http.MethodPost)
	sellerSubroute.HandleFunc("/current-orders/update", sellerController.UpdateItemStatus).Methods(http.MethodPost)

	return r
}
