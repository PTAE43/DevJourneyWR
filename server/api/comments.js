import { supabaseAdmin } from "./lib/supabaseAdmin.js";
import { getUserFromAuthHeader } from "./lib/auth.js";
import { applyCors } from "./lib/cors.js";

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    try {
        if (req.method === "GET") return getComments(req, res);
        if (req.method === "POST") return createComment(req, res);
        if (req.method === "DELETE") return deleteComment(req, res);
        return res.status(405).json({ error: "Method Not Allowed" });
    } catch (e) {
        console.error("COMMENTS API ERROR:", e);
        return res.status(500).json({ error: e?.message || "Server error" });
    }
}

// GET  /api/comments?postId=1&order=new|old|mine&page=1&limit=5
async function getComments(req, res) {
    const postId = Number(req.query.postId);
    const order = String(req.query.order || "new"); // new | old | mine
    const pageNum = Math.max(1, parseInt(req.query.page ?? "1", 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.limit ?? "5", 10) || 5));
    const from = (pageNum - 1) * pageSize;
    const to = from + pageSize - 1;

    if (!postId) return res.status(400).json({ error: "postId required" });

    // ถ้าเป็น mine ต้องมี user
    let user = null;
    if (order === "mine") {
        user = await getUserFromAuthHeader(req);
        if (!user) return res.status(401).json({ error: "Unauthorized" });
    }

    let q = supabaseAdmin
        .from("comments")
        .select(`
            id,
            post_id,
            user_id,
            content:comment_text,
            created_at,
            author:users!comments_user_id_fkey ( id, name, profile_pic )
        `, { count: "exact" })
        .eq("post_id", postId);

    if (order === "mine") {
        q = q.eq("user_id", user.id).order("created_at", { ascending: false });
    } else if (order === "old") {
        q = q.order("created_at", { ascending: true });
    } else {
        // new (default)
        q = q.order("created_at", { ascending: false });
    }

    const { data, error, count } = await q.range(from, to);
    if (error) throw error;

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return res.status(200).json({
        comments: data ?? [],
        currentPage: pageNum,
        totalPages,
        total,
    });
}

// POST
async function createComment(req, res) {
    const user = await getUserFromAuthHeader(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    let body = req.body;
    if (typeof body === "string") {
        try { body = JSON.parse(body); } catch { body = {}; }
    }

    const postId = Number(body?.postId);
    const content = String(body?.content || "").trim();

    if (!postId) return res.status(400).json({ error: "postId required" });
    if (!content) return res.status(400).json({ error: "content required" });
    if (content.length > 500) return res.status(400).json({ error: "Max 500 characters" });

    const { data, error } = await supabaseAdmin
        .from("comments")
        .insert({ post_id: postId, user_id: user.id, comment_text: content })
        .select(`
            id, post_id, user_id, content:comment_text, created_at,
            author:users!comments_user_id_fkey ( id, name, profile_pic )
        `)
        .single();

    if (error) throw error;
    return res.status(201).json({ comment: data });
}

// DELETE
async function deleteComment(req, res) {
    const user = await getUserFromAuthHeader(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: "id required" });

    const { error } = await supabaseAdmin
        .from("comments")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id); // กันลบของคนอื่น

    if (error) throw error;
    return res.status(200).json({ ok: true });
}