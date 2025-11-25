// Authentication Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    user: User;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    createdAt?: string;
    updatedAt?: string;
}

// Auth Context Types
export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    checkAuth: () => boolean;
}

// API Error Types
export interface ApiErrorResponse {
    message: string;
    statusCode: number;
    error?: string;
}

// Weather Types
export interface WeatherLog {
    _id: string;
    externalId: string;
    fetchedAt: string;
    latitude: number;
    longitude: number;
    temperature: number;
    humidity: number;
    precipitationProbability: number;
    createdAt: string;
    updatedAt: string;
}
