import { supabaseAdmin } from "./lib/supabaseAdmin.js";
import { getUserFromAuthHeader } from "./lib/auth.js";
import { applyCors } from "./lib/cors.js";

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    // rewrite มาจาก /api/success
    if (req.method === "POST" && String(req.query.action) === "register-success") {
        return res.status(200).json({ ok: true });
    }

    try {
        if (req.method === "GET") return getMe(req, res);
        if (req.method === "PUT") return upsertMe(req, res);
        return res.status(405).json({ error: "Method not allowed" });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}

async function getMe(req, res) {
    try {
        const user = await getUserFromAuthHeader(req);
        if (!user) return res.status(401).json({ error: "Unauthorized" });

        const { data, error } = await supabaseAdmin
            .from("users")
            .select("id, username, name, profile_pic, role")
            .eq("id", user.id)
            .single();

        // PGRST116 = row not found (ยังไม่มีโปรไฟล์ในตาราง users)
        if (error && error.code !== "PGRST116") {
            return res.status(400).json({ error: error.message });
        }

        return res
            .status(200)
            .json({ user: { id: user.id, email: user.email, ...(data || {}) } });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}

async function upsertMe(req, res) {
    try {
        const authed = await getUserFromAuthHeader(req);
        if (!authed) return res.status(401).json({ error: "Unauthorized" });

        const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
        const name = (body.name || "").trim();
        const username = (body.username || "").trim();
        const profile_pic = body.profile_pic || null;

        const USERNAME_RE = /^[A-Za-z0-9._-]{3,24}$/;
        if (!USERNAME_RE.test(username)) {
            return res.status(400).json({ error: "Invalid username format" });
        }

        // ห้ามใช้ซ้ำกับคนอื่น (เว้น id ตัวเอง)
        const { data: dup, error: eDup } = await supabaseAdmin
            .from("users")
            .select("id")
            .neq("id", authed.id)
            .ilike("username", username)
            .maybeSingle();

        if (eDup) return res.status(400).json({ error: eDup.message });
        if (dup) return res.status(409).json({ error: "Username is already taken" });

        // ดึง role เดิม (ถ้ามี) เพื่อไม่ให้โดนรีเซ็ต
        const { data: existing, error: eGet } = await supabaseAdmin
            .from("users")
            .select("role")
            .eq("id", authed.id)
            .maybeSingle();

        if (eGet) return res.status(400).json({ error: eGet.message });

        const roleToKeep = existing?.role ?? "user";

        // ไม่ต้องอัปเดต role
        const { data, error } = await supabaseAdmin
            .from("users")
            .upsert(
                { id: authed.id, name, username, profile_pic, role: roleToKeep },
                { onConflict: "id" }
            )
            .select()
            .single();

        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json({ profile: data });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}