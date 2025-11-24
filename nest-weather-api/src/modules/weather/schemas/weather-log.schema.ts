import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherLogDocument = WeatherLog & Document;

@Schema({ timestamps: true })
export class WeatherLog {
    @Prop({ required: true, unique: true, index: true })
    externalId: string;

    @Prop({ required: true })
    schemaVersion: number;

    @Prop({ required: true, type: Date, index: true })
    fetchedAt: Date;

    @Prop({ required: true, index: true })
    latitude: number;

    @Prop({ required: true, index: true })
    longitude: number;

    @Prop({ required: true })
    temperature: number;

    @Prop()
    windSpeed?: number;

    @Prop()
    windDirection?: number;

    @Prop()
    weatherCode?: number;

    @Prop()
    humidity?: number;

    @Prop()
    precipitationProbability?: number;

    @Prop({ default: 'OpenMeteo' })
    source: string;

    @Prop({ type: Object })
    raw?: Record<string, any>;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);

// Indeci compost to optimize queries by fetchedAt, latitude, and longitude
WeatherLogSchema.index({ fetchedAt: -1, latitude: 1, longitude: 1 });
