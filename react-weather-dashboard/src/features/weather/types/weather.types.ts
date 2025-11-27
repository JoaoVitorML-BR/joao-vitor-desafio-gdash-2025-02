export interface WeatherLog {
    _id: string;
    externalId: string;
    fetchedAt: string;
    latitude: number;
    longitude: number;
    temperature: number;
    humidity?: number;
    precipitationProbability?: number;
}

export interface WeatherFilters {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    minTemp?: number;
    maxTemp?: number;
    minHumidity?: number;
    maxHumidity?: number;
}

export interface WeatherPagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginatedWeatherResponse {
    data: WeatherLog[];
    pagination: WeatherPagination;
}