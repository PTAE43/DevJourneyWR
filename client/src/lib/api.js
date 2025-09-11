import axios from "axios";
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rmvgejnzfqkcondlkpbf.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});


api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use((r) => r,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            if (window.location.pathname !== "/login") {
                window.location.replace("/auth/login");
            }
        }
        return Promise.reject(error);
    }
);