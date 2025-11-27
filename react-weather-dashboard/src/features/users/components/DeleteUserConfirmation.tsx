import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';
import type { ApiErrorResponse, User } from '@/types/api.types';

interface DeleteUserConfirmationProps {
    user: User;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function DeleteUserConfirmation({
    user,
    open,
    onOpenChange,
    onSuccess,
}: DeleteUserConfirmationProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await userService.delete(user.id);
            toast.success('Usuário excluído com sucesso!', {
                description: `${user.name} foi removido do sistema.`,
            });
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            const apiError = error as ApiErrorResponse;
            toast.error('Erro ao excluir usuário', {
                description: apiError.message || 'Não foi possível excluir o usuário.',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <Trash2 className="w-5 h-5" />
                        Confirmar Exclusão
                    </DialogTitle>
                    <DialogDescription className="pt-4">
                        Tem certeza que deseja excluir o usuário{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {user.name}
                        </span>
                        ?
                        <br />
                        <br />
                        Esta ação não pode ser desfeita e todos os dados do usuário serão
                        permanentemente removidos.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                        className='gap-2 hover:bg-red-700 hover:text-amber-50 hover:scale-105 transition-all duration-200 hover:shadow-lg'
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="gap-2 hover:bg-red-700 hover:scale-105 transition-all duration-200 hover:shadow-lg"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Excluindo...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Excluir Usuário
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
