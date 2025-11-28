import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const apiClient = axios.create({
    baseURL: 'http://localhost:9090',
    timeout: 30000,
});

// Intercepctor to add Authorization header and check token expiration
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                if (decoded.exp < currentTime) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(new Error('Token expirado'));
                }

                config.headers.Authorization = `Bearer ${token}`;
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Verify response interceptor to handle 401 errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only redirect if not already on login page
            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath !== '/') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;