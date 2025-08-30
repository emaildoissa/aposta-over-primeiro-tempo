// internal/services/dashboard_service.go
package services

import (
	"errors"
	"math"
	"sort"
	"strconv"
	"time"

	"github.com/emaildoissa/aposta-backend/internal/repositories"
)

type DashboardStats struct {
	BancaInicial    float64 `json:"banca_inicial"`
	BancaTotal      float64 `json:"banca_total"`
	LucroTotal      float64 `json:"lucro_total"`
	TotalApostado   float64 `json:"total_apostado"`
	ROI             float64 `json:"roi"`
	TotalApostas    int     `json:"total_apostas"`
	ApostasVencidas int     `json:"apostas_vencidas"`
	TaxaDeAcerto    float64 `json:"taxa_de_acerto"`
}

type EvolutionDataPoint struct {
	Date             string  `json:"date"`
	CumulativeProfit float64 `json:"cumulative_profit"`
}

const defaultInitialBankroll = "100.00"

// CORREÇÃO 1: A função agora aceita o parâmetro 'marketFilter' que vem do handler.
func GetDashboardStats(marketFilter string) (*DashboardStats, error) {
	setting, err := repositories.FindOrCreateSetting("initial_bankroll", defaultInitialBankroll)
	if err != nil {
		return nil, err
	}

	bancaInicial, err := strconv.ParseFloat(setting.Value, 64)
	if err != nil {
		return nil, errors.New("valor da banca inicial no banco de dados é inválido")
	}

	// CORREÇÃO 2: A variável 'marketFilter' agora existe e é passada corretamente para o repositório.
	bets, err := repositories.GetAllBets(marketFilter)
	if err != nil {
		return nil, err
	}

	stats := &DashboardStats{
		BancaInicial: bancaInicial,
	}

	stats.TotalApostas = len(bets)
	if stats.TotalApostas == 0 {
		stats.BancaTotal = stats.BancaInicial
		return stats, nil
	}

	for _, bet := range bets {
		stats.LucroTotal += bet.Pnl
		stats.TotalApostado += bet.Stake
		if bet.Result == "GREEN" {
			stats.ApostasVencidas++
		}
	}

	stats.BancaTotal = stats.BancaInicial + stats.LucroTotal

	if stats.TotalApostado > 0 {
		stats.ROI = (stats.LucroTotal / stats.TotalApostado) * 100
	}
	// Adicionada uma verificação para evitar divisão por zero.
	if stats.TotalApostas > 0 {
		stats.TaxaDeAcerto = (float64(stats.ApostasVencidas) / float64(stats.TotalApostas)) * 100
	}

	return stats, nil
}

func GetDashboardEvolution() ([]EvolutionDataPoint, error) {
	// CORREÇÃO 3: O gráfico de evolução não deve ser filtrado, então passamos uma string vazia.
	bets, err := repositories.GetAllBets("")
	if err != nil {
		return nil, err
	}
	games, err := repositories.GetAllGames()
	if err != nil {
		return nil, err
	}

	gameDates := make(map[uint]time.Time)
	for _, game := range games {
		gameDates[game.ID] = game.StartTime
	}

	dailyPnls := make(map[string]float64)
	for _, bet := range bets {
		if bet.Result != "" {
			gameDate, ok := gameDates[bet.GameID]
			if ok {
				dayKey := gameDate.Format("2006-01-02")
				dailyPnls[dayKey] += bet.Pnl
			}
		}
	}

	type dailyPoint struct {
		Date string
		PnL  float64
	}
	var sortedDailyPoints []dailyPoint
	for date, pnl := range dailyPnls {
		sortedDailyPoints = append(sortedDailyPoints, dailyPoint{Date: date, PnL: pnl})
	}

	sort.Slice(sortedDailyPoints, func(i, j int) bool {
		return sortedDailyPoints[i].Date < sortedDailyPoints[j].Date
	})

	var evolutionData []EvolutionDataPoint
	var cumulativeProfit float64 = 0.0
	for _, point := range sortedDailyPoints {
		cumulativeProfit += point.PnL
		evolutionPoint := EvolutionDataPoint{
			Date:             point.Date,
			CumulativeProfit: math.Round(cumulativeProfit*100) / 100,
		}
		evolutionData = append(evolutionData, evolutionPoint)
	}

	if evolutionData == nil {
		return make([]EvolutionDataPoint, 0), nil
	}

	return evolutionData, nil
}
