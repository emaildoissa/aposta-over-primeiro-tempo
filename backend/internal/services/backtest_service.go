package services

import (
	"log"
	"math"

	"github.com/emaildoissa/aposta-backend/internal/models"
	"github.com/emaildoissa/aposta-backend/internal/repositories"
)

type BacktestInput struct {
	EntryCondition    string  `json:"entry_condition"`
	MarketToBet       string  `json:"market_to_bet"`
	HypotheticalOdd   float64 `json:"hypothetical_odd"`
	HypotheticalStake float64 `json:"hypothetical_stake"`
}

type BacktestResult struct {
	TotalSimulatedBets int     `json:"total_simulated_bets"`
	Wins               int     `json:"wins"`
	Losses             int     `json:"losses"`
	TotalInvested      float64 `json:"total_invested"`
	TotalPnL           float64 `json:"total_pnl"`
	ROI                float64 `json:"roi"`
}

func RunBacktest(input BacktestInput) (*BacktestResult, error) {
	// --- CORREÇÃO AQUI: Chamando GetAllGames com parâmetros e tratando 3 valores de retorno ---
	// Usamos um limite alto para buscar todos os jogos para o backtest.
	// O segundo valor de retorno (total) é ignorado aqui com `_`.
	games, _, err := repositories.GetAllGames(1, 10000)
	if err != nil {
		return nil, err
	}

	allBets, err := repositories.GetAllBets("")
	if err != nil {
		return nil, err
	}
	betsByGameID := make(map[uint][]models.Bet)
	for _, bet := range allBets {
		betsByGameID[bet.GameID] = append(betsByGameID[bet.GameID], bet)
	}

	result := &BacktestResult{}

	log.Printf("--- INICIANDO BACKTEST INTELIGENTE --- Total de jogos: %d", len(games))

	for _, game := range games {
		// ... (o resto da função permanece o mesmo) ...
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

		isWin := false
		canDetermineOutcome := false

		switch input.MarketToBet {
		case "Over 2.5 FT":
			if game.HomeScore.Valid && game.AwayScore.Valid {
				canDetermineOutcome = true
				totalGoals := int(game.HomeScore.Int32) + int(game.AwayScore.Int32)
				if totalGoals > 2 {
					isWin = true
				}
			}
		case "Under 1.5 HT":
			if game.HomeScoreHT.Valid && game.AwayScoreHT.Valid {
				canDetermineOutcome = true
				htGoals := int(game.HomeScoreHT.Int32) + int(game.AwayScoreHT.Int32)
				if htGoals < 2 {
					isWin = true
				}
			} else if gameBets, ok := betsByGameID[game.ID]; ok {
				for _, bet := range gameBets {
					if bet.Market == "Over 1.5 HT" && bet.Result != "" {
						canDetermineOutcome = true
						if bet.Result == "RED" {
							isWin = true
						}
						break
					}
				}
			}
		case "Over 1.5 HT":
			if game.HomeScoreHT.Valid && game.AwayScoreHT.Valid {
				canDetermineOutcome = true
				htGoals := int(game.HomeScoreHT.Int32) + int(game.AwayScoreHT.Int32)
				if htGoals > 1 {
					isWin = true
				}
			} else if gameBets, ok := betsByGameID[game.ID]; ok {
				for _, bet := range gameBets {
					if bet.Market == "Over 1.5 HT" && bet.Result != "" {
						canDetermineOutcome = true
						if bet.Result == "GREEN" {
							isWin = true
						}
						break
					}
				}
			}
		}

		if canDetermineOutcome {
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

	if result.TotalInvested > 0 {
		result.TotalPnL = math.Round(result.TotalPnL*100) / 100
		result.ROI = (result.TotalPnL / result.TotalInvested) * 100
	}
	log.Printf("--- FIM DO BACKTEST --- Resultado: %+v", result)
	return result, nil
}
