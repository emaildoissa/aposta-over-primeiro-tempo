package routes

import (
	"github.com/emaildoissa/aposta-backend/internal/handlers"
	"github.com/emaildoissa/aposta-backend/internal/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")

	auth := api.Group("/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.POST("/login", handlers.Login)
	}
	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware()) // Aplica o middleware de autenticação
	{
		protected.POST("/games", handlers.CreateGame)
		protected.GET("/games", handlers.ListGames)
		protected.PUT("/games/:id/score", handlers.UpdateGameScore)
		protected.POST("/bets", handlers.CreateBet)
		protected.GET("/bets", handlers.ListBets)
		protected.POST("/bets/dutching", handlers.DutchingCalc)
		protected.PUT("/bets/:id/result", handlers.UpdateBetResult)
		protected.GET("/dashboard/stats", handlers.GetDashboardStats)
		protected.GET("/dashboard/evolution", handlers.GetDashboardEvolution)
		protected.PUT("/games/:id/ht-score", handlers.UpdateGameHTScore)
		protected.POST("/backtest", handlers.RunBacktest)
	}
	//api.POST("/games", handlers.CreateGame)
	//api.GET("/games", handlers.ListGames)
	//api.PUT("/games/:id/score", handlers.UpdateGameScore)
	//api.POST("/bets", handlers.CreateBet)
	//api.GET("/bets", handlers.ListBets)
	//api.POST("/bets/dutching", handlers.DutchingCalc)
	//api.PUT("/bets/:id/result", handlers.UpdateBetResult)
	//api.GET("/dashboard/stats", handlers.GetDashboardStats)
	//api.GET("/dashboard/evolution", handlers.GetDashboardEvolution)
	//api.PUT("/games/:id/ht-score", handlers.UpdateGameHTScore)
	//api.POST("/backtest", handlers.RunBacktest)
}
