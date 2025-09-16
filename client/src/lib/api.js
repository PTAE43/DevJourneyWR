import axios from "axios";
import { supabase } from "./supabaseClient.js";

// const baseURL = import.meta.env.DEV
//     ? "/api" //เอาไว้ dev ทดสอบตอนเขียนโค้ด
//     : (import.meta.env.VITE_API_URL || "/api"); // --prod → ใช้โดเมน server

const baseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({ baseURL });
api.interceptors.response.use(r => r.data, e => Promise.reject(e));

api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});