package controller

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/JoaoVitorML-BR/joao-vitor-desafio-gdash-2025-02/app/service"
)

type ConsumerController struct {
	svc *service.Consumer
}

func NewController(svc *service.Consumer) *ConsumerController {
	return &ConsumerController{svc: svc}
}

func (c *ConsumerController) Start() {
	log.Printf("controller: starting consumer")

	ctx, cancel := context.WithCancel(context.Background())

	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		if err := c.svc.Run(ctx); err != nil && err != context.Canceled {
			log.Printf("controller: consumer exited with error: %v", err)
		}
	}()

	go func() {
		<-sigs
		log.Printf("controller: signal received, shutting down consumer")
		cancel()
	}()
}
