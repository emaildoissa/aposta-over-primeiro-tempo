package repositories

import (
	"github.com/emaildoissa/aposta-backend/internal/database"
	"github.com/emaildoissa/aposta-backend/internal/models"
)

// GetAllBets agora filtra as apostas pelo ID do usuário.
func GetAllBets(userID uint, marketFilter string) ([]models.Bet, error) {
	var bets []models.Bet
	query := database.DB.Order("id asc").Where("user_id = ?", userID)

	if marketFilter != "" {
		query = query.Where("market = ?", marketFilter)
	}
	err := query.Find(&bets).Error
	return bets, err
}

func GetBetByID(id uint) (*models.Bet, error) {
	var bet models.Bet
	err := database.DB.First(&bet, id).Error
	return &bet, err
}

func CreateBet(bet *models.Bet) error {
	return database.DB.Create(bet).Error
}

func UpdateBetResult(id uint, result string, pnl float64) error {
	return database.DB.Model(&models.Bet{}).Where("id = ?", id).Updates(models.Bet{Result: result, Pnl: pnl}).Error
}
