import { supabaseAdmin } from "../lib/supabaseAdmin.js";
import { getUserFromAuthHeader } from "../lib/auth.js";

function setCors(res, origin) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req, res) {
    setCors(res, req.headers.origin);
    if (req.method === "OPTIONS") return res.status(200).end();
    try {
        if (req.method === "GET") return await getMe(req, res);
        if (req.method === "POST") return await upsertMe(req, res);
        return res.status(405).json({ error: "Method Not Allowed. for success." });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}

async function getMe(req, res) {
    try {
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

        return res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                ...(data || {}),
            },
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function upsertMe(req, res) {
    try {
        const user = await getUserFromAuthHeader(req);
        if (!user) return res.status(401).json({ error: "Unauthorized. for success. (upsert)." });

        let body = req.body;
        if (typeof body === "string") {
            try { body = JSON.parse(body); } catch { body = {}; }
        }

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
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}