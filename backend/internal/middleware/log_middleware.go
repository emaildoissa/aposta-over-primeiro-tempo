package middleware

import (
	"bytes"
	"io/ioutil"
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// RequestLogger é o nosso middleware para logar detalhes da requisição.
func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()

		// Guarda o corpo da requisição para que possamos lê-lo e depois restaurá-lo.
		var requestBody []byte
		if c.Request.Body != nil {
			requestBody, _ = ioutil.ReadAll(c.Request.Body)
		}
		// Restaura o corpo para que o Gin possa lê-lo novamente.
		c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(requestBody))

		// Processa a requisição
		c.Next()

		endTime := time.Now()
		latency := endTime.Sub(startTime)
		statusCode := c.Writer.Status()
		clientIP := c.ClientIP()
		method := c.Request.Method
		path := c.Request.URL.Path

		log.Printf("[GIN-LOG] %d | %13v | %15s | %s %s",
			statusCode,
			latency,
			clientIP,
			method,
			path,
		)

		// Se for um método POST e houver um corpo, imprima-o
		if method == "POST" || method == "PUT" || method == "PATCH" {
			if len(requestBody) > 0 {
				log.Printf("[GIN-LOG] Request Body: %s", string(requestBody))
			}
		}
	}
}
