import { API_VERSION } from '@/lib/constants';
import axios from '../lib/axios';
import type {
    WeatherLog,
    WeatherFilters,
    PaginatedWeatherResponse
} from '../features/weather/types/weather.types';
import type { WeatherInsights } from '../types/api.types';

export type { WeatherLog, WeatherFilters, WeatherInsights };

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

    async getInsights(params: { startDate?: string; endDate?: string } = {}): Promise<WeatherInsights> {
        const response = await axios.get<WeatherInsights>(`${API_VERSION}/weather/insights`, {
            params: {
                ...(params.startDate && { startDate: params.startDate }),
                ...(params.endDate && { endDate: params.endDate }),
            },
        });
        return response.data;
    },

    async exportCsv(params: WeatherFilters = {}): Promise<void> {
        const response = await axios.get(`${API_VERSION}/weather/export/csv`, {
            params: {
                ...(params.startDate && { startDate: params.startDate }),
                ...(params.endDate && { endDate: params.endDate }),
                ...(params.minTemp !== undefined && { minTemp: params.minTemp }),
                ...(params.maxTemp !== undefined && { maxTemp: params.maxTemp }),
                ...(params.minHumidity !== undefined && { minHumidity: params.minHumidity }),
                ...(params.maxHumidity !== undefined && { maxHumidity: params.maxHumidity }),
            },
            responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `weather-data-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    async exportXlsx(params: WeatherFilters = {}): Promise<void> {
        const response = await axios.get(`${API_VERSION}/weather/export/xlsx`, {
            params: {
                ...(params.startDate && { startDate: params.startDate }),
                ...(params.endDate && { endDate: params.endDate }),
                ...(params.minTemp !== undefined && { minTemp: params.minTemp }),
                ...(params.maxTemp !== undefined && { maxTemp: params.maxTemp }),
                ...(params.minHumidity !== undefined && { minHumidity: params.minHumidity }),
                ...(params.maxHumidity !== undefined && { maxHumidity: params.maxHumidity }),
            },
            responseType: 'blob',
        });

        const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `weather-data-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },
};
