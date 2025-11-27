package transformer

import (
	"encoding/json"
	"fmt"

	"github.com/JoaoVitorML-BR/joao-vitor-desafio-gdash-2025-02/app/model"
)

// WeatherTransformer responsible for transforming weather data
type WeatherTransformer struct{}

// NewWeatherTransformer creates a new instance of the transformer
func NewWeatherTransformer() *WeatherTransformer {
	return &WeatherTransformer{}
}

// ParseAndSimplify converts the full JSON payload into simplified data
func (t *WeatherTransformer) ParseAndSimplify(payload []byte) (*model.WeatherDataSimplified, error) {
	var fullData model.WeatherDataFull
	if err := json.Unmarshal(payload, &fullData); err != nil {
		return nil, fmt.Errorf("parsing payload: %w", err)
	}

	simplified := &model.WeatherDataSimplified{
		ID:                       fullData.ID,
		FetchedAt:                fullData.FetchedAt,
		Latitude:                 fullData.Latitude,
		Longitude:                fullData.Longitude,
		Temperature:              fullData.Temperature,
		Humidity:                 fullData.Humidity,
		PrecipitationProbability: fullData.PrecipitationProbability,
	}

	return simplified, nil
}

// ToJSON converts simplified data into JSON
func (t *WeatherTransformer) ToJSON(data *model.WeatherDataSimplified) ([]byte, error) {
	payload, err := json.Marshal(data)
	if err != nil {
		return nil, fmt.Errorf("marshaling simplified data: %w", err)
	}
	return payload, nil
}
