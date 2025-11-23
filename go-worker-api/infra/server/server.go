package server

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

// Start launches a minimal HTTP server exposing only a health endpoint.
// The worker no longer serves weather data directly; NestJS API will be
// responsible for querying persisted weather logs.
func Start() {
	r := gin.New()
	r.Use(gin.Recovery(), gin.Logger())

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "OK")
	})

	_ = r.Run(":8001")
}
