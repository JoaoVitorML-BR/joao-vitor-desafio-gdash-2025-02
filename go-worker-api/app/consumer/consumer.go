package consumer

import (
	"bytes"
	"errors"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/JoaoVitorML-BR/joao-vitor-desafio-gdash-2025-02/app/store"
	amqp "github.com/rabbitmq/amqp091-go"
)

func StartConsumer(amqpURL, queue string) {
	go func() {
		nestURL := os.Getenv("NEST_API_URL")
		if nestURL == "" {
			nestURL = "http://localhost:3000"
		}

		maxAttempts := 3
		if v := os.Getenv("WORKER_RETRY_ATTEMPTS"); v != "" {
			if n, err := strconv.Atoi(v); err == nil && n > 0 {
				maxAttempts = n
			}
		}

		backoffMs := 500
		if v := os.Getenv("WORKER_RETRY_BACKOFF_MS"); v != "" {
			if n, err := strconv.Atoi(v); err == nil && n >= 0 {
				backoffMs = n
			}
		}

		client := &http.Client{Timeout: 10 * time.Second}

		for {
			conn, err := amqp.Dial(amqpURL)
			if err != nil {
				log.Printf("consumer: dial error: %v — retrying in 5s", err)
				time.Sleep(5 * time.Second)
				continue
			}

			ch, err := conn.Channel()
			if err != nil {
				log.Printf("consumer: channel error: %v", err)
				conn.Close()
				time.Sleep(5 * time.Second)
				continue
			}

			msgs, err := ch.Consume(queue, "", false, false, false, false, nil)
			if err != nil {
				log.Printf("consumer: consume error: %v", err)
				ch.Close()
				conn.Close()
				time.Sleep(5 * time.Second)
				continue
			}

			log.Printf("consumer: connected and consuming from %s", queue)

			for d := range msgs {
				payload := d.Body

				success := false
				var lastErr error

				for attempt := 1; attempt <= maxAttempts; attempt++ {
					if err := forwardToNest(client, nestURL, payload); err == nil {
						success = true
						break
					} else {
						lastErr = err
						sleep := time.Duration(backoffMs*attempt) * time.Millisecond
						log.Printf("consumer: forward attempt %d/%d failed: %v — retrying in %v", attempt, maxAttempts, err, sleep)
						time.Sleep(sleep)
					}
				}

				if success {
					if err := d.Ack(false); err != nil {
						log.Printf("consumer: ack error: %v", err)
					} else {
						store.SetLatest(string(payload))
						log.Printf("consumer: forwarded and acked message")
					}
				} else {
					if err := d.Nack(false, false); err != nil {
						log.Printf("consumer: nack error: %v", err)
					}
					log.Printf("consumer: failed to forward message after %d attempts: %v", maxAttempts, lastErr)
				}
			}

			ch.Close()
			conn.Close()
			log.Printf("consumer: disconnected, will reconnect in 2s")
			time.Sleep(2 * time.Second)
		}
	}()
}

func forwardToNest(client *http.Client, nestURL string, payload []byte) error {
	url := nestURL + "/api/weather/logs"
	req, err := http.NewRequest("POST", url, bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer func() { io.Copy(io.Discard, resp.Body); resp.Body.Close() }()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return nil
	}

	if resp.StatusCode >= 500 {
		return errors.New("nest returned 5xx: " + resp.Status)
	}
	return errors.New("nest returned non-success: " + resp.Status)
}
