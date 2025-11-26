import appClient from '@/lib/axios';
import { AxiosError } from 'axios';
import { API_VERSION } from '@/lib/constants';
import type { ApiErrorResponse, User } from '@/types/api.types';

export const userService = {
    getAll: async (): Promise<User[]> => {
        try {
            const response = await appClient.get(`${API_VERSION}/users`);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                throw {
                    message: error.response.data?.message || 'Erro ao buscar usuários',
                    statusCode: error.response.status,
                    error: error.response.data?.error,
                } as ApiErrorResponse;
            }
            throw {
                message: 'Erro de conexão com o servidor',
                statusCode: 0,
            } as ApiErrorResponse;
        }
    },

    create: async (name: string, email: string, password: string) => {
        try {
            const response = await appClient.post(`${API_VERSION}/auth/register`, {
                name,
                email,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                throw {
                    message: error.response.data?.message || 'Erro ao criar usuario',
                    statusCode: error.response.status,
                    error: error.response.data?.error,
                } as ApiErrorResponse;
            }
            throw {
                message: 'Erro de conexão com o servidor',
                statusCode: 0,
            } as ApiErrorResponse;
        }
    },

    createAdmin: async (name: string, email: string, password: string) => {
        try {
            const response = await appClient.post(`${API_VERSION}/auth/register-admin`, {
                name,
                email,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                throw {
                    message: error.response.data?.message || 'Erro ao criar administrador',
                    statusCode: error.response.status,
                    error: error.response.data?.error,
                } as ApiErrorResponse;
            }
            throw {
                message: 'Erro de conexão com o servidor',
                statusCode: 0,
            } as ApiErrorResponse;
        }
    },

    update: async (id: string, data: { name?: string; email?: string; password?: string; role?: string }) => {
        try {
            const response = await appClient.patch(`${API_VERSION}/users/${id}`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                throw {
                    message: error.response.data?.message || 'Erro ao atualizar usuário',
                    statusCode: error.response.status,
                    error: error.response.data?.error,
                } as ApiErrorResponse;
            }
            throw {
                message: 'Erro de conexão com o servidor',
                statusCode: 0,
            } as ApiErrorResponse;
        }
    },

    delete: async (id: string) => {
        try {
            const response = await appClient.delete(`${API_VERSION}/users/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            console.log('Delete response:', response.data);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                throw {
                    message: error.response.data?.message || 'Erro ao excluir usuário',
                    statusCode: error.response.status,
                    error: error.response.data?.error,
                } as ApiErrorResponse;
            }
            throw {
                message: 'Erro de conexão com o servidor',
                statusCode: 0,
            } as ApiErrorResponse;
        }
    }
};