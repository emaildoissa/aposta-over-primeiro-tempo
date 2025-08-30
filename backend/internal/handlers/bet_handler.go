// internal/handlers/bet_handler.go
package handlers

import (
	"math"
	"net/http"
	"strconv"
	"strings"

	"github.com/emaildoissa/aposta-backend/internal/models"
	"github.com/emaildoissa/aposta-backend/internal/services"
	"github.com/gin-gonic/gin"
)

// DutchingInput agora aceita strings para tratar vírgulas
type DutchingInput struct {
	Odd1  string `json:"odd1"`
	Odd2  string `json:"odd2"`
	Total string `json:"total"`
}

func CreateBet(c *gin.Context) {
	var bet models.Bet
	if err := c.ShouldBindJSON(&bet); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := services.CreateBet(&bet); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, bet)
}

func ListBets(c *gin.Context) {
	// Lê o parâmetro "market" da URL. Ex: /api/bets?market=Over%201.5%20HT
	marketFilter := c.Query("market")

	bets, err := services.ListBets(marketFilter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, bets)
}

// parseAndReplace é uma função helper para converter as strings
func parseAndReplace(s string) (float64, error) {
	return strconv.ParseFloat(strings.Replace(s, ",", ".", 1), 64)
}

func DutchingCalc(c *gin.Context) {
	var input DutchingInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Converte as strings para float64, tratando vírgulas
	odd1, err1 := parseAndReplace(input.Odd1)
	odd2, err2 := parseAndReplace(input.Odd2)
	total, err3 := parseAndReplace(input.Total)

	if err1 != nil || err2 != nil || err3 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valores de odd ou total inválidos."})
		return
	}

	if odd1 <= 1 || odd2 <= 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Odds devem ser maiores que 1."})
		return
	}

	// --- FÓRMULA MATEMÁTICA CORRETA PARA DUTCHING ---
	// Calcula as probabilidades implícitas
	p1 := 1 / odd1
	p2 := 1 / odd2

	totalProbability := p1 + p2

	// Calcula os stakes baseados na proporção das probabilidades
	s1 := total * (p1 / totalProbability)
	s2 := total * (p2 / totalProbability)

	c.JSON(http.StatusOK, gin.H{
		"stake1": math.Round(s1*100) / 100,
		"stake2": math.Round(s2*100) / 100,
	})
}

func UpdateBetResult(c *gin.Context) {
	idParam := c.Param("id")
	var input struct {
		Result string `json:"result"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	bet, err := services.UpdateBetResult(uint(id), input.Result)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, bet)
}
