package repositories

import (
	"database/sql"

	"github.com/emaildoissa/aposta-backend/internal/database"
	"github.com/emaildoissa/aposta-backend/internal/models"
)

func GetAllGames(userID uint, page int, limit int) ([]models.Game, int64, error) {
	var games []models.Game
	var total int64
	offset := (page - 1) * limit

	db := database.DB.Model(&models.Game{}).Where("user_id = ?", userID)
	db.Count(&total)

	err := db.Preload("Bets").Order("start_time desc").Limit(limit).Offset(offset).Find(&games).Error
	return games, total, err
}

func CreateGame(game *models.Game) error {
	return database.DB.Create(game).Error
}

func UpdateGameScore(gameID uint, userID uint, homeScore int, awayScore int) error {
	updates := map[string]interface{}{
		"home_score": sql.NullInt32{Int32: int32(homeScore), Valid: true},
		"away_score": sql.NullInt32{Int32: int32(awayScore), Valid: true},
	}
	// Garante que o usuário só pode atualizar o próprio jogo
	return database.DB.Model(&models.Game{}).Where("id = ? AND user_id = ?", gameID, userID).Updates(updates).Error
}

func UpdateGameHTScore(gameID uint, userID uint, homeScoreHT int, awayScoreHT int) error {
	updates := map[string]interface{}{
		"home_score_ht": sql.NullInt32{Int32: int32(homeScoreHT), Valid: true},
		"away_score_ht": sql.NullInt32{Int32: int32(awayScoreHT), Valid: true},
	}
	// Garante que o usuário só pode atualizar o próprio jogo
	return database.DB.Model(&models.Game{}).Where("id = ? AND user_id = ?", gameID, userID).Updates(updates).Error
}
