import appClient from '@/lib/axios';
import { AxiosError } from 'axios';
import type { LoginResponse, ApiErrorResponse } from '@/types/api.types';
import { API_VERSION } from '@/lib/constants';

export const authService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        try {
            const response = await appClient.post<LoginResponse>(`${API_VERSION}/auth/login`, {
                email,
                password
            });

            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                throw {
                    message: error.response.data?.message || 'Erro ao fazer login',
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
}