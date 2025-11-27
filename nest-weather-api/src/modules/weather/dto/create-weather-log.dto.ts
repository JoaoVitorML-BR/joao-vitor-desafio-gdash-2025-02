import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWeatherLogDto {
    @ApiProperty({ description: 'ID único do registro gerado pela API Python' })
    @IsNotEmpty()
    @IsString()
    id: string;

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

    @ApiPropertyOptional({ description: 'Umidade relativa em percentual' })
    @IsOptional()
    @IsNumber()
    humidity?: number;

    @ApiPropertyOptional({ description: 'Probabilidade de precipitação em percentual' })
    @IsOptional()
    @IsNumber()
    precipitation_probability?: number;
}
