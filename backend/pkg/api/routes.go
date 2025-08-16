package api

import (
	"net/http"
	"path/filepath"

	"github.com/gorilla/mux"

	"github.com/Entity069/Zesty-Go/pkg/controllers"
	"github.com/Entity069/Zesty-Go/pkg/middleware"
)

func NewRouter() *mux.Router {
	r := mux.NewRouter()

	uploadsDir := filepath.Join(".", "uploads")
	r.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir(uploadsDir))))

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
	orderSubroute.HandleFunc("/categories", orderController.GetAllCategories).Methods(http.MethodGet)
	orderSubroute.HandleFunc("/categories/{category_id}", orderController.GetItemsByCategoryID).Methods(http.MethodGet)
	orderSubroute.HandleFunc("/item/{item_id}", orderController.GetItemByID).Methods(http.MethodGet)
	orderSubroute.HandleFunc("/add-to-cart", orderController.AddToCart).Methods(http.MethodPost)
	orderSubroute.HandleFunc("/place-order", orderController.PlaceOrder).Methods(http.MethodPost)
	orderSubroute.HandleFunc("/cancel-order", orderController.CancelOrder).Methods(http.MethodPost)
	orderSubroute.HandleFunc("/update-count", orderController.UpdateOrderItemCount).Methods(http.MethodPost)
	orderSubroute.HandleFunc("/user-cart", orderController.GetUserCart).Methods(http.MethodGet)
	orderSubroute.HandleFunc("/user-orders", orderController.GetUserOrders).Methods(http.MethodGet)
	orderSubroute.HandleFunc("/all-items", orderController.GetAllItems).Methods(http.MethodGet)
	orderSubroute.HandleFunc("/rate", orderController.RateItem).Methods(http.MethodPost)

	homeSubroute := r.PathPrefix("/api/home").Subrouter()
	homeSubroute.Use(middleware.VerifyToken, middleware.LoginRequired, middleware.UserRequired)
	homeSubroute.HandleFunc("/categories", orderController.HomePageCategories).Methods(http.MethodGet)
	homeSubroute.HandleFunc("/items", orderController.HomePageItems).Methods(http.MethodGet)
	homeSubroute.HandleFunc("/orders", orderController.HomePageOrders).Methods(http.MethodGet)

	userSubroute := r.PathPrefix("/api/user").Subrouter()
	userSubroute.Use(middleware.VerifyToken, middleware.LoginRequired)
	userSubroute.HandleFunc("/update-balance", userController.UpdateUserBalance).Methods(http.MethodPost)
	userSubroute.HandleFunc("/update-address", userController.UpdateUserAddress).Methods(http.MethodPost)
	userSubroute.HandleFunc("/update-details", userController.UpdateUserDetails).Methods(http.MethodPost)

	adminSubroute := r.PathPrefix("/api/admin").Subrouter()
	adminSubroute.Use(middleware.VerifyToken, middleware.LoginRequired, middleware.AdminRequired)
	adminSubroute.HandleFunc("/stats", adminController.GetAdminStats).Methods(http.MethodGet)
	adminSubroute.HandleFunc("/all-orders", adminController.AllOrders).Methods(http.MethodGet)
	adminSubroute.HandleFunc("/all-users", adminController.AllUsers).Methods(http.MethodGet)
	adminSubroute.HandleFunc("/all-categories", adminController.AllCategories).Methods(http.MethodGet)
	adminSubroute.HandleFunc("/edit-user", adminController.UpdateUserByAdmin).Methods(http.MethodPost)
	adminSubroute.HandleFunc("/add-category", adminController.AddCategory).Methods(http.MethodPost)
	adminSubroute.HandleFunc("/edit-category", adminController.EditCategory).Methods(http.MethodPost)
	adminSubroute.HandleFunc("/all-items", adminController.AllItems).Methods(http.MethodGet)
	adminSubroute.HandleFunc("/update-item", adminController.UpdateItemStatus).Methods(http.MethodPost)

	adminSubroute.HandleFunc("/cancel-order", orderController.CancelOrder).Methods(http.MethodPost)
	adminSubroute.HandleFunc("/deliver-order", orderController.DeliverOrder).Methods(http.MethodPost)

	sellerSubroute := r.PathPrefix("/api/seller").Subrouter()
	sellerSubroute.Use(middleware.VerifyToken, middleware.LoginRequired, middleware.SellerRequired)
	sellerSubroute.HandleFunc("/stats", sellerController.GetSellerStats).Methods(http.MethodGet)
	sellerSubroute.HandleFunc("/all-items", sellerController.GetSellerItems).Methods(http.MethodGet)
	sellerSubroute.HandleFunc("/current-orders", sellerController.GetSellerOrders).Methods(http.MethodGet)
	sellerSubroute.HandleFunc("/add-item", sellerController.AddItem).Methods(http.MethodPost)
	sellerSubroute.HandleFunc("/edit-item/{sitem_id}", sellerController.UpdateItem).Methods(http.MethodPost)
	sellerSubroute.HandleFunc("/update-orders", sellerController.UpdateOrderItemStatus).Methods(http.MethodPost)

	sellerSubroute.HandleFunc("/all-categories", orderController.GetAllCategories).Methods(http.MethodGet)
	sellerSubroute.HandleFunc("/item/{item_id}", orderController.GetItemByID).Methods(http.MethodGet)

	return r
}
