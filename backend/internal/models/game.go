// internal/models/game.go
package models

import (
	"database/sql"
	"time"
)

type Game struct {
	ID          uint          `gorm:"primaryKey" json:"id"`
	UserID      uint          `json:"user_id"`
	User        User          `gorm:"foreignKey:UserID" json:"-"`
	HomeTeam    string        `json:"home_team"`
	AwayTeam    string        `json:"away_team"`
	StartTime   time.Time     `json:"start_time"`
	HomeScore   sql.NullInt32 `gorm:"default:null" json:"home_score"`
	AwayScore   sql.NullInt32 `gorm:"default:null" json:"away_score"`
	HomeScoreHT sql.NullInt32 `gorm:"default:null" json:"home_score_ht"` // <-- CAMPO NOVO
	AwayScoreHT sql.NullInt32 `gorm:"default:null" json:"away_score_ht"` // <-- CAMPO NOVO
	Bets        []Bet         `json:"bets"`
}
