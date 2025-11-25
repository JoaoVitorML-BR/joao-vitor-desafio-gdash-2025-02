import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function HomePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <DashboardLayout>
            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                                Dashboard
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                                Bem-vindo, <strong>{user?.name}</strong>!
                                <span className="text-sm ml-2">({user?.role})</span>
                            </p>
                        </div>
                        <Button onClick={handleLogout} variant="outline">
                            Sair
                        </Button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <p className="text-gray-600 dark:text-gray-300">
                            Sistema de monitoramento climático em desenvolvimento...
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}