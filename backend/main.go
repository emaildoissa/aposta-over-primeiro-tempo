package main

import (
	"flag"
	"log"

	// Adicionado para a Opção 2 de CORS
	"github.com/emaildoissa/aposta-backend/internal/database"
	"github.com/emaildoissa/aposta-backend/internal/middleware"
	"github.com/emaildoissa/aposta-backend/internal/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	// Adicionado para a Opção 2 de CORS
)

func main() {
	migrate := flag.Bool("migrate", false, "Executa a migração do banco de dados")
	recalculate := flag.Bool("recalculate", false, "Recalcula o PnL de todas as apostas")
	flag.Parse()

	err := godotenv.Load()
	if err != nil {
		log.Println("Aviso: Erro ao carregar arquivo .env")
	}

	database.ConnectDB()

	if *migrate {
		// ... (código da migração)
		return
	}
	if *recalculate {
		// ... (código do recálculo)
		return
	}

	r := gin.Default()
	r.Use(middleware.RequestLogger())

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173"}, // Permite apenas o seu frontend local
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		// A linha abaixo é a mais importante: ela permite o cabeçalho de Autorização
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	routes.SetupRoutes(r)

	// --- CÓDIGO DE DEBUG ADICIONADO AQUI ---
	// Este bloco vai imprimir todas as rotas que o servidor conhece.
	log.Println("--- ROTAS REGISTRADAS ---")
	for _, route := range r.Routes() {
		log.Printf("Método: %-7s Rota: %s", route.Method, route.Path)
	}
	log.Println("-------------------------")

	log.Println("Servidor iniciado na porta :8080")
	r.Run(":8080")
}
