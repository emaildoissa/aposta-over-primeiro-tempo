package repositories

import (
	"database/sql"

	"github.com/emaildoissa/aposta-backend/internal/database"
	"github.com/emaildoissa/aposta-backend/internal/models"
)

func GetAllGames() ([]models.Game, error) {
	var games []models.Game
	err := database.DB.Preload("Bets").Order("start_time asc").Find(&games).Error
	return games, err
}

func CreateGame(game *models.Game) error {
	return database.DB.Create(game).Error
}

func UpdateGameScore(id uint, homeScore int, awayScore int) error {
	updates := map[string]interface{}{
		"home_score": sql.NullInt32{Int32: int32(homeScore), Valid: true},
		"away_score": sql.NullInt32{Int32: int32(awayScore), Valid: true},
	}
	return database.DB.Model(&models.Game{}).Where("id = ?", id).Updates(updates).Error
}

func UpdateGameHTScore(id uint, homeScoreHT int, awayScoreHT int) error {
	updates := map[string]interface{}{
		"home_score_ht": sql.NullInt32{Int32: int32(homeScoreHT), Valid: true},
		"away_score_ht": sql.NullInt32{Int32: int32(awayScoreHT), Valid: true},
	}
	return database.DB.Model(&models.Game{}).Where("id = ?", id).Updates(updates).Error
}
