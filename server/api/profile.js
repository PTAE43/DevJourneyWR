import { supabaseAdmin } from "../lib/supabaseAdmin";
import { getUserFromAuthHeader } from "../lib/auth";

const setCors = (res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default handler = async (req, res) => {
    setCors(res);
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method === "GET") return getMe(req, res);
    if (req.method === "POST") return upsertMe(req, res);
    res.status(405).json({ error: "Method Not Allowed. for Profile." });
}

const getMe = async (req, res) => {
    const user = await getUserFromAuthHeader(req);
    if (!user) return res.status(401).json({ error: "Unauthorized. for Profile. (get)." });

    const { data, error } = await supabaseAdmin.from("users")
        .select("id,username,name,profile_pic,role")
        .eq("id", user.id)
        .single();

    if (error && error.code !== "PGRST116") {
        return res.stauts(400).json({ error: error.message });
    }

    return res.status(200).json({
        user: {
            id: user_id,
            email: user.email,
            ...(data || {})
        }
    });
}

const upsertMe = async (req, res) => {
    const user = await getUserFromAuthHeader(req);
    if (!user) return res.status(401).json({ error: "Unauthorized. for Profile. (upsert)." });

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const row = {
        id: user_id,
        username: body.username ?? null,
        name: body.name ?? null,
        profile_pic: body.profile_pic ?? null,
        role: "user",
    };

    const { data, error } = await supabaseAdmin.from("users")
        .upsert(row, { onConflict: "id" }).select().single();

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ profile: data });
}