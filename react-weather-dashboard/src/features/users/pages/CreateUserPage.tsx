import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, UserPlus, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';
import type { ApiErrorResponse } from '@/types/api.types';
import DashboardLayout from '@/components/layout/DashboardLayout';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function CreateUserPage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userType, setUserType] = useState('user');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {

            if (userType === 'admin') {
                await userService.createAdmin(name, email, password);
            } else if (userType === "user") {
                await userService.create(name, email, password);
            }

            toast.success('Usuário criado com sucesso!', {
                description: `${name} foi adicionado ao sistema.`,
            });

            setTimeout(() => {
                navigate('/users');
            }, 1500);

        } catch (error) {
            const apiError = error as ApiErrorResponse;

            if (apiError.statusCode === 409) {
                toast.error('Email já cadastrado', {
                    description: 'Este email já está sendo utilizado por outro usuário.',
                });
            } else if (apiError.statusCode === 400) {
                toast.error('Dados inválidos', {
                    description: apiError.message || 'Verifique os dados informados.',
                });
            } else if (apiError.statusCode === 0) {
                toast.error('Erro de conexão', {
                    description: 'Não foi possível conectar ao servidor.',
                });
            } else {
                toast.error('Erro ao criar usuário', {
                    description: apiError.message || 'Ocorreu um erro inesperado.',
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-linear-to-br from-sky-400 via-blue-500 to-indigo-600 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/users')}
                            className="mb-4 gap-2 flex-1 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 hover:text-white text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-500 rounded-xl">
                                <UserPlus className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white drop-shadow-lg dark:text-white">
                                    Cadastrar Usuário
                                </h1>
                                <p className="text-white/90 drop-shadow-md dark:text-gray-300">
                                    Preencha os dados para criar um novo usuário
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form card */}
                    <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
                        <CardHeader>
                            <CardTitle>Informações do Usuário</CardTitle>
                            <CardDescription>
                                Todos os campos são obrigatórios
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/*User type*/}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Tipo de Usuário
                                    </Label>
                                    <Select value={userType} onValueChange={setUserType}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Tipo de Usuário" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">Usuário</SelectItem>
                                            <SelectItem value="admin">Administrador</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Complet name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium">
                                        Nome Completo
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="João da Silva"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="h-11 transition-all focus:ring-2 focus:ring-blue-500"
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="joao@exemplo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-11 transition-all focus:ring-2 focus:ring-blue-500"
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        Senha
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Mínimo 6 caracteres"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
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
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        A senha deve ter no mínimo 6 caracteres. Sendo 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial.
                                    </p>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate('/users')}
                                        disabled={isLoading}
                                        className="flex-1 hover:bg-red-600 hover:text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Criando...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <UserPlus className="w-4 h-4" />
                                                <span>Criar Usuário</span>
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
