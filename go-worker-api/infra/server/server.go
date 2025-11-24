package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func Start() {
	r := gin.New()
	r.Use(gin.Recovery(), gin.Logger())

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "OK")
	})

	_ = r.Run(":8001")
}
