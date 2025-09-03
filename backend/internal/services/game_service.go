package services

import (
	"github.com/emaildoissa/aposta-backend/internal/models"
	"github.com/emaildoissa/aposta-backend/internal/repositories"
)

func CreateGame(game *models.Game) error {
	return repositories.CreateGame(game)
}

func ListGames(userID uint, page int, limit int) ([]models.Game, int64, error) {
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	return repositories.GetAllGames(userID, page, limit)
}

func UpdateGameScore(gameID uint, userID uint, homeScore int, awayScore int) error {
	return repositories.UpdateGameScore(gameID, userID, homeScore, awayScore)
}

func UpdateGameHTScore(gameID uint, userID uint, homeScoreHT int, awayScoreHT int) error {
	return repositories.UpdateGameHTScore(gameID, userID, homeScoreHT, awayScoreHT)
}
