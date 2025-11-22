package routes

import (
	"net/http"
	"github.com/JoaoVitorML-BR/joao-vitor-desafio-gdash-2025-02/app/store"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	r.GET("/weather/infos", func(c *gin.Context) {
		v := store.GetLatest()
		if v == "" {
			c.JSON(http.StatusNoContent, gin.H{"message": "no data"})
			return
		}
		c.Data(http.StatusOK, "application/json", []byte(v))
	})
}