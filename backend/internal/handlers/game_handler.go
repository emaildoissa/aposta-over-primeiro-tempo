package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
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

type ScoreInput struct {
	HomeScore int `json:"home_score" binding:"gte=0"`
	AwayScore int `json:"away_score" binding:"gte=0"`
}

type HTScoreInput struct {
	HomeScoreHT int `json:"home_score_ht" binding:"gte=0"`
	AwayScoreHT int `json:"away_score_ht" binding:"gte=0"`
}

// getUserIDFromContext é uma função helper para extrair o ID do usuário do contexto do Gin.
func getUserIDFromContext(c *gin.Context) (uint, error) {
	userIDInterface, exists := c.Get("userID")
	if !exists {
		return 0, fmt.Errorf("userID not found in context")
	}

	// O token JWT decodifica números como float64, então precisamos converter.
	userIDFloat, ok := userIDInterface.(float64)
	if !ok {
		return 0, fmt.Errorf("userID is not of expected type")
	}

	return uint(userIDFloat), nil
}

// CreateGame agora associa os jogos criados ao usuário logado.
func CreateGame(c *gin.Context) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Ação não autorizada"})
		return
	}

	body, err := ioutil.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Não foi possível ler o corpo da requisição"})
		return
	}
	c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(body))

	var inputs []CreateGameInput
	trimmedBody := bytes.TrimSpace(body)
	if len(trimmedBody) > 0 && trimmedBody[0] == '{' {
		var singleInput CreateGameInput
		if err := json.Unmarshal(body, &singleInput); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Objeto JSON inválido: " + err.Error()})
			return
		}
		inputs = append(inputs, singleInput)
	} else {
		if err := json.Unmarshal(body, &inputs); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Array JSON inválido: " + err.Error()})
			return
		}
	}

	var createdGames []models.Game
	for _, input := range inputs {
		layouts := []string{"2006-01-02T15:04:05Z", "2006-01-02T15:04:05", "2006-01-02T15:04"}
		var startTime time.Time
		var parseErr error
		for _, layout := range layouts {
			startTime, parseErr = time.Parse(layout, input.StartTime)
			if parseErr == nil {
				break
			}
		}
		if parseErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "formato de data inválido para start_time: " + input.StartTime})
			return
		}

		game := &models.Game{
			UserID:    userID, // <-- Associa o jogo ao usuário
			HomeTeam:  input.HomeTeam,
			AwayTeam:  input.AwayTeam,
			StartTime: startTime,
		}

		if err := services.CreateGame(game); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "não foi possível criar o jogo: " + game.HomeTeam})
			return
		}
		createdGames = append(createdGames, *game)
	}

	if len(trimmedBody) > 0 && trimmedBody[0] == '{' && len(createdGames) == 1 {
		c.JSON(http.StatusCreated, createdGames[0])
		return
	}
	c.JSON(http.StatusCreated, createdGames)
}

// ListGames agora retorna apenas os jogos do usuário logado.
func ListGames(c *gin.Context) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Ação não autorizada"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	games, total, err := services.ListGames(userID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"games": games,
		"total": total,
	})
}

// As funções de Update precisam garantir que o usuário é o dono do jogo (lógica no serviço).
func UpdateGameScore(c *gin.Context) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Ação não autorizada"})
		return
	}

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

	// O serviço deve verificar se o jogo com 'id' pertence ao 'userID'
	if err := services.UpdateGameScore(uint(id), userID, input.HomeScore, input.AwayScore); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao atualizar o placar"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Placar atualizado com sucesso"})
}

func UpdateGameHTScore(c *gin.Context) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Ação não autorizada"})
		return
	}

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

	// O serviço deve verificar se o jogo com 'id' pertence ao 'userID'
	if err := services.UpdateGameHTScore(uint(id), userID, input.HomeScoreHT, input.AwayScoreHT); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao atualizar o placar de intervalo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Placar de intervalo atualizado com sucesso"})
}
