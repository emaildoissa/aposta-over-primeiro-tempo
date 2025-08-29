package routes

import (
	"github.com/emaildoissa/aposta-backend/internal/handlers"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	api.POST("/games", handlers.CreateGame)
	api.GET("/games", handlers.ListGames)
	api.PUT("/games/:id/score", handlers.UpdateGameScore)
	api.POST("/bets", handlers.CreateBet)
	api.GET("/bets", handlers.ListBets)
	api.POST("/bets/dutching", handlers.DutchingCalc)
	api.PUT("/bets/:id/result", handlers.UpdateBetResult)
	api.GET("/dashboard/stats", handlers.GetDashboardStats)
	api.GET("/dashboard/evolution", handlers.GetDashboardEvolution)
	api.PUT("/games/:id/ht-score", handlers.UpdateGameHTScore)
	api.POST("/backtest", handlers.RunBacktest)

}
