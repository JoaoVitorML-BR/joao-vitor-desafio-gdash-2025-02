import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WeatherLogResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    externalId: string;

    @ApiProperty()
    schemaVersion: number;

    @ApiProperty()
    fetchedAt: Date;

    @ApiProperty()
    latitude: number;

    @ApiProperty()
    longitude: number;

    @ApiProperty()
    temperature: number;

    @ApiPropertyOptional()
    windSpeed?: number;

    @ApiPropertyOptional()
    windDirection?: number;

    @ApiPropertyOptional()
    weatherCode?: number;

    @ApiPropertyOptional()
    humidity?: number;

    @ApiPropertyOptional()
    precipitationProbability?: number;

    @ApiProperty()
    source: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class PaginatedWeatherResponseDto {
    @ApiProperty({ type: [WeatherLogResponseDto] })
    data: WeatherLogResponseDto[];

    @ApiProperty()
    total: number;

    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    totalPages: number;
}

export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface WeatherInsights {
    summary: {
        avgTemperature: number;
        minTemperature: number;
        maxTemperature: number;
        avgHumidity: number;
        totalRecords: number;
        dateRange: {
            from: string;
            to: string;
        };
    };
    trends: {
        temperatureTrend: string;
        temperatureChange: number;
    };
    classification: string;
    alerts: string[];
    aiInsights?: {
        trends: string[];
        recommendations: string[];
    };
}
