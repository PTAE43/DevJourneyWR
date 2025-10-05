import { supabaseAdmin } from "./lib/supabaseAdmin.js";
import { getUserFromAuthHeader } from "./lib/auth.js";
import { applyCors } from "./lib/cors.js";

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    if (req.method === "GET") return getMe(req, res);
    if (req.method === "POST") return upsertMe(req, res);
    return res.status(405).json({ error: "Method Not Allowed. for success." });
}

async function getMe(req, res) {
    const user = await getUserFromAuthHeader(req);
    if (!user) return res.status(401).json({ error: "Unauthorized. for Profile. (get)." });

    const { data, error } = await supabaseAdmin
        .from("users")
        .select("id,username,name,profile_pic,role")
        .eq("id", user.id)
        .single();

    if (error && error.code !== "PGRST116") {
        return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ user: { id: user.id, email: user.email, ...(data || {}) } });
}

async function upsertMe(req, res) {
    const user = await getUserFromAuthHeader(req);
    if (!user) return res.status(401).json({ error: "Unauthorized. for success. (upsert)." });

    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }

    const row = {
        id: user.id,
        username: body?.username ?? null,
        name: body?.name ?? null,
        profile_pic: body?.profile_pic ?? null,
        role: "user",
    };

    const { data, error } = await supabaseAdmin
        .from("users")
        .upsert(row, { onConflict: "id" })
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ profile: data });
}