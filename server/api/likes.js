import { supabaseAdmin } from "./lib/supabaseAdmin.js";
import { getUserFromAuthHeader } from "./lib/auth.js";
import { applyCors } from "./lib/cors.js";

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    try {
        if (req.method === "GET") {
            // เพิ่มโหมดแจ้งเตือน
            if (String(req.query.owner || "") === "me") return getOwnerLikes(req, res);
            return getStatus(req, res);
        }
        if (req.method === "POST") return like(req, res);
        if (req.method === "DELETE") return unlike(req, res);
        return res.status(405).json({ error: "Method Not Allowed" });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}

//GET
async function getStatus(req, res) {
    const postId = Number(req.query.postId);
    if (!postId) return res.status(400).json({ error: "postId required" });

    // count ทั้งหมด
    const { count, error: e1 } = await supabaseAdmin
        .from("likes")
        .select("id", { head: true, count: "exact" })
        .eq("post_id", postId);
    if (e1) throw e1;

    // สถานะของ user ปัจจุบัน
    let liked = false;
    const user = await getUserFromAuthHeader(req);
    if (user) {
        const { data, error: e2 } = await supabaseAdmin
            .from("likes")
            .select("id")
            .eq("post_id", postId)
            .eq("user_id", user.id)
            .limit(1);
        if (!e2) liked = (data?.length || 0) > 0;
    }

    return res.status(200).json({ count: count ?? 0, liked });
}

//GET (ใหม่สำหรับ Notifications)
async function getOwnerLikes(req, res) {
    const me = await getUserFromAuthHeader(req);
    if (!me) return res.status(401).json({ error: "Unauthorized" });

    const pageNum = Math.max(1, parseInt(req.query.page ?? "1", 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.limit ?? "20", 10) || 20));
    const from = (pageNum - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabaseAdmin
        .from("likes")
        .select(`
            id, post_id, user_id, created_at,
            actor:users!likes_user_id_fkey ( id, name, profile_pic ),
            post:posts!likes_post_id_fkey ( id, title, author_id )
        `, { count: "exact" })
        // กรองเฉพาะไลก์ที่เกิดบนโพสต์ของเรา
        .eq("post.author_id", me.id)
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) return res.status(400).json({ error: error.message });

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    return res.status(200).json({
        likes: data ?? [],
        currentPage: pageNum,
        totalPages,
        total,
    });
}

//POST
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
        .from("likes")
        .select("id", { head: true, count: "exact" })
        .eq("post_id", postId);

    return res.status(200).json({ liked: true, count: count ?? 0 });
}

//DELETE
async function unlike(req, res) {
    const user = await getUserFromAuthHeader(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const postId = Number(req.query.postId);
    if (!postId) return res.status(400).json({ error: "postId required" });

    const { error } = await supabaseAdmin
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
    if (error) throw error;

    const { count } = await supabaseAdmin
        .from("likes")
        .select("id", { head: true, count: "exact" })
        .eq("post_id", postId);

    return res.status(200).json({ liked: false, count: count ?? 0 });
}
