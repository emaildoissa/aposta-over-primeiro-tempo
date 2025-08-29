package services

import (
	"github.com/emaildoissa/aposta-backend/internal/models"
	"github.com/emaildoissa/aposta-backend/internal/repositories"
)

func CreateGame(game *models.Game) error {
	// Validações de negócio podem ser adicionadas aqui
	return repositories.CreateGame(game)
}

func ListGames() ([]models.Game, error) {
	return repositories.GetAllGames()
}

func UpdateGameScore(id uint, homeScore int, awayScore int) error {
	// Aqui você pode adicionar validações, ex: score não pode ser negativo
	return repositories.UpdateGameScore(id, homeScore, awayScore)
}

func UpdateGameHTScore(id uint, homeScoreHT int, awayScoreHT int) error {
	return repositories.UpdateGameHTScore(id, homeScoreHT, awayScoreHT)
}
