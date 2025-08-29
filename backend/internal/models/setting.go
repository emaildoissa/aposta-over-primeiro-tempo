package models

// Setting armazena configurações gerais no formato chave-valor.
type Setting struct {
	Key   string `gorm:"primaryKey" json:"key"`
	Value string `json:"value"`
}
