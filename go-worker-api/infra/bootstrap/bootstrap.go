package bootstrap

import (
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/JoaoVitorML-BR/joao-vitor-desafio-gdash-2025-02/app/controller"
	"github.com/JoaoVitorML-BR/joao-vitor-desafio-gdash-2025-02/infra/server"
)

func Start() {
	amqpURL := os.Getenv("RABBITMQ_URL")
	queue := os.Getenv("RABBITMQ_QUEUE")

	// sanitize env values: trim space and surrounding quotes if present
	amqpURL = strings.TrimSpace(amqpURL)
	amqpURL = strings.Trim(amqpURL, `"'`)
	queue = strings.TrimSpace(queue)

	// validate AMQP URL schema early to avoid noisy runtime errors
	if amqpURL == "" || !(strings.HasPrefix(amqpURL, "amqp://") || strings.HasPrefix(amqpURL, "amqps://")) {
		log.Fatalf("bootstrap: invalid RABBITMQ_URL %q; must start with \"amqp://\" or \"amqps://\". Example: amqp://guest:guest@rabbitmq:5672/", amqpURL)
	}

	if queue == "" {
		queue = "weather_logs_queue"
		log.Printf("bootstrap: RABBITMQ_QUEUE not set, defaulting to %q", queue)
	}

	intervalSec := 1
	if v := os.Getenv("WORKER_POLL_INTERVAL_SECONDS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			intervalSec = n
		}
	}

	// Start background poller
	go func() {
		ticker := time.NewTicker(time.Duration(intervalSec) * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			body, err := controller.FetchOneMessage(amqpURL, queue)
			if err != nil {
				log.Printf("bootstrap: error fetching message: %v", err)
			} else if body != "" {
				log.Printf("bootstrap: got message: %s", body)
			}
		}
	}()

	// Start HTTP server (blocks)
	server.Start()
}
