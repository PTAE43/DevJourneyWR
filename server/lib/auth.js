import { supabaseAdmin } from "./supabaseAdmin.js";

export async function getUserFromAuthHeader(req) {

    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return null;

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error) return null;

    return data.user;
}