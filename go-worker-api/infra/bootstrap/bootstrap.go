package bootstrap

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/JoaoVitorML-BR/joao-vitor-desafio-gdash-2025-02/app/controller"
	"github.com/JoaoVitorML-BR/joao-vitor-desafio-gdash-2025-02/infra/server"
)

func Start() {
	amqpURL := os.Getenv("RABBITMQ_URL")
	queue := os.Getenv("RABBITMQ_QUEUE")

	// poll interval seconds (optional env). Default 1s.
	intervalSec := 1
	if v := os.Getenv("WORKER_POLL_INTERVAL_SECONDS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			intervalSec = n
		}
	}

	// Start background poller
	go func() {
		log.Printf("bootstrap: starting poller (queue=%s, interval=%ds)", queue, intervalSec)
		ticker := time.NewTicker(time.Duration(intervalSec) * time.Second)
		defer ticker.Stop()
		for {
			body, err := controller.FetchOneMessage(amqpURL, queue)
			if err != nil {
				log.Printf("bootstrap: error fetching message: %v", err)
			} else if body != "" {
				log.Printf("bootstrap: got message: %s", body)
			}
			<-ticker.C
		}
	}()

	// Start HTTP server (blocks)
	server.Start()
}
