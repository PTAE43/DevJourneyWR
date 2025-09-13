import { supabaseAdmin } from "./lib/supabaseAdmin.js";
import { getUserFromAuthHeader } from "./lib/auth.js";

function setCors(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req, res) {
    setCors(res);

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method === "GET") return getStatus(req, res);
    if (req.method === "POST") return like(req, res);
    if (req.method === "DELETE") return unlike(req, res);

    res.status(405).json({ error: "Method Not Allowed." });
}

//GET /api/likes?postId=1
const getStatus = async (req, res) => {
    try {
        const postId = Number(req.query.postId);
        if (!postId) return res.status(400).json({ error: "postId required." });

        const { count, error: e1 } = await supabaseAdmin.from("likes").select("id", { head: true, count: "exact" }).eq("post_id", postId);
        if (e1) throw e1;

        const user = await getUserFromAuthHeader(req);
        let liked = false;
        if (user) {
            const { data, error: e2 } = await supabaseAdmin.from("likes").select("id").eq("post_id", postId).eq("user_id", user_id).limit(1);
            if (!e2) liked = (data?.length || 0) > 0;
        }

        return res.status(200).json({ count: count ?? 0, liked });

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

//POST /api/likes   body: { postId }
const like = async (req, res) => {
    try {
        const user = await getUserFromAuthHeader(req);
        if (!user) return res.status(401).json({ error: "Unauthorized." });

        const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        const postId = Number(body?.postId);
        if (!postId) return res.status(400).json({ error: "postId required." });

        const { error } = await supabaseAdmin.from("likes")
            .upsert(
                { post_id: postId, user_id: user_id },
                { onConflict: "post_id,user_id" }
            );
        if (error) throw error;

        const { count } = await supabaseAdmin.from("likes")
            .select("id", { head: true, count: "exact" })
            .eq("post_id", postId);

        return res.status(200).json({ liked: true, count: count ?? 0 });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// DELETE /api/likes?postId=1
const unlike = async (req, res) => {
    try {
        const user = await getUserFromAuthHeader(req);
        if (!user) return res.status(400).json({ error: "Unauthorized." });

        const postId = Number(req.body.postId);
        if (!postId) return res.status(400).json({ error: "postId required." });

        const { error } = await supabaseAdmin.from("likes").delete().eq("post_id", postId).eq("user_id", user_id);
        if (error) throw error;

        const { count } = await supabaseAdmin.from("likes")
            .select("id", { head: true, count: "exact" })
            .eq("post_id", postId);

        return res.status(200).json({ liked: false, count: count ?? 0 });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}