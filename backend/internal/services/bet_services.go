package services

import (
	"errors"
	"strings"

	"github.com/emaildoissa/aposta-backend/internal/models"
	"github.com/emaildoissa/aposta-backend/internal/repositories"
)

func CreateBet(bet *models.Bet) error {
	return repositories.CreateBet(bet)
}

// ListBets agora passa o userID e o filtro para o repositório.
func ListBets(userID uint, marketFilter string) ([]models.Bet, error) {
	return repositories.GetAllBets(userID, marketFilter)
}

// UpdateBetResult contém a lógica de negócio para calcular o PnL.
func UpdateBetResult(id uint, result string) (*models.Bet, error) {
	// 1. Padroniza a entrada
	result = strings.ToUpper(result)

	// 2. Validação do resultado
	if result != "GREEN" && result != "RED" && result != "VOID" {
		return nil, errors.New("resultado inválido, use 'GREEN', 'RED' ou 'VOID'")
	}

	// 3. Busca a aposta original para obter Stake e Odd
	bet, err := repositories.GetBetByID(id) // Precisaremos criar esta função no repositório
	if err != nil {
		return nil, errors.New("aposta não encontrada")
	}

	// 4. Lógica de negócio para calcular PnL
	var pnl float64
	switch result {
	case "GREEN":
		pnl = (bet.Odd * bet.Stake) - bet.Stake
	case "RED":
		pnl = -bet.Stake
	case "VOID":
		pnl = 0.0
	}

	// 5. Atualiza no banco de dados
	if err := repositories.UpdateBetResult(id, result, pnl); err != nil {
		return nil, err
	}

	// Atualiza o PnL no objeto que retornaremos
	bet.Result = result
	bet.Pnl = pnl

	return bet, nil
}
