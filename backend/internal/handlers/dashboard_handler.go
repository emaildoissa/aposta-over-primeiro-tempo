package handlers

import (
	"net/http"

	"github.com/emaildoissa/aposta-backend/internal/services"
	"github.com/gin-gonic/gin"
)

// GetDashboardStats manipula a requisição para obter as estatísticas do dashboard.
func GetDashboardStats(c *gin.Context) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Ação não autorizada"})
		return
	}
	marketFilter := c.Query("market")

	stats, err := services.GetDashboardStats(userID, marketFilter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao calcular estatísticas"})
		return
	}
	c.JSON(http.StatusOK, stats)
}

func GetDashboardEvolution(c *gin.Context) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Ação não autorizada"})
		return
	}
	evolutionData, err := services.GetDashboardEvolution(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao calcular dados de evolução"})
		return
	}
	c.JSON(http.StatusOK, evolutionData)
}
