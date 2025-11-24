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
