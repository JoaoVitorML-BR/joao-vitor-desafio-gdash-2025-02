import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { WeatherQueryDto } from './dto/weather-query.dto';
import type { PaginatedResult, WeatherInsights } from './dto/weather-response.dto';
import type { WeatherLog } from './schemas/weather-log.schema';
import { API_BASE_PATH } from '../../common/constants/api.constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('weather')
@Controller(`${API_BASE_PATH}/weather`)
export class WeatherController {
    constructor(private readonly weatherService: WeatherService) { }

    @Post('logs')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Criar um novo registro climático (usado pelo Go worker)',
        description: 'Endpoint público usado pelo Go Worker para inserir dados climáticos processados.',
    })
    @ApiResponse({
        status: 201,
        description: 'Registro criado com sucesso',
        schema: {
            example: {
                _id: '507f1f77bcf86cd799439011',
                id: 'weather_20251127_103000',
                fetched_at: '2025-11-27T10:30:00.000Z',
                latitude: -9.747399554832585,
                longitude: -36.666791770043595,
                temperature: 28.5,
                humidity: 65,
                precipitation_probability: 20,
                createdAt: '2025-11-27T10:30:05.000Z',
                updatedAt: '2025-11-27T10:30:05.000Z',
            },
        },
    })
    @ApiResponse({ status: 409, description: 'Registro duplicado - ID já existe.' })
    @ApiResponse({ status: 400, description: 'Dados inválidos.' })
    async create(@Body() createDto: CreateWeatherLogDto) {
        return this.weatherService.create(createDto);
    }

    @Get('logs')
    @ApiOperation({
        summary: 'Obter todos os registros climáticos',
        description: 'Requer autenticação. Retorna todos os registros sem paginação (use /logs/filtered para paginação).',
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de registros climáticos retornada com sucesso',
        schema: {
            example: [
                {
                    _id: '507f1f77bcf86cd799439011',
                    id: 'weather_20251127_103000',
                    fetched_at: '2025-11-27T10:30:00.000Z',
                    latitude: -9.747399554832585,
                    longitude: -36.666791770043595,
                    temperature: 28.5,
                    humidity: 65,
                    precipitation_probability: 20,
                },
                {
                    _id: '507f1f77bcf86cd799439012',
                    id: 'weather_20251127_104000',
                    fetched_at: '2025-11-27T10:40:00.000Z',
                    latitude: -9.747399554832585,
                    longitude: -36.666791770043595,
                    temperature: 29.0,
                    humidity: 63,
                    precipitation_probability: 15,
                },
            ],
        },
    })
    @ApiResponse({ status: 401, description: 'Não autorizado - Token ausente ou inválido.' })
    @UseGuards(JwtAuthGuard)
    async findAll() {
        return this.weatherService.findAll();
    }

    @Get('logs/filtered')
    @ApiOperation({
        summary: 'Obter registros climáticos com filtros e paginação',
        description: 'Requer autenticação. Filtre por data, temperatura, umidade e pagine os resultados.',
    })
    @ApiResponse({
        status: 200,
        description: 'Lista paginada de registros climáticos',
        schema: {
            example: {
                data: [
                    {
                        _id: '507f1f77bcf86cd799439011',
                        id: 'weather_20251127_103000',
                        fetched_at: '2025-11-27T10:30:00.000Z',
                        latitude: -9.747399554832585,
                        longitude: -36.666791770043595,
                        temperature: 28.5,
                        humidity: 65,
                        precipitation_probability: 20,
                    },
                ],
                pagination: {
                    total: 150,
                    page: 1,
                    limit: 10,
                    totalPages: 15,
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Não autorizado - Token ausente ou inválido.' })
    @UseGuards(JwtAuthGuard)
    async findWithFilters(@Query() query: WeatherQueryDto): Promise<PaginatedResult<WeatherLog>> {
        return this.weatherService.findWithFilters(query);
    }

    @Get('logs/:id')
    @ApiOperation({
        summary: 'Obter um registro climático por ID interno',
        description: 'Requer autenticação. Busca por MongoDB ObjectId (_id).',
    })
    @ApiResponse({
        status: 200,
        description: 'Registro climático retornado com sucesso',
        schema: {
            example: {
                _id: '507f1f77bcf86cd799439011',
                id: 'weather_20251127_103000',
                fetched_at: '2025-11-27T10:30:00.000Z',
                latitude: -9.747399554832585,
                longitude: -36.666791770043595,
                temperature: 28.5,
                humidity: 65,
                precipitation_probability: 20,
                createdAt: '2025-11-27T10:30:05.000Z',
                updatedAt: '2025-11-27T10:30:05.000Z',
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Registro climático não encontrado.' })
    @ApiResponse({ status: 401, description: 'Não autorizado - Token ausente ou inválido.' })
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

    @Get('insights')
    @ApiOperation({
        summary: 'Obter insights e análises dos dados climáticos',
        description: 'Requer autenticação. Retorna estatísticas calculadas (médias, mín/máx) dos dados filtrados.',
    })
    @ApiResponse({
        status: 200,
        description: 'Insights gerados com sucesso',
        schema: {
            example: {
                summary: {
                    totalRecords: 1440,
                    dateRange: {
                        start: '2025-11-26T00:00:00.000Z',
                        end: '2025-11-27T23:59:59.999Z',
                    },
                },
                temperature: {
                    average: 27.8,
                    min: 22.5,
                    max: 32.1,
                    trend: 'stable',
                },
                humidity: {
                    average: 68.5,
                    min: 45,
                    max: 85,
                },
                precipitation: {
                    averageProbability: 35.2,
                    daysWithRain: 12,
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Não autorizado - Token ausente ou inválido.' })
    @UseGuards(JwtAuthGuard)
    async getInsights(@Query() query: WeatherQueryDto): Promise<WeatherInsights> {
        return this.weatherService.getInsights(query);
    }

    @Get('export/csv')
    @ApiOperation({
        summary: 'Exportar dados climáticos em CSV',
        description: 'Requer autenticação. Gera arquivo CSV com dados filtrados para download.',
    })
    @ApiResponse({
        status: 200,
        description: 'Arquivo CSV gerado com sucesso (Content-Type: text/csv)',
    })
    @ApiResponse({ status: 401, description: 'Não autorizado - Token ausente ou inválido.' })
    @UseGuards(JwtAuthGuard)
    async exportCsv(@Query() query: WeatherQueryDto, @Res() res: Response): Promise<void> {
        return this.weatherService.exportToCsv(query, res);
    }

    @Get('export/xlsx')
    @ApiOperation({
        summary: 'Exportar dados climáticos em XLSX',
        description: 'Requer autenticação. Gera planilha Excel com dados filtrados para download.',
    })
    @ApiResponse({
        status: 200,
        description: 'Arquivo XLSX gerado com sucesso (Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)',
    })
    @ApiResponse({ status: 401, description: 'Não autorizado - Token ausente ou inválido.' })
    @UseGuards(JwtAuthGuard)
    async exportXlsx(@Query() query: WeatherQueryDto, @Res() res: Response): Promise<void> {
        return this.weatherService.exportToXlsx(query, res);
    }
}