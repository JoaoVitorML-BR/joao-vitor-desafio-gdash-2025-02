import { useState } from 'react';
import { UserCog, Trash2, Calendar, Mail, Shield, User as UserIcon } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { User } from '@/types/api.types';
import UpdateUserForm from './UpdateUserForm';
import DeleteUserConfirmation from './DeleteUserConfirmation';

interface UserDetailsDialogProps {
    user: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUserUpdated: () => void;
}

type ViewMode = 'details' | 'edit';

export default function UserDetailsDialog({
    user,
    open,
    onOpenChange,
    onUserUpdated,
}: UserDetailsDialogProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('details');
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    if (!user) return null;

    const handleClose = () => {
        setViewMode('details');
        onOpenChange(false);
    };

    const handleUpdateSuccess = () => {
        setViewMode('details');
        onUserUpdated();
        handleClose();
    };

    const handleDeleteSuccess = () => {
        onUserUpdated();
        handleClose();
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserCog className="w-5 h-5" />
                            {viewMode === 'details' ? 'Detalhes do Usuário' : 'Editar Usuário'}
                        </DialogTitle>
                        <DialogDescription>
                            {viewMode === 'details'
                                ? 'Informações e ações disponíveis para este usuário'
                                : 'Atualize as informações do usuário'}
                        </DialogDescription>
                    </DialogHeader>

                    {viewMode === 'details' ? (
                        <div className="space-y-6">
                            {/* User Info */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-500 rounded-lg">
                                        <UserIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{user.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Mail className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                {user.email}
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        className={`px-3 py-1 text-xs font-medium rounded-full ${user.role === 'admin-master'
                                                ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white dark:from-purple-700 dark:to-pink-700'
                                                : user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        <Shield className="w-3 h-3 inline mr-1" />
                                        {user.role === 'admin-master'
                                            ? 'Admin Master'
                                            : user.role === 'admin'
                                                ? 'Administrador'
                                                : 'Usuário'}
                                    </span>
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

                                {/* Additional Info */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Cadastrado em
                                        </p>
                                        <p className="font-medium">
                                            {user.createdAt
                                                ? new Date(user.createdAt).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })
                                                : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-500 dark:text-gray-400">ID do Usuário</p>
                                        <p className="font-mono text-xs font-medium truncate">{user.id}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setViewMode('edit')}
                                    className="flex-1 gap-2 hover:bg-gray-300 hover:scale-105 transition-all duration-200 hover:shadow-lg"
                                >
                                    <UserCog className="w-4 h-4" />
                                    Editar Usuário
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowDeleteConfirmation(true)}
                                    className="gap-2 hover:bg-red-700 hover:scale-105 transition-all duration-200 hover:shadow-lg"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Excluir
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <UpdateUserForm
                            user={user}
                            onSuccess={handleUpdateSuccess}
                            onCancel={() => setViewMode('details')}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <DeleteUserConfirmation
                user={user}
                open={showDeleteConfirmation}
                onOpenChange={setShowDeleteConfirmation}
                onSuccess={handleDeleteSuccess}
            />
        </>
    );
}
