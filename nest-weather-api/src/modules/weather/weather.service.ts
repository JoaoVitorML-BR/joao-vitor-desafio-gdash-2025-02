import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';

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
}
