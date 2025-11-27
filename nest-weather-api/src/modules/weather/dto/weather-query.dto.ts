import { IsOptional, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class WeatherQueryDto {
    @ApiPropertyOptional({ description: 'Data inicial (ISO 8601)' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ description: 'Data final (ISO 8601)' })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ description: 'Temperatura mínima (°C)' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    minTemp?: number;

    @ApiPropertyOptional({ description: 'Temperatura máxima (°C)' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxTemp?: number;

    @ApiPropertyOptional({ description: 'Umidade mínima (%)' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(100)
    minHumidity?: number;

    @ApiPropertyOptional({ description: 'Umidade máxima (%)' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(100)
    maxHumidity?: number;

    @ApiPropertyOptional({ description: 'Página atual', minimum: 1, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Itens por página', minimum: 1, maximum: 100, default: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 20;
}
