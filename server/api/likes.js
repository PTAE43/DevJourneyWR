import { supabaseAdmin } from "./lib/supabaseAdmin.js";
import { getUserFromAuthHeader } from "./lib/auth.js";
import { applyCors } from "./lib/cors.js";

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    try {
        if (req.method === "GET") return getStatus(req, res);
        if (req.method === "POST") return like(req, res);
        if (req.method === "DELETE") return unlike(req, res);
        return res.status(405).json({ error: "Method Not Allowed" });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}

// GET
async function getStatus(req, res) {
    const postId = Number(req.query.postId);
    if (!postId) return res.status(400).json({ error: "postId required" });

    // count ทั้งหมด
    const { count, error: e1 } = await supabaseAdmin
        .from("likes").select("id", { head: true, count: "exact" })
        .eq("post_id", postId);
    if (e1) throw e1;

    // สถานะของ user ปัจจุบัน
    let liked = false;
    const user = await getUserFromAuthHeader(req);
    if (user) {
        const { data, error: e2 } = await supabaseAdmin
            .from("likes").select("id").eq("post_id", postId).eq("user_id", user.id).limit(1);
        if (!e2) liked = (data?.length || 0) > 0;
    }

    return res.status(200).json({ count: count ?? 0, liked });
}

// POST
async function like(req, res) {
    const user = await getUserFromAuthHeader(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const postId = Number(body?.postId);
    if (!postId) return res.status(400).json({ error: "postId required" });

    const { error } = await supabaseAdmin
        .from("likes")
        .upsert({ post_id: postId, user_id: user.id }, { onConflict: "post_id,user_id" });
    if (error) throw error;

    const { count } = await supabaseAdmin
        .from("likes").select("id", { head: true, count: "exact" })
        .eq("post_id", postId);

    return res.status(200).json({ liked: true, count: count ?? 0 });
}

// DELETE
async function unlike(req, res) {
    const user = await getUserFromAuthHeader(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const postId = Number(req.query.postId);
    if (!postId) return res.status(400).json({ error: "postId required" });

    const { error } = await supabaseAdmin
        .from("likes").delete().eq("post_id", postId).eq("user_id", user.id);
    if (error) throw error;

    const { count } = await supabaseAdmin
        .from("likes").select("id", { head: true, count: "exact" })
        .eq("post_id", postId);

    return res.status(200).json({ liked: false, count: count ?? 0 });
}