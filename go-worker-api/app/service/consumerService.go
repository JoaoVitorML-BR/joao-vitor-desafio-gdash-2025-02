package service

import (
	"os"

	amqp "github.com/rabbitmq/amqp091-go"
)

func GetOneMessage(amqpURL, queue string) (string, error) {
	if amqpURL == "" {
		amqpURL = os.Getenv("RABBITMQ_URL")
	}
	if queue == "" {
		queue = os.Getenv("RABBITMQ_QUEUE")
		if queue == "" {
			queue = "weather_logs_queue"
		}
	}

	conn, err := amqp.Dial(amqpURL)
	if err != nil {
		return "", err
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		return "", err
	}
	defer ch.Close()

	delivery, ok, err := ch.Get(queue, false)
	if err != nil {
		return "", err
	}
	if !ok {
		return "", nil
	}

	body := string(delivery.Body)

	if err := delivery.Ack(false); err != nil {
		return body, err
	}

	return body, nil
}
