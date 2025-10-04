import axios from "axios";
import { supabase } from "./supabaseClient.js";

export const api = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {

    const { data: { session } } = await supabase.auth.getSession();

    const token = session?.access_token;
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});