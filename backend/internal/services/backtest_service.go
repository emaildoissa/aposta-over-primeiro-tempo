// internal/services/backtest_service.go
package services

import (
	"math"

	"github.com/emaildoissa/aposta-backend/internal/repositories"
)

// BacktestInput define as regras da estratégia a ser testada
type BacktestInput struct {
	EntryCondition    string  `json:"entry_condition"` // Ex: "ht_score_0_0", "all_games"
	MarketToBet       string  `json:"market_to_bet"`   // Ex: "Over 2.5 FT", "Under 1.5 HT"
	HypotheticalOdd   float64 `json:"hypothetical_odd"`
	HypotheticalStake float64 `json:"hypothetical_stake"`
}

// BacktestResult resume o resultado da simulação
type BacktestResult struct {
	TotalSimulatedBets int     `json:"total_simulated_bets"`
	Wins               int     `json:"wins"`
	Losses             int     `json:"losses"`
	TotalInvested      float64 `json:"total_invested"`
	TotalPnL           float64 `json:"total_pnl"`
	ROI                float64 `json:"roi"`
}

// RunBacktest executa a simulação
func RunBacktest(input BacktestInput) (*BacktestResult, error) {
	games, err := repositories.GetAllGames()
	if err != nil {
		return nil, err
	}

	result := &BacktestResult{}

	for _, game := range games {
		// A verificação genérica foi removida daqui.

		// 1. Verifica se o jogo atende à condição de entrada
		passesCondition := false
		switch input.EntryCondition {
		case "all_games":
			passesCondition = true
		case "ht_score_0_0":
			if game.HomeScoreHT.Valid && game.AwayScoreHT.Valid && game.HomeScoreHT.Int32 == 0 && game.AwayScoreHT.Int32 == 0 {
				passesCondition = true
			}
		}

		if !passesCondition {
			continue
		}

		// 2. Simula a aposta
		isWin := false
		shouldSimulate := false // Controla se a aposta pode ser simulada (se os dados necessários existem)

		// 3. Verifica o resultado da aposta simulada COM VALIDAÇÃO DE DADOS ESPECÍFICA
		switch input.MarketToBet {
		case "Over 2.5 FT":
			// Para este mercado, precisamos do placar final.
			if game.HomeScore.Valid && game.AwayScore.Valid {
				shouldSimulate = true
				totalGoals := int(game.HomeScore.Int32) + int(game.AwayScore.Int32)
				if totalGoals > 2 {
					isWin = true
				}
			}
		case "Under 1.5 HT":
			// Para este mercado, só precisamos do placar de intervalo.
			if game.HomeScoreHT.Valid && game.AwayScoreHT.Valid {
				shouldSimulate = true
				htGoals := int(game.HomeScoreHT.Int32) + int(game.AwayScoreHT.Int32)
				if htGoals < 2 { // 0 ou 1 gol = vitória
					isWin = true
				}
			}
		}

		// 4. Se a simulação foi possível, calcula o PnL
		if shouldSimulate {
			result.TotalSimulatedBets++
			result.TotalInvested += input.HypotheticalStake

			if isWin {
				result.Wins++
				result.TotalPnL += (input.HypotheticalOdd * input.HypotheticalStake) - input.HypotheticalStake
			} else {
				result.Losses++
				result.TotalPnL -= input.HypotheticalStake
			}
		}
	}

	// 5. Calcula o ROI final
	if result.TotalInvested > 0 {
		result.TotalPnL = math.Round(result.TotalPnL*100) / 100
		result.ROI = (result.TotalPnL / result.TotalInvested) * 100
	}

	return result, nil
}
