import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:9090',
    timeout: 30000,
});

export default apiClient;