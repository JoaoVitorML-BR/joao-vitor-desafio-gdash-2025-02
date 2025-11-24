package client

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"
)

// NestClient HTTP client to communicate with NestJS API
type NestClient struct {
	baseURL string
	client  *http.Client
}

// NewNestClient creates a new instance of the NestJS client
func NewNestClient() *NestClient {
	baseURL := os.Getenv("NEST_API_URL")
	if baseURL == "" {
		baseURL = "http://localhost:9090"
	}

	return &NestClient{
		baseURL: baseURL,
		client:  &http.Client{Timeout: 10 * time.Second},
	}
}

// SendWeatherData sends weather data to the NestJS API
func (nc *NestClient) SendWeatherData(payload []byte) error {
	url := nc.baseURL + "/api/v1/weather/logs"

	req, err := http.NewRequest("POST", url, bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("creating request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := nc.client.Do(req)
	if err != nil {
		return fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		log.Printf("client: data sent successfully (status: %d)", resp.StatusCode)
		return nil
	}

	bodyBytes, _ := io.ReadAll(resp.Body)
	return fmt.Errorf("HTTP request failed with status: %d. Response: %s", resp.StatusCode, string(bodyBytes))
}
