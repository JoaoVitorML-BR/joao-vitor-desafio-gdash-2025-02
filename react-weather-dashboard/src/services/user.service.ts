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
    }
};