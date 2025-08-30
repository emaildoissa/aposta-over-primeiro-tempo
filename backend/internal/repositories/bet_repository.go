package repositories

import (
	"github.com/emaildoissa/aposta-backend/internal/database"
	"github.com/emaildoissa/aposta-backend/internal/models"
)

func GetAllBets(marketFilter string) ([]models.Bet, error) {
	var bets []models.Bet
	query := database.DB
	if marketFilter != "" {
		query = query.Where("market = ?", marketFilter)
	}
	err := query.Find(&bets).Error
	return bets, err
}

func CreateBet(bet *models.Bet) error {
	return database.DB.Create(bet).Error
}

func UpdateBetResult(id uint, result string, pnl float64) error {
	return database.DB.Model(&models.Bet{}).Where("id = ?", id).Updates(models.Bet{Result: result, Pnl: pnl}).Error
}

func GetBetByID(id uint) (*models.Bet, error) {
	var bet models.Bet
	err := database.DB.First(&bet, id).Error
	return &bet, err
}
