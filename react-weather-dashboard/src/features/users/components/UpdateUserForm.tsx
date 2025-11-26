import { useState } from 'react';
import { Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';
import type { ApiErrorResponse, User } from '@/types/api.types';

interface UpdateUserFormProps {
    user: User;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function UpdateUserForm({ user, onSuccess, onCancel }: UpdateUserFormProps) {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<string>(user.role || 'user');
    const [showPassword, setShowPassword] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            const updateData: { name?: string; email?: string; password?: string; role?: string } = {};

            if (name !== user.name) updateData.name = name;
            if (email !== user.email) updateData.email = email;
            if (password) updateData.password = password;
            if (role !== user.role) updateData.role = role;

            if (Object.keys(updateData).length === 0) {
                toast.info('Nenhuma alteração detectada');
                return;
            }

            await userService.update(user.id, updateData);

            toast.success('Usuário atualizado com sucesso!', {
                description: `As informações de ${name} foram atualizadas.`,
            });

            onSuccess();
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
            } else {
                toast.error('Erro ao atualizar usuário', {
                    description: apiError.message || 'Ocorreu um erro inesperado.',
                });
            }
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de Usuário */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">Tipo de Usuário</Label>
                <Select value={role} onValueChange={setRole} disabled={isUpdating}>
                    <SelectTrigger>
                        <SelectValue placeholder="Tipo de Usuário" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="admin-master">Admin Master</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Nome Completo */}
            <div className="space-y-2">
                <Label htmlFor="update-name" className="text-sm font-medium">
                    Nome Completo
                </Label>
                <Input
                    id="update-name"
                    type="text"
                    placeholder="João da Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isUpdating}
                />
            </div>

            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="update-email" className="text-sm font-medium">
                    Email
                </Label>
                <Input
                    id="update-email"
                    type="email"
                    placeholder="joao@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isUpdating}
                />
            </div>

            {/* Senha (Opcional) */}
            <div className="space-y-2">
                <Label htmlFor="update-password" className="text-sm font-medium">
                    Nova Senha (opcional)
                </Label>
                <div className="relative">
                    <Input
                        id="update-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Deixe em branco para manter a atual"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                        className="pr-10"
                        disabled={isUpdating}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        disabled={isUpdating}
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
                    Mínimo 6 caracteres, se desejar alterar a senha
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isUpdating}
                    className="flex-1 hover:bg-red-700 hover:text-amber-50 hover:scale-105 transition-all duration-200 hover:shadow-lg"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 gap-2 hover:bg-green-700 hover:scale-105 transition-all duration-200 hover:shadow-lg"
                >
                    {isUpdating ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Salvar Alterações
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
