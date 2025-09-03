package main

import (
	"flag"
	"log"

	"github.com/emaildoissa/aposta-backend/internal/database"
	"github.com/emaildoissa/aposta-backend/internal/middleware"
	"github.com/emaildoissa/aposta-backend/internal/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/emaildoissa/aposta-backend/internal/models"
)

func main() {
	migrate := flag.Bool("migrate", false, "Executa a migração do banco de dados")
	flag.Parse()

	err := godotenv.Load()
	if err != nil {
		log.Println("Aviso: Erro ao carregar arquivo .env")
	}

	database.ConnectDB()

	if *migrate {
		log.Println("Iniciando migração do banco de dados...")
		// Agora o Go sabe o que são models.Game e models.Bet
		err = database.DB.AutoMigrate(&models.Game{}, &models.Bet{}, &models.Setting{}, &models.User{})
		if err != nil {
			log.Fatal("Erro ao executar a migração:", err)
		}
		log.Println("Migração concluída com sucesso.")
		return
	}

	r := gin.Default()
	r.Use(middleware.RequestLogger())

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	routes.SetupRoutes(r)

	r.Run(":8080")
}
