// internal/services/dashboard_service.go
package services

import (
	"errors" // IMPORTE O PACOTE DE ERROS
	"math"
	"sort"
	"strconv"
	"time"

	"github.com/emaildoissa/aposta-backend/internal/repositories"
)

// ... (struct DashboardStats não muda) ...
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

func GetDashboardStats() (*DashboardStats, error) {
	setting, err := repositories.FindOrCreateSetting("initial_bankroll", defaultInitialBankroll)
	if err != nil {
		return nil, err
	}

	// --- CORREÇÃO DO BUG AQUI ---
	// Agora estamos tratando o erro da conversão de string para float64
	bancaInicial, err := strconv.ParseFloat(setting.Value, 64)
	if err != nil {
		// Se o valor no banco estiver mal formatado (ex: "abc"), retornamos um erro claro
		return nil, errors.New("valor da banca inicial no banco de dados é inválido")
	}

	bets, err := repositories.GetAllBets()
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
	stats.TaxaDeAcerto = (float64(stats.ApostasVencidas) / float64(stats.TotalApostas)) * 100

	return stats, nil
}

func GetDashboardEvolution() ([]EvolutionDataPoint, error) {
	bets, err := repositories.GetAllBets()
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

	// --- A CORREÇÃO ESTÁ AQUI ---
	// Se nenhuma aposta com resultado foi encontrada, evolutionData será nulo.
	// Nós garantimos que sempre retornaremos uma slice vazia em vez de nulo.
	if evolutionData == nil {
		return make([]EvolutionDataPoint, 0), nil
	}

	return evolutionData, nil
}
