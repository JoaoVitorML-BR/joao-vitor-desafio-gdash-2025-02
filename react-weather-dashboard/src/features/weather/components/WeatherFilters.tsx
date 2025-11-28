import { useState } from 'react';
import { Calendar, Filter, X } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import type { WeatherFilters } from '../types/weather.types';
import { WEATHER_CONSTANTS } from '../constants/weather.constants';

export interface WeatherFiltersProps {
    onFilter: (filters: WeatherFilters) => void;
    onClear: () => void;
}

export function WeatherFilters({ onFilter, onClear }: WeatherFiltersProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minTemp, setMinTemp] = useState<number | undefined>();
    const [maxTemp, setMaxTemp] = useState<number | undefined>();
    const [minHumidity, setMinHumidity] = useState<number | undefined>();
    const [maxHumidity, setMaxHumidity] = useState<number | undefined>();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleApplyFilter = () => {
        onFilter({
            startDate,
            endDate,
            minTemp,
            maxTemp,
            minHumidity,
            maxHumidity
        });
    };

    const handleClearFilter = () => {
        setStartDate('');
        setEndDate('');
        setMinTemp(undefined);
        setMaxTemp(undefined);
        setMinHumidity(undefined);
        setMaxHumidity(undefined);
        onClear();
    };

    const hasFilters = startDate || endDate || minTemp !== undefined || maxTemp !== undefined ||
        minHumidity !== undefined || maxHumidity !== undefined;

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    <h3 className="font-semibold">Filtros</h3>
                    {hasFilters && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                            Ativo
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? 'Ocultar' : 'Mostrar'}
                    </Button>
                    {hasFilters && (
                        <Button onClick={handleClearFilter} variant="outline" size="sm">
                            <X className="mr-2 h-4 w-4" />
                            Limpar Filtros
                        </Button>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Data Inicial
                            </Label>
                            <Input
                                id="startDate"
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                max={endDate || undefined}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Data Final
                            </Label>
                            <Input
                                id="endDate"
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate || undefined}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="minTemp">Temperatura Mínima (°C)</Label>
                            <Input
                                id="minTemp"
                                type="number"
                                step="0.1"
                                placeholder="Ex: -10"
                                value={minTemp ?? ''}
                                onChange={(e) => setMinTemp(e.target.value ? Number(e.target.value) : undefined)}
                                max={maxTemp ?? undefined}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxTemp">Temperatura Máxima (°C)</Label>
                            <Input
                                id="maxTemp"
                                type="number"
                                step="0.1"
                                placeholder="Ex: 50"
                                value={maxTemp ?? ''}
                                onChange={(e) => setMaxTemp(e.target.value ? Number(e.target.value) : undefined)}
                                min={minTemp ?? undefined}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="minHumidity">Umidade Mínima (%)</Label>
                            <Input
                                id="minHumidity"
                                type="number"
                                placeholder="Ex: 0"
                                value={minHumidity ?? ''}
                                onChange={(e) => setMinHumidity(e.target.value ? Number(e.target.value) : undefined)}
                                min={WEATHER_CONSTANTS.HUMIDITY.MIN}
                                max={maxHumidity ?? WEATHER_CONSTANTS.HUMIDITY.MAX}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxHumidity">Umidade Máxima (%)</Label>
                            <Input
                                id="maxHumidity"
                                type="number"
                                placeholder="Ex: 100"
                                value={maxHumidity ?? ''}
                                onChange={(e) => setMaxHumidity(e.target.value ? Number(e.target.value) : undefined)}
                                min={minHumidity ?? WEATHER_CONSTANTS.HUMIDITY.MIN}
                                max={WEATHER_CONSTANTS.HUMIDITY.MAX}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={handleApplyFilter} className="flex-1">
                            <Filter className="mr-2 h-4 w-4" />
                            Aplicar Filtros
                        </Button>
                        {hasFilters && (
                            <Button onClick={handleClearFilter} variant="outline">
                                <X className="mr-2 h-4 w-4" />
                                Limpar
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
}
