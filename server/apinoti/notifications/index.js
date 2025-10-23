import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../../api/lib/cors.js';

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
    if (applyCors(req, res)) return;
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const user = await getUserFromBearer(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const scope = String(req.query.scope || 'bell');
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let q = supabaseAdmin
        .from('notifications')
        .select(
            'id,type,created_at,read_at,post_id,comment_id,actor:actor_id(id,raw_user_meta_data)',
            { count: 'exact' }
        )
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    if (scope === 'bell') q = q.is('read_at', null);

    const { data, error, count } = await q.range(from, to);
    if (error) return res.status(500).json({ error: error.message });

    const postIds = [...new Set((data || []).map(n => n.post_id))].filter(Boolean);
    const commentIds = [...new Set((data || []).map(n => n.comment_id))].filter(Boolean);

    let postMap = {};
    let commentMap = {};

    if (postIds.length) {
        const { data: posts } = await supabaseAdmin
            .from('posts')
            .select('id,title')
            .in('id', postIds);
        postMap = Object.fromEntries((posts || []).map(p => [p.id, p]));
    }

    if (commentIds.length) {
        const { data: comments } = await supabaseAdmin
            .from('comments')
            .select('id, comment_text')
            .in('id', commentIds);
        commentMap = Object.fromEntries((comments || []).map(c => [c.id, c.comment_text || '']));
    }

    const items = (data || []).map(n => ({
        id: n.id,
        type: n.type,
        created_at: n.created_at,
        read_at: n.read_at,
        post: postMap[n.post_id] || { id: n.post_id, title: '' },
        comment_id: n.comment_id,
        comment_preview: n.comment_id ? (commentMap[n.comment_id] || '') : '',
        actor: {
            id: n.actor?.id,
            name: n.actor?.raw_user_meta_data?.name || 'Someone',
            profile_pic: n.actor?.raw_user_meta_data?.avatar_url || '/images/profile/default-avatar.png',
        },
    }));

    return res.status(200).json({ items, total: count || 0 });
}
