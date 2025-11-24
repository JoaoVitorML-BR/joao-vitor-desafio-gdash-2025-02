package model

// WeatherDataFull represents the complete weather data payload structure
type WeatherDataFull struct {
	ID                       string                 `json:"id"`
	SchemaVersion            int                    `json:"schema_version,omitempty"`
	FetchedAt                string                 `json:"fetched_at"`
	Latitude                 float64                `json:"latitude"`
	Longitude                float64                `json:"longitude"`
	Temperature              float64                `json:"temperature"`
	WindSpeed                *float64               `json:"wind_speed,omitempty"`
	WindDirection            *float64               `json:"wind_direction,omitempty"`
	WeatherCode              *int                   `json:"weather_code,omitempty"`
	Humidity                 *float64               `json:"humidity,omitempty"`
	PrecipitationProbability *float64               `json:"precipitation_probability,omitempty"`
	Source                   string                 `json:"source,omitempty"`
	Raw                      map[string]interface{} `json:"raw,omitempty"`
}

// WeatherDataSimplified represents only the essential data sent to NestJS
type WeatherDataSimplified struct {
	ID                       string   `json:"id"`
	FetchedAt                string   `json:"fetched_at"`
	Latitude                 float64  `json:"latitude"`
	Longitude                float64  `json:"longitude"`
	Temperature              float64  `json:"temperature"`
	Humidity                 *float64 `json:"humidity,omitempty"`
	PrecipitationProbability *float64 `json:"precipitation_probability,omitempty"`
}
