import type { WeatherFilters } from '../types/weather.types';

export function convertToISO(dateString: string | undefined): string | undefined {
    if (!dateString) return undefined;
    try {
        return new Date(dateString).toISOString();
    } catch {
        return undefined;
    }
}

export function hasActiveFilters(filters: WeatherFilters): boolean {
    return !!(
        filters.startDate ||
        filters.endDate ||
        filters.minTemp !== undefined ||
        filters.maxTemp !== undefined ||
        filters.minHumidity !== undefined ||
        filters.maxHumidity !== undefined
    );
}

export function formatDateTimeBR(dateString: string): string {
    return new Date(dateString).toLocaleString('pt-BR');
}

export function cleanFilters<T extends Record<string, any>>(filters: T): Partial<T> {
    return Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            acc[key as keyof T] = value;
        }
        return acc;
    }, {} as Partial<T>);
}
