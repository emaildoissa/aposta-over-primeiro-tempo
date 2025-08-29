package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/emaildoissa/aposta-backend/internal/models"
	"github.com/emaildoissa/aposta-backend/internal/services"
	"github.com/gin-gonic/gin"
)

type CreateGameInput struct {
	HomeTeam  string `json:"home_team" binding:"required"`
	AwayTeam  string `json:"away_team" binding:"required"`
	StartTime string `json:"start_time" binding:"required"`
}

// Definição da struct que estava faltando
type ScoreInput struct {
	HomeScore int `json:"home_score" binding:"gte=0"`
	AwayScore int `json:"away_score" binding:"gte=0"`
}

type HTScoreInput struct {
	HomeScoreHT int `json:"home_score_ht" binding:"gte=0"`
	AwayScoreHT int `json:"away_score_ht" binding:"gte=0"`
}

func CreateGame(c *gin.Context) {
	var input CreateGameInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	layouts := []string{"2006-01-02T15:04:05", "2006-01-02T15:04"}
	var startTime time.Time
	var err error

	for _, layout := range layouts {
		startTime, err = time.Parse(layout, input.StartTime)
		if err == nil {
			break
		}
	}

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "formato de data inválido para start_time. use YYYY-MM-DDTHH:MM:SS ou YYYY-MM-DDTHH:MM"})
		return
	}

	game := &models.Game{
		HomeTeam:  input.HomeTeam,
		AwayTeam:  input.AwayTeam,
		StartTime: startTime,
	}

	if err := services.CreateGame(game); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "não foi possível criar o jogo"})
		return
	}

	c.JSON(http.StatusCreated, game)
}

func ListGames(c *gin.Context) {
	games, err := services.ListGames()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, games)
}

func UpdateGameScore(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de jogo inválido"})
		return
	}

	var input ScoreInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := services.UpdateGameScore(uint(id), input.HomeScore, input.AwayScore); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao atualizar o placar"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Placar atualizado com sucesso"})
}

func UpdateGameHTScore(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de jogo inválido"})
		return
	}

	var input HTScoreInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := services.UpdateGameHTScore(uint(id), input.HomeScoreHT, input.AwayScoreHT); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao atualizar o placar de intervalo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Placar de intervalo atualizado com sucesso"})
}
