package server

import (
	"net/http"

	"github.com/JoaoVitorML-BR/joao-vitor-desafio-gdash-2025-02/app/routes"
	"github.com/gin-gonic/gin"
)

func Start() {
	r := gin.New()
	r.Use(gin.Recovery(), gin.Logger())

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "OK")
	})

	routes.SetupRoutes(r)

	r.Run(":8001")
}
