package handlers

import (
	"net/http"

	"github.com/emaildoissa/aposta-backend/internal/services"
	"github.com/gin-gonic/gin"
)

// GetDashboardStats manipula a requisição para obter as estatísticas do dashboard.
func GetDashboardStats(c *gin.Context) {
	// Lê o mesmo filtro de mercado
	marketFilter := c.Query("market")

	stats, err := services.GetDashboardStats(marketFilter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao calcular estatísticas"})
		return
	}
	c.JSON(http.StatusOK, stats)
}

func GetDashboardEvolution(c *gin.Context) {
	evolutionData, err := services.GetDashboardEvolution()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao calcular dados de evolução"})
		return
	}
	c.JSON(http.StatusOK, evolutionData)
}
