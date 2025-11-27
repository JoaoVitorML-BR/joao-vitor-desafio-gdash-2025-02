import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Thermometer,
    Droplets,
    Calendar,
    TrendingUp,
    TrendingDown,
    Minus,
    Lightbulb,
    AlertTriangle,
    BarChart3,
} from 'lucide-react';
import type { WeatherInsights } from '@/services/weather.service';

interface AIInsightsModalProps {
    insights: WeatherInsights;
    open: boolean;
    onClose: () => void;
}

export function AIInsightsModal({ insights, open, onClose }: AIInsightsModalProps) {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTrendIcon = () => {
        switch (insights.trends.temperatureTrend) {
            case 'increasing':
                return <TrendingUp className="h-4 w-4 text-red-500" />;
            case 'decreasing':
                return <TrendingDown className="h-4 w-4 text-blue-500" />;
            case 'stable':
                return <Minus className="h-4 w-4 text-gray-500" />;
        }
    };

    const getTrendLabel = () => {
        switch (insights.trends.temperatureTrend) {
            case 'increasing':
                return 'Aumentando';
            case 'decreasing':
                return 'Diminuindo';
            case 'stable':
                return 'Estável';
        }
    };

    const hasAIInsights = insights.aiInsights && insights.aiInsights.trends.length > 0;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-purple-500" />
                        Análise Completa com IA
                    </DialogTitle>
                    <DialogDescription>
                        Insights gerados por Grok 4.1 Fast
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Period and Statistics */}
                    <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Período Analisado
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-lg bg-muted p-3">
                                <p className="text-muted-foreground">Início</p>
                                <p className="font-medium">{formatDate(insights.summary.dateRange.from)}</p>
                            </div>
                            <div className="rounded-lg bg-muted p-3">
                                <p className="text-muted-foreground">Fim</p>
                                <p className="font-medium">{formatDate(insights.summary.dateRange.to)}</p>
                            </div>
                        </div>
                        <div className="rounded-lg bg-muted p-3">
                            <p className="text-sm text-muted-foreground">Total de Registros</p>
                            <p className="text-2xl font-bold">{insights.summary.totalRecords}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Temperature and Humidity Stats */}
                    <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Thermometer className="h-4 w-4" />
                            Estatísticas Climáticas
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Temperatura</p>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Média:</span>
                                        <span className="font-medium">{insights.summary.avgTemperature}°C</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Mínima:</span>
                                        <span className="font-medium text-blue-600">{insights.summary.minTemperature}°C</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Máxima:</span>
                                        <span className="font-medium text-red-600">{insights.summary.maxTemperature}°C</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Variação:</span>
                                        <span className="font-medium">{insights.trends.temperatureChange}°C</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium flex items-center gap-1">
                                    <Droplets className="h-4 w-4" />
                                    Umidade
                                </p>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Média:</span>
                                        <span className="font-medium">{insights.summary.avgHumidity}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tendência:</span>
                                        <Badge variant="outline" className="gap-1">
                                            {getTrendIcon()}
                                            {getTrendLabel()}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* AI Summary */}
                    <div className="space-y-3">
                        <h3 className="font-semibold">📊 Análise Geral</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed rounded-lg bg-linear-to-r from-purple-50 to-blue-50 p-4 border border-purple-100">
                            {insights.classification}
                        </p>
                    </div>

                    {hasAIInsights && (
                        <>
                            <Separator />

                            {/* AI Trends */}
                            <div className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-blue-500" />
                                    Tendências Observadas
                                </h3>
                                <ul className="space-y-2">
                                    {insights.aiInsights?.trends.map((trend, index) => (
                                        <li
                                            key={index}
                                            className="flex gap-2 text-sm text-muted-foreground"
                                        >
                                            <span className="text-blue-500 font-bold">•</span>
                                            <span>{trend}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Separator />

                            {/* AI Recommendations */}
                            <div className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                                    Recomendações para Painéis Solares
                                </h3>
                                <ul className="space-y-2">
                                    {insights.aiInsights?.recommendations.map((recommendation, index) => (
                                        <li
                                            key={index}
                                            className="flex gap-2 text-sm text-muted-foreground rounded-lg bg-yellow-50 p-3 border border-yellow-100"
                                        >
                                            <span className="text-yellow-600 font-bold">💡</span>
                                            <span>{recommendation}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}

                    {/* Alerts */}
                    {insights.alerts && insights.alerts.length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                    Alertas Importantes
                                </h3>
                                <ul className="space-y-2">
                                    {insights.alerts.map((alert, index) => (
                                        <li
                                            key={index}
                                            className="flex gap-2 text-sm rounded-lg bg-orange-50 p-3 border border-orange-200"
                                        >
                                            <span className="text-orange-900">{alert}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
