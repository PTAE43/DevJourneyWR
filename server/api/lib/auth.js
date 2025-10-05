import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;

const authClient = createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// อ่าน token จาก header แล้วคืน user (หรือ null)
export async function getUserFromAuthHeader(req) {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return null;

    const { data, error } = await authClient.auth.getUser(token);
    if (error) return null;
    return data?.user ?? null;
}