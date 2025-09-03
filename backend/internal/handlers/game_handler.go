package handlers

import (
	"bytes"
	"encoding/json"
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
	// 1. Lê o corpo da requisição sem processá-lo imediatamente.
	body, err := ioutil.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Não foi possível ler o corpo da requisição"})
		return
	}
	// Restaura o corpo para que possa ser lido novamente se necessário
	c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(body))

	var inputs []CreateGameInput

	// 2. Verifica se o JSON começa com '{' (objeto) ou '[' (lista).
	trimmedBody := bytes.TrimSpace(body)
	if len(trimmedBody) > 0 && trimmedBody[0] == '{' {
		// Se for um objeto único, o processa como tal...
		var singleInput CreateGameInput
		if err := json.Unmarshal(body, &singleInput); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Objeto JSON inválido: " + err.Error()})
			return
		}
		// ...e o adiciona a nossa lista para manter o resto da lógica consistente.
		inputs = append(inputs, singleInput)
	} else {
		// Se for uma lista, processa a lista inteira.
		if err := json.Unmarshal(body, &inputs); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Array JSON inválido: " + err.Error()})
			return
		}
	}

	// 3. A partir daqui, a lógica continua a mesma, processando uma lista de jogos.
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

	// Se a entrada original era um objeto único, retorna apenas esse objeto.
	if len(trimmedBody) > 0 && trimmedBody[0] == '{' && len(createdGames) == 1 {
		c.JSON(http.StatusCreated, createdGames[0])
		return
	}

	// Caso contrário, retorna a lista de jogos criados.
	c.JSON(http.StatusCreated, createdGames)
}

func ListGames(c *gin.Context) {
	// Pega os parâmetros 'page' e 'limit' da URL, com valores padrão
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	games, total, err := services.ListGames(page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Retorna uma resposta JSON estruturada com os dados e o total
	c.JSON(http.StatusOK, gin.H{
		"games": games,
		"total": total,
	})
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
