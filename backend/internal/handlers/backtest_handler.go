// internal/handlers/backtest_handler.go
package handlers

import (
	"net/http"

	"github.com/emaildoissa/aposta-backend/internal/services"
	"github.com/gin-gonic/gin"
)

func RunBacktest(c *gin.Context) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Ação não autorizada"})
		return
	}
	var input services.BacktestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input inválido: " + err.Error()})
		return
	}

	result, err := services.RunBacktest(userID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao rodar backtest: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}
