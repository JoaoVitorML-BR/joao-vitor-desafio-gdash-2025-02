import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { WeatherDashboard } from '@/features/weather/components/WeatherDashboard';
import { LayoutDashboard } from 'lucide-react';

export default function HomePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-linear-to-br from-sky-400 via-blue-500 to-indigo-600 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-white drop-shadow-lg dark:text-white">
                                <LayoutDashboard className="w-10 h-10 inline-block mr-1" /> Dashboard
                            </h1>
                            <p className="mt-2 text-white/90 drop-shadow-md dark:text-gray-300">
                                Bem-vindo, <strong className="text-cyan-950">{user?.name}</strong>!
                                <span className="text-sm ml-2 text-white/80">({user?.role})</span>
                            </p>
                        </div>
                        <Button onClick={handleLogout} variant="outline" className="hover:bg-red-600 hover:text-white">
                            Sair
                        </Button>
                    </div>

                    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6">
                        <WeatherDashboard />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}