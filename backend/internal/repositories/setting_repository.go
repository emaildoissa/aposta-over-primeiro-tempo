package repositories

import (
	"github.com/emaildoissa/aposta-backend/internal/database"
	"github.com/emaildoissa/aposta-backend/internal/models"
	"gorm.io/gorm"
)

// FindOrCreateSetting busca uma configuração pela chave. Se não encontrar,
// cria com um valor padrão e retorna o valor.
func FindOrCreateSetting(key string, defaultValue string) (models.Setting, error) {
	var setting models.Setting
	err := database.DB.Where(models.Setting{Key: key}).FirstOrCreate(&setting, models.Setting{Key: key, Value: defaultValue}).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		return models.Setting{}, err
	}
	return setting, nil
}
