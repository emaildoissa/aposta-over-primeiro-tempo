package models

type Bet struct {
	ID       uint    `gorm:"primaryKey" json:"id"`
	GameID   uint    `json:"game_id"`
	Game     Game    `gorm:"foreignKey:GameID" json:"-" binding:"-"`
	Market   string  `json:"market" binding:"required"`
	Odd      float64 `json:"odd" binding:"required"`
	Stake    float64 `json:"stake" binding:"required"`
	Result   string  `json:"result"`
	Pnl      float64 `json:"pnl"`
	Strategy string  `json:"strategy"`
}
