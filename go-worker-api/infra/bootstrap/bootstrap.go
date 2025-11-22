package bootstrap

import (
	"log"
	"os"
	"strings"

	"github.com/JoaoVitorML-BR/joao-vitor-desafio-gdash-2025-02/app/controller"
	"github.com/JoaoVitorML-BR/joao-vitor-desafio-gdash-2025-02/app/service"
	"github.com/JoaoVitorML-BR/joao-vitor-desafio-gdash-2025-02/infra/server"
)

// Start boots the worker consumer and HTTP server.
func Start() {
	amqpURL := os.Getenv("RABBITMQ_URL")
	amqpURL = strings.TrimSpace(amqpURL)
	amqpURL = strings.Trim(amqpURL, "\"'")
	if amqpURL == "" {
		log.Fatal("bootstrap: RABBITMQ_URL is required")
	}
	if !strings.HasPrefix(amqpURL, "amqp://") && !strings.HasPrefix(amqpURL, "amqps://") {
		log.Fatalf("bootstrap: AMQP scheme must be either 'amqp://' or 'amqps://', got: %s", amqpURL)
	}

	queue := os.Getenv("RABBITMQ_QUEUE")
	if queue == "" {
		queue = "weather_logs_queue"
	}

	svc := service.NewConsumer(amqpURL, queue)
	ctrl := controller.NewController(svc)
	ctrl.Start()

	// start HTTP server (blocking)
	server.Start()
}
