import { API_VERSION } from '@/lib/constants';
import axios from '../lib/axios';
import type { 
    WeatherLog, 
    WeatherFilters, 
    PaginatedWeatherResponse 
} from '../features/weather/types/weather.types';

export type { WeatherLog, WeatherFilters };

export const weatherService = {
    async getLogsFiltered(params: WeatherFilters = {}): Promise<PaginatedWeatherResponse> {
        const response = await axios.get<PaginatedWeatherResponse>(`${API_VERSION}/weather/logs/filtered`, {
            params: {
                page: params.page || 1,
                limit: params.limit || 20,
                ...(params.startDate && { startDate: params.startDate }),
                ...(params.endDate && { endDate: params.endDate }),
                ...(params.minTemp !== undefined && { minTemp: params.minTemp }),
                ...(params.maxTemp !== undefined && { maxTemp: params.maxTemp }),
                ...(params.minHumidity !== undefined && { minHumidity: params.minHumidity }),
                ...(params.maxHumidity !== undefined && { maxHumidity: params.maxHumidity }),
            },
        });
        return response.data;
    },

    async getAllLogs(): Promise<WeatherLog[]> {
        const response = await axios.get<WeatherLog[]>(`${API_VERSION}/weather/logs`);
        return response.data;
    },

    exportCsv(params: WeatherFilters = {}): string {
        const queryString = new URLSearchParams({
            ...(params.startDate && { startDate: params.startDate }),
            ...(params.endDate && { endDate: params.endDate }),
        }).toString();

        return `${API_VERSION}/weather/export/csv${queryString ? `?${queryString}` : ''}`;
    },

    exportXlsx(params: WeatherFilters = {}): string {
        const queryString = new URLSearchParams({
            ...(params.startDate && { startDate: params.startDate }),
            ...(params.endDate && { endDate: params.endDate }),
        }).toString();

        return `${API_VERSION}/weather/export/xlsx${queryString ? `?${queryString}` : ''}`;
    },
};
