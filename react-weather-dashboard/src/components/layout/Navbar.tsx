import { Cloud, UserPlus, ChevronDown, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function Navbar() {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <nav className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3" onClick={() => navigate('/home')}>
                        <div className="p-2 bg-linear-to-br from-blue-500 to-cyan-500 rounded-lg">
                            <Cloud className="w-6 h-6 text-white" onClick={() => navigate('/home')} />
                        </div>
                        <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent" onClick={() => navigate('/home')}>
                            GDASH Weather
                        </span>
                    </div>

                    {(user?.role === 'admin' || user?.role === 'admin-master') && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    Admin
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Administração</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="gap-2 cursor-pointer"
                                    onClick={() => navigate('/home')}
                                >
                                    <Home className="w-4 h-4" />
                                    <span>Início</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="gap-2 cursor-pointer"
                                    onClick={() => navigate('/users')}
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>Gerenciar Usuários</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </nav>
    );
}