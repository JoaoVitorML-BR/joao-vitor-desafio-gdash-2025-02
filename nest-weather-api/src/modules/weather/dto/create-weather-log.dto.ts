import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWeatherLogDto {
    @ApiProperty({ description: 'ID único do registro gerado pela API Python' })
    @IsNotEmpty()
    @IsString()
    id: string;

    @ApiProperty({ description: 'Versão do schema do payload' })
    @IsNotEmpty()
    @IsNumber()
    schema_version: number;

    @ApiProperty({ description: 'Data e hora da coleta (ISO 8601)' })
    @IsNotEmpty()
    @IsDateString()
    fetched_at: string;

    @ApiProperty({ description: 'Latitude da localização' })
    @IsNotEmpty()
    @IsNumber()
    latitude: number;

    @ApiProperty({ description: 'Longitude da localização' })
    @IsNotEmpty()
    @IsNumber()
    longitude: number;

    @ApiProperty({ description: 'Temperatura em graus Celsius' })
    @IsNotEmpty()
    @IsNumber()
    temperature: number;

    @ApiPropertyOptional({ description: 'Velocidade do vento em km/h' })
    @IsOptional()
    @IsNumber()
    wind_speed?: number;

    @ApiPropertyOptional({ description: 'Direção do vento em graus' })
    @IsOptional()
    @IsNumber()
    wind_direction?: number;

    @ApiPropertyOptional({ description: 'Código de condição climática WMO' })
    @IsOptional()
    @IsNumber()
    weather_code?: number;

    @ApiPropertyOptional({ description: 'Umidade relativa em percentual' })
    @IsOptional()
    @IsNumber()
    humidity?: number;

    @ApiPropertyOptional({ description: 'Probabilidade de precipitação em percentual' })
    @IsOptional()
    @IsNumber()
    precipitation_probability?: number;

    @ApiPropertyOptional({ description: 'Fonte dos dados (OpenMeteo, OpenWeather, etc.)' })
    @IsOptional()
    @IsString()
    source?: string;

    @ApiPropertyOptional({ description: 'Dados brutos da API original' })
    @IsOptional()
    @IsObject()
    raw?: Record<string, any>;
}
