import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, TrendingUp, Lightbulb, AlertTriangle, Loader2, Eye } from 'lucide-react';
import { weatherService, type WeatherInsights } from '@/services/weather.service';
import { AIInsightsModal } from './AIInsightsModal';

interface AIInsightsCardProps {
    startDate?: string;
    endDate?: string;
}

export function AIInsightsCard({ startDate, endDate }: AIInsightsCardProps) {
    const [insights, setInsights] = useState<WeatherInsights | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    const handleGenerateInsights = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await weatherService.getInsights({ startDate, endDate });
            setInsights(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao gerar insights com IA');
        } finally {
            setIsLoading(false);
        }
    };

    const hasAIInsights = insights?.aiInsights && insights.aiInsights.trends.length > 0;

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-purple-500" />
                                AI Insights
                            </CardTitle>
                            <CardDescription>
                                Análise inteligente dos dados meteorológicos
                            </CardDescription>
                        </div>
                        <Button
                            onClick={handleGenerateInsights}
                            disabled={isLoading}
                            className="gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Gerando...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Gerar Análise
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {!insights && !isLoading && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>Clique em "Gerar Análise" para obter insights com IA</p>
                            <p className="text-sm mt-1">Powered by Grok 4.1 Fast</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="text-center py-8">
                            <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin text-purple-500" />
                            <p className="text-muted-foreground">Analisando dados meteorológicos...</p>
                        </div>
                    )}

                    {insights && !isLoading && (
                        <div className="space-y-4">
                            {/* Summary */}
                            <div className="rounded-lg bg-muted p-4">
                                <h3 className="font-semibold mb-2">📊 Resumo</h3>
                                <p className="text-sm text-muted-foreground">{insights.classification}</p>
                            </div>

                            {/* Quick Stats Preview */}
                            {hasAIInsights && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {/* Trends Preview */}
                                        <div className="rounded-lg border p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendingUp className="h-4 w-4 text-blue-500" />
                                                <span className="font-medium text-sm">Tendências</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {insights.aiInsights?.trends[0]}
                                            </p>
                                            {(insights.aiInsights?.trends.length || 0) > 1 && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    +{(insights.aiInsights?.trends.length || 0) - 1} mais
                                                </p>
                                            )}
                                        </div>

                                        {/* Recommendations Preview */}
                                        <div className="rounded-lg border p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Lightbulb className="h-4 w-4 text-yellow-500" />
                                                <span className="font-medium text-sm">Recomendações</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {insights.aiInsights?.recommendations[0]}
                                            </p>
                                            {(insights.aiInsights?.recommendations.length || 0) > 1 && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    +{(insights.aiInsights?.recommendations.length || 0) - 1} mais
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Alerts */}
                                    {insights.alerts && insights.alerts.length > 0 && (
                                        <Alert className="border-orange-200 bg-orange-50">
                                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                                            <AlertDescription className="text-xs">
                                                {insights.alerts[0]}
                                                {insights.alerts.length > 1 && ` (+${insights.alerts.length - 1} alerta${insights.alerts.length > 2 ? 's' : ''})`}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <Button
                                        variant="outline"
                                        className="w-full gap-2"
                                        onClick={() => setShowModal(true)}
                                    >
                                        <Eye className="h-4 w-4" />
                                        Ver Análise Completa
                                    </Button>
                                </>
                            )}

                            {!hasAIInsights && (
                                <Alert>
                                    <AlertDescription className="text-sm">
                                        Configure OPENROUTER_API_KEY no backend para insights avançados com IA
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {insights && (
                <AIInsightsModal
                    insights={insights}
                    open={showModal}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}
