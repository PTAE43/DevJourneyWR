import axios from "axios";
import { useNavigate } from "react-router-dom";

const navigator = useNavigate();

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use((r) => r,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            navigator("/login");
        }
        return Promise.reject(error);
    }
);