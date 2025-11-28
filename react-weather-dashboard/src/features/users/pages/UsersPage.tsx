import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';
import type { ApiErrorResponse, User } from '@/types/api.types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import UserDetailsDialog from '../components/UserDetailsDialog';

export default function UsersPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(6);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadUsers(page);
    }, [page]);

    const loadUsers = async (pageNum: number) => {
        setIsLoading(true);
        try {
            const res = await userService.getAll(pageNum, limit);
            setUsers(res.data);
            setTotal(res.total);
            setTotalPages(res.totalPages);
        } catch (error) {
            const apiError = error as ApiErrorResponse;
            toast.error('Erro ao carregar usuários', {
                description: apiError.message || 'Não foi possível carregar a lista de usuários.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserClick = (user: User) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setTimeout(() => setSelectedUser(null), 300); // Delay to allow dialog animation
    };

    const handleUserUpdated = () => {
        loadUsers(page); // Reload users list after update/delete
    };

    const handlePrevPage = () => {
        if (page > 1) setPage(page - 1);
    };
    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-linear-to-br from-sky-400 via-blue-500 to-indigo-600 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-500 rounded-xl">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white drop-shadow-lg dark:text-white">
                                    Gerenciar Usuários
                                </h1>
                                <p className="text-white/90 drop-shadow-md dark:text-gray-300">
                                    {total} {total === 1 ? 'usuário cadastrado' : 'usuários cadastrados'}
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => navigate('/users/create')}
                            className="gap-2 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        >
                            <UserPlus className="w-4 h-4" />
                            Novo Usuário
                        </Button>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    )}

                    {/* Lista de Usuários */}
                    {!isLoading && users.length === 0 && (
                        <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-white/20">
                            <CardContent className="py-20 text-center">
                                <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-600 dark:text-gray-300 text-lg">
                                    Nenhum usuário cadastrado
                                </p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                                    Clique em "Novo Usuário" para cadastrar o primeiro usuário
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {!isLoading && users.length > 0 && (
                        <>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {users.map((user) => (
                                    <Card
                                        key={user.id}
                                        className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-white/20 hover:shadow-2xl transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                                        onClick={() => handleUserClick(user)}
                                    >
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg">
                                                        {user.name}
                                                    </CardTitle>
                                                    <CardDescription className="mt-1">
                                                        {user.email}
                                                    </CardDescription>
                                                </div>
                                                <span
                                                    className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'admin-master'
                                                        ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white dark:from-purple-700 dark:to-pink-700'
                                                        : user.role === 'admin'
                                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}
                                                >
                                                    {user.role === 'admin-master'
                                                        ? 'Master'
                                                        : user.role === 'admin'
                                                            ? 'Admin'
                                                            : 'Usuário'}
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {user.createdAt && (
                                                    <p>
                                                        Cadastrado em:{' '}
                                                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            {/* Pagination Controls */}
                            <div className="flex justify-center items-center gap-4 mt-8">
                                <Button onClick={handlePrevPage} disabled={page === 1} variant="outline">
                                    Previous
                                </Button>
                                <span className="text-white font-medium">
                                    Page {page} of {totalPages}
                                </span>
                                <Button onClick={handleNextPage} disabled={page === totalPages} variant="outline">
                                    Next
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* User Details Dialog */}
            <UserDetailsDialog
                user={selectedUser}
                open={isDialogOpen}
                onOpenChange={handleDialogClose}
                onUserUpdated={handleUserUpdated}
            />
        </DashboardLayout>
    );
}
