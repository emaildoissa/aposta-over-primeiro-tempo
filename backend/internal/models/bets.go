package models

type Bet struct {
	ID       uint    `gorm:"primaryKey" json:"id"`
	UserID   uint    `json:"user_id"`
	User     User    `gorm:"foreignKey:UserID" json:"-"`
	GameID   uint    `json:"game_id"`
	Game     Game    `gorm:"foreignKey:GameID" json:"-" binding:"-"`
	Market   string  `json:"market" binding:"required"`
	Odd      float64 `json:"odd" binding:"required"`
	Stake    float64 `json:"stake" binding:"required"`
	Result   string  `json:"result"`
	Pnl      float64 `json:"pnl"`
	Strategy string  `json:"strategy"`
	Notes    string  `json:"notes,omitempty"`
}
