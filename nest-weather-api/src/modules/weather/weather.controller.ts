import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { API_BASE_PATH } from '../../common/constants/api.constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('weather')
@Controller(`${API_BASE_PATH}/weather`)
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

    @Get('logs')
    @ApiOperation({ summary: 'Obter todos os registros climáticos' })
    @ApiResponse({ status: 200, description: 'Lista de registros climáticos retornada com sucesso' })
    @UseGuards(JwtAuthGuard)
    async findAll() {
        return this.weatherService.findAll();
    }

    @Get('logs/:id')
    @ApiOperation({ summary: 'Obter um registro climático por ID interno' })
    @ApiResponse({ status: 200, description: 'Registro climático retornado com sucesso' })
    @ApiResponse({ status: 404, description: 'Registro climático não encontrado' })
    @UseGuards(JwtAuthGuard)
    async findById(@Param('id') id: string) {
        return this.weatherService.findById(id);
    }

    @Get('logs/external/:externalId')
    @ApiOperation({ summary: 'Obter um registro climático por ID externo' })
    @ApiResponse({ status: 200, description: 'Registro climático retornado com sucesso' })
    @ApiResponse({ status: 404, description: 'Registro climático não encontrado' })
    @UseGuards(JwtAuthGuard)
    async findByExternalId(@Param('externalId') externalId: string) {
        return this.weatherService.findByExternalId(externalId);
    }
}