import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { WeatherQueryDto } from './dto/weather-query.dto';
import { PaginatedResult, WeatherInsights } from './dto/weather-response.dto';

@Injectable()
export class WeatherService {
    constructor(
        @InjectModel(WeatherLog.name)
        private weatherLogModel: Model<WeatherLogDocument>,
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
        // TODO: Implementar com OpenRouter para gerar insights via IA
        // Por enquanto, retorna estrutura vazia

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
            classification: 'Aguardando implementação com OpenRouter',
            alerts: [],
        };
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
                    new Date(log.fetchedAt).toISOString(),
                    log.latitude,
                    log.longitude,
                    log.temperature ?? '',
                    log.humidity ?? '',
                    log.precipitationProbability ?? '',
                ].join(',')
            );
        });

        const csvContent = csvRows.join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=weather-data-${Date.now()}.csv`);
        res.send(csvContent);
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
                fetchedAt: new Date(log.fetchedAt).toISOString(),
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