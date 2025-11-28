import { useState } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { useWeatherData } from '../hooks/useWeatherData';
import { WeatherFilters } from './WeatherFilters';
import { AIInsightsCard } from '../../../components/weather/AIInsightsCard';
import { weatherService } from '../../../services/weather.service';
import type { WeatherFilters as WeatherFiltersType } from '../types/weather.types';
import { WEATHER_CONSTANTS } from '../constants/weather.constants';
import { hasActiveFilters, formatDateTimeBR } from '../utils/weather.utils';

export function WeatherDashboard() {
    const [filters, setFilters] = useState<WeatherFiltersType>(
        WEATHER_CONSTANTS.FILTERS.INITIAL_STATE
    );
    const { data, total, loading, error, refetch } = useWeatherData({
        page: WEATHER_CONSTANTS.PAGINATION.DEFAULT_PAGE,
        limit: WEATHER_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.minTemp !== undefined && { minTemp: filters.minTemp }),
        ...(filters.maxTemp !== undefined && { maxTemp: filters.maxTemp }),
        ...(filters.minHumidity !== undefined && { minHumidity: filters.minHumidity }),
        ...(filters.maxHumidity !== undefined && { maxHumidity: filters.maxHumidity }),
    });

    const handleFilter = (newFilters: WeatherFiltersType) => {
        setFilters(newFilters);
    };

    const handleClearFilters = () => {
        setFilters(WEATHER_CONSTANTS.FILTERS.INITIAL_STATE);
    };

    const handleRefresh = () => {
        refetch();
    };

    const handleExportCsv = async () => {
        try {
            await weatherService.exportCsv(filters);
        } catch (err) {
            console.error('Erro ao exportar CSV:', err);
        }
    };

    const handleExportXlsx = async () => {
        try {
            await weatherService.exportXlsx(filters);
        } catch (err) {
            console.error('Erro ao exportar XLSX:', err);
        }
    };

    const hasFilters = hasActiveFilters(filters); if (loading) {
        return (
            <Card className="p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="ml-3 text-muted-foreground">Carregando dados climáticos...</p>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-8 border-destructive/50 bg-destructive/5">
                <div className="text-center">
                    <p className="text-destructive font-semibold mb-4">{error}</p>
                    <Button onClick={handleRefresh} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Tentar Novamente
                    </Button>
                </div>
            </Card>
        );
    }

    if (data.length === 0) {
        return (
            <div className="space-y-6">
                {/* Filtros sempre visíveis */}
                <WeatherFilters onFilter={handleFilter} onClear={handleClearFilters} />

                <Card className="p-8">
                    <div className="text-center">
                        {hasFilters ? (
                            <>
                                <p className="text-lg font-semibold mb-2">Nenhum registro encontrado</p>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Não há dados que correspondam aos filtros aplicados.
                                </p>
                                <Button onClick={handleClearFilters} variant="outline">
                                    Limpar Filtros
                                </Button>
                            </>
                        ) : (
                            <>
                                <p className="text-muted-foreground">Nenhum dado climático disponível ainda.</p>
                                <p className="text-sm text-muted-foreground mt-2">Aguarde a coleta de dados do sistema.</p>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        );
    }

    const latestData = data[0];

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <WeatherFilters onFilter={handleFilter} onClear={handleClearFilters} />

            {/* Header com botão refresh e limpar filtros */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Dashboard Climático</h2>
                    <p className="text-sm text-muted-foreground">
                        Mostrando {data.length} de {total} registros
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <Button onClick={handleExportCsv} variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        CSV
                    </Button>
                    <Button onClick={handleExportXlsx} variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        XLSX
                    </Button>
                    <Button onClick={handleRefresh} variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Atualizar
                    </Button>
                    {hasFilters && (
                        <Button onClick={handleClearFilters} variant="destructive" size="sm" className="hover:text-white hover:bg-red-800">
                            Limpar Filtros
                        </Button>
                    )}
                </div>
            </div>

            {/* Cards com dados principais */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-6">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Temperatura</p>
                        <p className="text-3xl font-bold">{latestData.temperature}°C</p>
                        <p className="text-xs text-muted-foreground">
                            {formatDateTimeBR(latestData.fetchedAt)}
                        </p>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Umidade</p>
                        <p className="text-3xl font-bold">
                            {latestData.humidity !== undefined ? `${latestData.humidity}%` : 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">Umidade relativa do ar</p>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Prob. de Chuva</p>
                        <p className="text-3xl font-bold">
                            {latestData.precipitationProbability !== undefined
                                ? `${latestData.precipitationProbability}%`
                                : 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">Nas próximas horas</p>
                    </div>
                </Card>
            </div>

            {/* AI Insights Card */}
            <AIInsightsCard startDate={filters.startDate} endDate={filters.endDate} />

            {/* Tabela simples com últimos registros */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Últimos Registros</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b">
                            <tr className="text-left">
                                <th className="pb-3 font-medium text-muted-foreground">Data/Hora</th>
                                <th className="pb-3 font-medium text-muted-foreground">Temperatura</th>
                                <th className="pb-3 font-medium text-muted-foreground">Umidade</th>
                                <th className="pb-3 font-medium text-muted-foreground">Chuva</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((log) => (
                                <tr key={log._id} className="border-b last:border-0">
                                    <td className="py-3">{formatDateTimeBR(log.fetchedAt)}</td>
                                    <td className="py-3">{log.temperature}°C</td>
                                    <td className="py-3">{log.humidity !== undefined ? `${log.humidity}%` : '-'}</td>
                                    <td className="py-3">
                                        {log.precipitationProbability !== undefined
                                            ? `${log.precipitationProbability}%`
                                            : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
