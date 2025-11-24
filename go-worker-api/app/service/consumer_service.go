package service

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/JoaoVitorML-BR/joao-vitor-desafio-gdash-2025-02/app/client"
	"github.com/JoaoVitorML-BR/joao-vitor-desafio-gdash-2025-02/app/transformer"
	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	ReconnectDelay    = 30 * time.Second
	MaxRetries        = 5
	ConsumeRetryDelay = 5 * time.Second
)

// Consumer response of the RabbitMQ message consumption service
type Consumer struct {
	amqpURL     string
	queue       string
	nestClient  *client.NestClient
	transformer *transformer.WeatherTransformer
}

// NewConsumer creates a new instance of the Consumer
func NewConsumer(amqpURL, queue string) *Consumer {
	return &Consumer{
		amqpURL:     amqpURL,
		queue:       queue,
		nestClient:  client.NewNestClient(),
		transformer: transformer.NewWeatherTransformer(),
	}
}

func handleErrorAndDelay(ctx context.Context, duration time.Duration, msg string, err error) error {
	log.Printf("service: %s: %v — reconnecting in %s", msg, err, duration)
	select {
	case <-time.After(duration):
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

func (c *Consumer) connectAndConsume(ctx context.Context) error {
	log.Printf("service: Trying to connect to RabbitMQ...")

	conn, err := amqp.Dial(c.amqpURL)
	if err != nil {
		return handleErrorAndDelay(ctx, ReconnectDelay, "dial error", err)
	}
	defer conn.Close()

	go func() {
		if closeErr := <-conn.NotifyClose(make(chan *amqp.Error)); closeErr != nil {
			log.Printf("service: AMQP connection closed unexpectedly: %v", closeErr)
		}
	}()

	ch, err := conn.Channel()
	if err != nil {
		return handleErrorAndDelay(ctx, ReconnectDelay, "channel error", err)
	}
	defer ch.Close()

	msgs, err := ch.Consume(c.queue, "", false, false, false, false, nil)
	if err != nil {
		return handleErrorAndDelay(ctx, ConsumeRetryDelay, "consume error", err)
	}

	log.Printf("service: Connected and consuming from %s", c.queue)

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case d, ok := <-msgs:
			if !ok {
				log.Printf("service: AMQP message channel closed unexpectedly.")
				return errors.New("AMQP message channel closed")
			}
			go c.processMessage(d)
		}
	}
}

func (c *Consumer) Run(ctx context.Context) error {
	for {
		if ctx.Err() != nil {
			return ctx.Err()
		}

		err := c.connectAndConsume(ctx)

		if errors.Is(err, context.Canceled) {
			return err
		}

		log.Printf("service: Desconectado, reconectando em %s", ReconnectDelay)

		select {
		case <-time.After(ReconnectDelay):
			continue
		case <-ctx.Done():
			return ctx.Err()
		}
	}
}

// processMessage processes a single message from RabbitMQ
func (c *Consumer) processMessage(d amqp.Delivery) {
	log.Printf("service: message received (%d bytes)", len(d.Body))

	var lastErr error
	for attempt := 1; attempt <= MaxRetries; attempt++ {
		err := c.forwardToNest(d.Body)
		if err == nil {
			log.Printf("service: sent to NestJS successfully (attempt %d)", attempt)
			if err := d.Ack(false); err != nil {
				log.Printf("service: ack error: %v", err)
			}
			return
		}

		lastErr = err
		if attempt < MaxRetries {
			log.Printf("service: error sending to NestJS (attempt %d/%d): %v. Waiting %s.", attempt, MaxRetries, err, ReconnectDelay)
			time.Sleep(ReconnectDelay)
		} else {
			log.Printf("service: final error sending to NestJS (attempt %d/%d): %v.", attempt, MaxRetries, err)
		}
	}

	if lastErr != nil {
		log.Printf("service: all attempts failed, re-queuing message.")
		if err := d.Nack(false, true); err != nil {
			log.Printf("service: nack error: %v", err)
		}
	}
}

// forwardToNest transforms and sends data to the NestJS API
func (c *Consumer) forwardToNest(payload []byte) error {
	// Transform full data into simplified data
	simplifiedData, err := c.transformer.ParseAndSimplify(payload)
	if err != nil {
		return err
	}

	// Convert to JSON
	simplifiedPayload, err := c.transformer.ToJSON(simplifiedData)
	if err != nil {
		return err
	}

	log.Printf("service: dados transformados (original: %d bytes → simplificado: %d bytes)",
		len(payload), len(simplifiedPayload))

	// Send to NestJS
	return c.nestClient.SendWeatherData(simplifiedPayload)
}
