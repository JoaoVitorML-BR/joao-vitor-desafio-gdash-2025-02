package service

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	ReconnectDelay    = 30 * time.Second
	MaxRetries        = 5
	ConsumeRetryDelay = 5 * time.Second
)

type Consumer struct {
	amqpURL string
	queue   string
	nestURL string
	client  *http.Client
}

func NewConsumer(amqpURL, queue string) *Consumer {
	nestURL := os.Getenv("NEST_API_URL")
	if nestURL == "" {
		nestURL = "http://localhost:3000"
	}
	return &Consumer{
		amqpURL: amqpURL,
		queue:   queue,
		nestURL: nestURL,
		client:  &http.Client{Timeout: 10 * time.Second},
	}
}

func handleErrorAndDelay(ctx context.Context, duration time.Duration, msg string, err error) error {
	log.Printf("service: %s: %v — reconectando em %s", msg, err, duration)
	select {
	case <-time.After(duration):
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

func (c *Consumer) connectAndConsume(ctx context.Context) error {
	log.Printf("service: Tentando conectar ao RabbitMQ...")

	conn, err := amqp.Dial(c.amqpURL)
	if err != nil {
		return handleErrorAndDelay(ctx, ReconnectDelay, "dial error", err)
	}
	defer conn.Close()

	go func() {
		if closeErr := <-conn.NotifyClose(make(chan *amqp.Error)); closeErr != nil {
			log.Printf("service: conexão AMQP fechada inesperadamente: %v", closeErr)
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

	log.Printf("service: ✅ Conectado e consumindo de %s", c.queue)

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case d, ok := <-msgs:
			if !ok {
				log.Printf("service: Canal de mensagens AMQP fechou inesperadamente.")
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

// processMessage response for a single message delivery.
func (c *Consumer) processMessage(d amqp.Delivery) {
	log.Printf("service: received message: %s", string(d.Body))

	var lastErr error
	for attempt := 1; attempt <= MaxRetries; attempt++ {
		err := c.forwardToNest(d.Body)
		if err == nil {
			log.Printf("service: enviado para NestJS com sucesso (tentativa %d)", attempt)
			if err := d.Ack(false); err != nil {
				log.Printf("service: ack error: %v", err)
			}
			return
		}

		lastErr = err
		if attempt < MaxRetries {
			log.Printf("service: erro ao enviar para NestJS (tentativa %d/%d): %v. Esperando %s.", attempt, MaxRetries, err, ReconnectDelay)
			time.Sleep(ReconnectDelay)
		} else {
			log.Printf("service: erro final ao enviar para NestJS (tentativa %d/%d): %v.", attempt, MaxRetries, err)
		}
	}

	if lastErr != nil {
		log.Printf("service: todas as tentativas falharam, re-enfileirando mensagem.")
		if err := d.Nack(false, true); err != nil {
			log.Printf("service: nack error: %v", err)
		}
	}
}

// forwardToNest sends the payload to the NestJS API.
func (c *Consumer) forwardToNest(payload []byte) error {
	url := c.nestURL + "/api/weather/logs"
	req, err := http.NewRequest("POST", url, bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("creating request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.client.Do(req)
	if err != nil {
		return fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return nil
	}

	bodyBytes, _ := io.ReadAll(resp.Body)
	return fmt.Errorf("HTTP request failed with status: %d. Response: %s", resp.StatusCode, string(bodyBytes))
}
