import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { WeatherQueryDto } from './dto/weather-query.dto';
import { PaginatedResult, WeatherInsights } from './dto/weather-response.dto';
import { OpenRouterService } from '../../common/service/openrouter.service';
import { OpenRouterMessage } from '../../common/interfaces/openrouter.interface';
import { toBrazilTime } from '../../common/utils/date.utils';

@Injectable()
export class WeatherService {
    private readonly logger = new Logger(WeatherService.name);

    constructor(
        @InjectModel(WeatherLog.name)
        private weatherLogModel: Model<WeatherLogDocument>,
        private readonly openRouterService: OpenRouterService,
    ) { }

    async create(dto: CreateWeatherLogDto): Promise<WeatherLog> {
        try {
            const weatherLog = new this.weatherLogModel({
                externalId: dto.id,
                fetchedAt: new Date(dto.fetched_at),
                latitude: dto.latitude,
                longitude: dto.longitude,
                temperature: dto.temperature,
                humidity: dto.humidity,
                precipitationProbability: dto.precipitation_probability,
            });

            const saved = await weatherLog.save();
            return saved;
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException('Weather log with this ID already exists');
            }
            throw error;
        }
    }

    async findAll(): Promise<WeatherLog[]> {
        return this.weatherLogModel.find().exec();
    }

    async findById(id: string): Promise<WeatherLog | null> {
        return this.weatherLogModel.findById(id).exec();
    }

    async findByExternalId(externalId: string): Promise<WeatherLog | null> {
        return this.weatherLogModel.findOne({ externalId }).exec();
    }

    async findWithFilters(query: WeatherQueryDto): Promise<PaginatedResult<WeatherLog>> {
        const filter: any = {};

        if (query.startDate || query.endDate) {
            filter.fetchedAt = {};
            if (query.startDate) {
                filter.fetchedAt.$gte = new Date(query.startDate);
            }
            if (query.endDate) {
                filter.fetchedAt.$lte = new Date(query.endDate);
            }
        }

        if (query.minTemp !== undefined || query.maxTemp !== undefined) {
            filter.temperature = {};
            if (query.minTemp !== undefined) {
                filter.temperature.$gte = query.minTemp;
            }
            if (query.maxTemp !== undefined) {
                filter.temperature.$lte = query.maxTemp;
            }
        }

        if (query.minHumidity !== undefined || query.maxHumidity !== undefined) {
            filter.humidity = {};
            if (query.minHumidity !== undefined) {
                filter.humidity.$gte = query.minHumidity;
            }
            if (query.maxHumidity !== undefined) {
                filter.humidity.$lte = query.maxHumidity;
            }
        }

        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.weatherLogModel
                .find(filter)
                .sort({ fetchedAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.weatherLogModel.countDocuments(filter).exec(),
        ]);

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getInsights(query: WeatherQueryDto): Promise<WeatherInsights> {
        const filter: any = {};

        if (query.startDate || query.endDate) {
            filter.fetchedAt = {};
            if (query.startDate) {
                filter.fetchedAt.$gte = new Date(query.startDate);
            }
            if (query.endDate) {
                filter.fetchedAt.$lte = new Date(query.endDate);
            }
        }

        const logs = await this.weatherLogModel.find(filter).sort({ fetchedAt: -1 }).exec();

        if (logs.length === 0) {
            return {
                summary: {
                    avgTemperature: 0,
                    minTemperature: 0,
                    maxTemperature: 0,
                    avgHumidity: 0,
                    totalRecords: 0,
                    dateRange: { from: '', to: '' },
                },
                trends: {
                    temperatureTrend: 'stable',
                    temperatureChange: 0,
                },
                classification: 'Nenhum dado disponível para análise',
                alerts: [],
            };
        }

        // Calculate statistics efficiently
        const stats = logs.reduce(
            (acc, log) => {
                if (log.temperature != null) {
                    acc.temps.push(log.temperature);
                    acc.tempSum += log.temperature;
                }
                if (log.humidity != null) {
                    acc.humidities.push(log.humidity);
                    acc.humiditySum += log.humidity;
                }
                if (log.precipitationProbability != null) {
                    acc.precipSum += log.precipitationProbability;
                    acc.precipCount++;
                }
                return acc;
            },
            {
                temps: [] as number[],
                tempSum: 0,
                humidities: [] as number[],
                humiditySum: 0,
                precipSum: 0,
                precipCount: 0,
            },
        );

        const avgTemp = stats.tempSum / stats.temps.length;
        const minTemp = Math.min(...stats.temps);
        const maxTemp = Math.max(...stats.temps);
        const avgHumidity = stats.humiditySum / stats.humidities.length;
        const avgPrecipitation = stats.precipSum / stats.precipCount;

        const dateRange = {
            start: logs[logs.length - 1].fetchedAt,
            end: logs[0].fetchedAt,
        };

        // Build prompt for AI
        const systemPrompt = `Você é um assistente especializado em análise meteorológica para empresas de energia solar. 
Analise os dados climáticos fornecidos e gere insights relevantes em português brasileiro.
Seja conciso, objetivo e forneça recomendações práticas focadas em produção de energia solar.`;

        const userPrompt = `Analise os seguintes dados meteorológicos de Alagoas, Brasil:

        📊 **Período**: ${new Date(dateRange.start).toLocaleDateString('pt-BR')} a ${new Date(dateRange.end).toLocaleDateString('pt-BR')}
        📝 **Total de registros**: ${logs.length}

        🌡️ **Temperatura**:
        - Média: ${avgTemp.toFixed(1)}°C
        - Mínima: ${minTemp.toFixed(1)}°C
        - Máxima: ${maxTemp.toFixed(1)}°C

        💧 **Umidade**:
        - Média: ${avgHumidity.toFixed(1)}%

        🌧️ **Precipitação**:
        - Probabilidade média: ${avgPrecipitation.toFixed(1)}%

        Por favor, forneça:
        1. Análise geral do clima no período (2-3 frases)
        2. Tendências observadas (lista de 2-3 itens)
        3. Recomendações práticas para otimização de painéis solares (lista de 2-3 itens)
        4. Alertas importantes, se houver (lista)

        Responda SOMENTE com um JSON válido (sem markdown, sem \`\`\`json) neste formato:
        {
        "summary": "resumo geral em 2-3 frases",
        "trends": ["tendência 1", "tendência 2"],
        "recommendations": ["recomendação 1", "recomendação 2"],
        "alerts": ["alerta importante caso necessário"]
        }`;

        try {
            const messages: OpenRouterMessage[] = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ];

            this.logger.debug('Requesting AI insights from OpenRouter...');
            const aiResponse = await this.openRouterService.generateCompletion(
                messages,
                'x-ai/grok-4.1-fast:free',
                {
                    temperature: 0.5,
                    max_tokens: 800,
                },
            );

            this.logger.debug(`AI response received: ${aiResponse.substring(0, 100)}...`);

            // Parse JSON response
            const cleanResponse = aiResponse.trim().replace(/```json\n?|\n?```/g, '');
            const aiInsights = JSON.parse(cleanResponse);

            return {
                summary: {
                    avgTemperature: parseFloat(avgTemp.toFixed(1)),
                    minTemperature: parseFloat(minTemp.toFixed(1)),
                    maxTemperature: parseFloat(maxTemp.toFixed(1)),
                    avgHumidity: parseFloat(avgHumidity.toFixed(1)),
                    totalRecords: logs.length,
                    dateRange: {
                        from: new Date(dateRange.start).toISOString(),
                        to: new Date(dateRange.end).toISOString(),
                    },
                },
                trends: {
                    temperatureTrend: this.calculateTemperatureTrend(logs),
                    temperatureChange: parseFloat((maxTemp - minTemp).toFixed(1)),
                },
                classification: aiInsights.summary || 'Análise não disponível',
                alerts: aiInsights.alerts || [],
                aiInsights: {
                    trends: aiInsights.trends || [],
                    recommendations: aiInsights.recommendations || [],
                },
            };
        } catch (error) {
            this.logger.error('Error generating AI insights', error);

            // Fallback sem IA
            return {
                summary: {
                    avgTemperature: parseFloat(avgTemp.toFixed(1)),
                    minTemperature: parseFloat(minTemp.toFixed(1)),
                    maxTemperature: parseFloat(maxTemp.toFixed(1)),
                    avgHumidity: parseFloat(avgHumidity.toFixed(1)),
                    totalRecords: logs.length,
                    dateRange: {
                        from: new Date(dateRange.start).toISOString(),
                        to: new Date(dateRange.end).toISOString(),
                    },
                },
                trends: {
                    temperatureTrend: this.calculateTemperatureTrend(logs),
                    temperatureChange: parseFloat((maxTemp - minTemp).toFixed(1)),
                },
                classification:
                    'Basic analysis available. Configure OPENROUTER_API_KEY for advanced AI insights.',
                alerts: [],
            };
        }
    }

    private calculateTemperatureTrend(
        logs: WeatherLog[],
    ): 'increasing' | 'decreasing' | 'stable' {
        if (logs.length < 2) return 'stable';

        const firstHalf = logs.slice(0, Math.floor(logs.length / 2));
        const secondHalf = logs.slice(Math.floor(logs.length / 2));

        const avgFirstHalf =
            firstHalf.reduce((sum, log) => sum + (log.temperature || 0), 0) /
            firstHalf.length;
        const avgSecondHalf =
            secondHalf.reduce((sum, log) => sum + (log.temperature || 0), 0) /
            secondHalf.length;

        const diff = avgSecondHalf - avgFirstHalf;

        if (diff > 1) return 'increasing';
        if (diff < -1) return 'decreasing';
        return 'stable';
    }

    async exportToCsv(query: WeatherQueryDto, res: Response): Promise<void> {
        const filter: any = {};

        if (query.startDate || query.endDate) {
            filter.fetchedAt = {};
            if (query.startDate) {
                filter.fetchedAt.$gte = new Date(query.startDate);
            }
            if (query.endDate) {
                filter.fetchedAt.$lte = new Date(query.endDate);
            }
        }

        const logs = await this.weatherLogModel.find(filter).sort({ fetchedAt: -1 }).exec();

        const csvRows = [
            ['ID', 'Data/Hora', 'Latitude', 'Longitude', 'Temperatura (°C)', 'Umidade (%)', 'Probabilidade de Chuva (%)'].join(','),
        ];

        logs.forEach(log => {
            csvRows.push(
                [
                    log.externalId,
                    toBrazilTime(log.fetchedAt),
                    log.latitude,
                    log.longitude,
                    log.temperature ?? '',
                    log.humidity ?? '',
                    log.precipitationProbability ?? '',
                ].join(',')
            );
        });

        const csvContent = csvRows.join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=weather-data-${Date.now()}.csv`);
        res.send('\uFEFF' + csvContent);
    }

    async exportToXlsx(query: WeatherQueryDto, res: Response): Promise<void> {
        const filter: any = {};

        if (query.startDate || query.endDate) {
            filter.fetchedAt = {};
            if (query.startDate) {
                filter.fetchedAt.$gte = new Date(query.startDate);
            }
            if (query.endDate) {
                filter.fetchedAt.$lte = new Date(query.endDate);
            }
        }

        const logs = await this.weatherLogModel.find(filter).sort({ fetchedAt: -1 }).exec();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Weather Data');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 20 },
            { header: 'Data/Hora', key: 'fetchedAt', width: 25 },
            { header: 'Latitude', key: 'latitude', width: 15 },
            { header: 'Longitude', key: 'longitude', width: 15 },
            { header: 'Temperatura (°C)', key: 'temperature', width: 18 },
            { header: 'Umidade (%)', key: 'humidity', width: 15 },
            { header: 'Prob. Chuva (%)', key: 'precipitation', width: 18 },
        ];

        logs.forEach(log => {
            worksheet.addRow({
                id: log.externalId,
                fetchedAt: toBrazilTime(log.fetchedAt),
                latitude: log.latitude,
                longitude: log.longitude,
                temperature: log.temperature,
                humidity: log.humidity,
                precipitation: log.precipitationProbability,
            });
        });

        worksheet.getRow(1).font = { bold: true };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=weather-data-${Date.now()}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    }
}