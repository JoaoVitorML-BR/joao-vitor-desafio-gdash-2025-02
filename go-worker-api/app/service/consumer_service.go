package service

import (
	"bytes"
	"context"
	"log"
	"net/http"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
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

func (c *Consumer) Run(ctx context.Context) error {
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		conn, err := amqp.Dial(c.amqpURL)
		if err != nil {
			log.Printf("service: dial error: %v — retrying in 5s", err)
			select {
			case <-time.After(5 * time.Second):
				continue
			case <-ctx.Done():
				return ctx.Err()
			}
		}

		ch, err := conn.Channel()
		if err != nil {
			log.Printf("service: channel error: %v", err)
			conn.Close()
			select {
			case <-time.After(5 * time.Second):
				continue
			case <-ctx.Done():
				return ctx.Err()
			}
		}

		msgs, err := ch.Consume(c.queue, "", false, false, false, false, nil)
		if err != nil {
			log.Printf("service: consume error: %v", err)
			ch.Close()
			conn.Close()
			select {
			case <-time.After(5 * time.Second):
				continue
			case <-ctx.Done():
				return ctx.Err()
			}
		}

		log.Printf("service: connected and consuming from %s", c.queue)

		done := make(chan struct{})
		go func() {
			defer close(done)
			for d := range msgs {
				log.Printf("service: received message: %s", string(d.Body))
				// Tenta enviar para a API NestJS
				if err := c.forwardToNest(d.Body); err != nil {
					log.Printf("service: erro ao enviar para NestJS: %v", err)
				} else {
					log.Printf("service: enviado para NestJS com sucesso")
				}
				if err := d.Ack(false); err != nil {
					log.Printf("service: ack error: %v", err)
				}
			}
		}()

		select {
		case <-ctx.Done():
			ch.Close()
			conn.Close()
			<-done
			return ctx.Err()
		case <-done:
			ch.Close()
			conn.Close()
			log.Printf("service: disconnected, will reconnect in 2s")
			select {
			case <-time.After(2 * time.Second):
				continue
			case <-ctx.Done():
				return ctx.Err()
			}
		}
	}
}

// Envia o payload para a API NestJS via HTTP POST
func (c *Consumer) forwardToNest(payload []byte) error {
	url := c.nestURL + "/api/weather/logs"
	req, err := http.NewRequest("POST", url, bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return nil
	}
	return err

}
