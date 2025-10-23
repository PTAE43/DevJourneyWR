import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../../../api/lib/cors.js'; // ใส่ .js ให้ชัด

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getUserFromBearer(req) {
    const auth = req.headers.authorization || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    if (!token) return null;
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error) return null;
    return data.user || null;
}

export default async function handler(req, res) {
    // จัดการ CORS + OPTIONS ที่นี่ครั้งเดียว
    if (applyCors(req, res)) return;

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const user = await getUserFromBearer(req);
    if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const id = req.query.id;
    if (!id) {
        res.status(400).json({ error: 'Missing id' });
        return;
    }

    const { error } = await supabaseAdmin
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
        .eq('owner_id', user.id)
        .is('read_at', null);

    if (error) {
        res.status(500).json({ error: error.message });
        return;
    }
    res.status(200).json({ ok: true });
}
