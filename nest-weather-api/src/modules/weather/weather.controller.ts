import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';

@ApiTags('weather')
@Controller('api/weather')
export class WeatherController {
    constructor(private readonly weatherService: WeatherService) { }

    @Post('logs')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Criar um novo registro climático (usado pelo Go worker)' })
    @ApiResponse({ status: 201, description: 'Registro criado com sucesso' })
    @ApiResponse({ status: 409, description: 'Registro duplicado' })
    async create(@Body() createDto: CreateWeatherLogDto) {
        return this.weatherService.create(createDto);
    }
}