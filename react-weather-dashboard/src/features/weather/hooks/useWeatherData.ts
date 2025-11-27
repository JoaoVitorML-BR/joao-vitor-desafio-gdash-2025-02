import { useState, useEffect } from 'react';
import { weatherService } from '../../../services/weather.service';
import type { WeatherLog, WeatherFilters } from '../types/weather.types';
import { convertToISO } from '../utils/weather.utils';
import { WEATHER_CONSTANTS } from '../constants/weather.constants';

export function useWeatherData(filters: WeatherFilters = {}) {
    const [data, setData] = useState<WeatherLog[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async (customFilters?: WeatherFilters) => {
        try {
            setLoading(true);
            setError(null);

            const params = { ...filters, ...customFilters };

            const response = await weatherService.getLogsFiltered({
                page: params.page || WEATHER_CONSTANTS.PAGINATION.DEFAULT_PAGE,
                limit: params.limit || WEATHER_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
                ...(params.startDate && { startDate: convertToISO(params.startDate) }),
                ...(params.endDate && { endDate: convertToISO(params.endDate) }),
                ...(params.minTemp !== undefined && { minTemp: params.minTemp }),
                ...(params.maxTemp !== undefined && { maxTemp: params.maxTemp }),
                ...(params.minHumidity !== undefined && { minHumidity: params.minHumidity }),
                ...(params.maxHumidity !== undefined && { maxHumidity: params.maxHumidity }),
            });

            setData(response.data);
            setTotal(response.pagination.total);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao buscar dados climáticos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters.startDate, filters.endDate, filters.page, filters.limit,
    filters.minTemp, filters.maxTemp, filters.minHumidity, filters.maxHumidity]);

    return { data, total, loading, error, refetch: fetchData };
}
