import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:7228', // Your Ocelot Gateway Port
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically add the Token to every request if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;