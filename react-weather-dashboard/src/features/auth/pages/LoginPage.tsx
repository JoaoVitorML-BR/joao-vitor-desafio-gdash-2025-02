import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cloud, CloudRain, Sun, Wind, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/auth.service';
import type { ApiErrorResponse } from '@/types/api.types';
import { toast } from 'sonner';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await authService.login(email, password);

            // Salva no contexto de autenticação
            login(response.access_token, response.user);

            toast.success('Login realizado com sucesso!', {
                description: `Bem-vindo, ${response.user.name}!`,
            });

            setTimeout(() => {
                navigate('/home');
            }, 1500);

        } catch (error) {
            if (cardRef.current) {
                cardRef.current.style.animation = 'none';
                setTimeout(() => {
                    if (cardRef.current) {
                        cardRef.current.style.animation = 'shake 0.5s ease-in-out';
                    }
                }, 10);
            }

            const apiError = error as ApiErrorResponse;

            if (apiError.statusCode === 401 || apiError.statusCode === 403) {
                toast.error('Credenciais inválidas', {
                    description: 'Email ou senha incorretos. Verifique seus dados.',
                });
            } else if (apiError.statusCode === 0) {
                toast.error('Erro de conexão', {
                    description: 'Não foi possível conectar ao servidor. Verifique sua internet.',
                });
            } else {
                toast.error('Erro ao fazer login', {
                    description: apiError.message || 'Ocorreu um erro inesperado.',
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
            <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 animate-float">
                        <Cloud className="w-24 h-24 text-blue-200 dark:text-blue-900 opacity-20" />
                    </div>
                    <div className="absolute top-40 right-20 animate-float-delayed">
                        <Sun className="w-32 h-32 text-yellow-200 dark:text-yellow-900 opacity-20" />
                    </div>
                    <div className="absolute bottom-32 left-1/4 animate-float">
                        <Wind className="w-20 h-20 text-cyan-200 dark:text-cyan-900 opacity-20" />
                    </div>
                    <div className="absolute bottom-20 right-1/3 animate-float-delayed">
                        <CloudRain className="w-28 h-28 text-blue-300 dark:text-blue-800 opacity-20" />
                    </div>
                </div>

                {/* Login Card */}
                <Card ref={cardRef} className="w-full max-w-md mx-4 shadow-2xl border-0 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
                    <CardHeader className="space-y-1 text-center pb-6">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                                <Cloud className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            GDASH Weather
                        </CardTitle>
                        <CardDescription className="text-base">
                            Sistema de Monitoramento Climático
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-11 transition-all focus:ring-2 focus:ring-blue-500"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        Senha
                                    </Label>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-11 pr-10 transition-all focus:ring-2 focus:ring-blue-500"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                        disabled={isLoading}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Entrando...</span>
                                    </div>
                                ) : (
                                    'Entrar'
                                )}
                            </Button>
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4 pt-2">
                            <p className="text-xs text-center text-muted-foreground px-4">
                                Ao continuar, você concorda com nossos{' '}
                                <button className="underline hover:text-foreground transition-colors">
                                    Termos de Serviço
                                </button>{' '}
                                e{' '}
                                <button className="underline hover:text-foreground transition-colors">
                                    Política de Privacidade
                                </button>
                            </p>
                        </CardFooter>
                    </form>
                </Card>

                {/* Footer */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        GDASH 2025/02 Challenge · Weather Monitoring System - By <strong>
                            <a href="https://github.com/JoaoVitorML-BR" target="_blank" rel="noopener noreferrer">
                                JoaoVitorML-BR
                            </a>
                        </strong>
                    </p>
                </div>
            </div>
    );
}