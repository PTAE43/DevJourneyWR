import { supabaseAdmin } from "./lib/supabaseAdmin.js";
import { getUserFromAuthHeader } from "./lib/auth.js";
import { applyCors } from "./lib/cors.js";

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    res.setHeader("Content-Type", "application/json; charset=utf-8");

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

// GET
async function getComments(req, res) {
    try {
        const allowedOrders = new Set(["new", "old", "mine"]);
        const orderRaw = String(req.query.order || "new");
        const order = allowedOrders.has(orderRaw) ? orderRaw : "new";

        const pageNum = Math.max(1, parseInt(req.query.page ?? "1", 10) || 1);
        const pageSize = Math.min(50, Math.max(1, parseInt(req.query.limit ?? "5", 10) || 5));
        const from = (pageNum - 1) * pageSize;
        const to = Math.max(from, from + pageSize - 1);

        const owner = String(req.query.owner || "");

        if (owner === "me") {
            const me = await getUserFromAuthHeader(req);
            if (!me) return res.status(401).json({ error: "Unauthorized" });

            const { data, error, count } = await supabaseAdmin
                .from("comments")
                .select(`
          id, post_id, user_id, content:comment_text, created_at,
          actor:users!comments_user_id_fkey ( id, name, profile_pic ),
          post:posts!comments_post_id_fkey ( id, title, author_id )
        `, { count: "exact" })
                .eq("post.author_id", me.id)
                .order("created_at", { ascending: false })
                .range(from, to);

            if (error) {
                return res.status(400).json({
                    error: error.message, code: error.code, details: error.details, hint: error.hint
                });
            }

            const total = count ?? 0;
            const totalPages = Math.max(1, Math.ceil(total / pageSize));
            return res.status(200).json({ comments: data ?? [], currentPage: pageNum, totalPages, total });
        }

        const postId = Number(req.query.postId);
        if (!Number.isFinite(postId) || postId <= 0) {
            return res.status(400).json({ error: "postId required (positive integer)" });
        }

        let currentUser = null;
        if (order === "mine") {
            currentUser = await getUserFromAuthHeader(req);
            if (!currentUser) return res.status(401).json({ error: "Unauthorized" });
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
            q = q.eq("user_id", currentUser.id).order("created_at", { ascending: false });
        } else if (order === "old") {
            q = q.order("created_at", { ascending: true });
        } else {
            q = q.order("created_at", { ascending: false }); // new
        }

        const { data, error, count } = await q.range(from, to);
        if (error) {
            return res.status(400).json({
                error: error.message, code: error.code, details: error.details, hint: error.hint
            });
        }

        const total = count ?? 0;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        return res.status(200).json({ comments: data ?? [], currentPage: pageNum, totalPages, total });
    } catch (e) {
        console.error("getComments fatal:", { query: req.query, err: e });
        return res.status(500).json({ error: e?.message || "Server error" });
    }
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

    if (error) {
        return res.status(400).json({
            error: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        });
    }
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