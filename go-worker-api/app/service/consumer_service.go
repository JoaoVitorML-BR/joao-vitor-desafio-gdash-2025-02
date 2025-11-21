package service

import (
	"context"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type Consumer struct {
	amqpURL string
	queue   string
}

func NewConsumer(amqpURL, queue string) *Consumer {
	return &Consumer{
		amqpURL: amqpURL,
		queue:   queue,
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
