import { supabaseAdmin } from "../lib/supabaseAdmin.js";
import { getUserFromAuthHeader } from "../lib/auth.js";
import { applyCors } from "../lib/cors.js";

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    try {
        const authed = await getUserFromAuthHeader(req);
        if (!authed) return res.status(401).json({ error: "Unauthorized" });

        // ensure superadmin
        const { data: me, error: eMe } = await supabaseAdmin
            .from("users")
            .select("id, role")
            .eq("id", authed.id)
            .single();
        if (eMe) return res.status(400).json({ error: eMe.message });
        if (me?.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });

        if (req.method === "GET") return listUsers(req, res);
        if (req.method === "PUT") return updateUser(req, res);

        return res.status(405).json({ error: "Method Not Allowed" });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}

async function listUsers(req, res) {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const q = String(req.query.q || "").trim().toLowerCase();

    // ดึงจาก Auth
    const { data: authList, error: eList } = await supabaseAdmin.auth.admin.listUsers({
        page, perPage: limit,
    });
    if (eList) return res.status(400).json({ error: eList.message });

    const users = authList?.users ?? [];
    const ids = users.map(u => u.id);

    // ดึงโปรไฟล์จาก public.users (name, username, role)
    const { data: profiles } = await supabaseAdmin
        .from("users")
        .select("id, name, username, role, profile_pic")
        .in("id", ids);

    const map = new Map((profiles || []).map(p => [p.id, p]));
    let merged = users.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        ...map.get(u.id),
    }));

    if (q) {
        merged = merged.filter(u =>
            (u.email || "").toLowerCase().includes(q) ||
            (u.username || "").toLowerCase().includes(q) ||
            (u.name || "").toLowerCase().includes(q)
        );
    }

    return res.status(200).json({
        page, limit,
        users: merged,
        count: merged.length,
    });
}

async function updateUser(req, res) {
    let body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const userId = String(body.userId || "").trim();
    if (!userId) return res.status(400).json({ error: "userId required" });

    const name = "name" in body ? String(body.name || "").trim() : undefined;
    const username = "username" in body ? String(body.username || "").trim() : undefined;
    const email = "email" in body ? String(body.email || "").trim() : undefined;
    const role = "role" in body ? String(body.role || "").trim() : undefined; // 'user' | 'admin' | 'superadmin'

    // validate username
    if (typeof username !== "undefined") {
        const USERNAME_RE = /^[A-Za-z0-9._-]{3,24}$/;
        if (username && !USERNAME_RE.test(username)) {
            return res.status(400).json({ error: "Invalid username format" });
        }
        // ห้ามซ้ำกับคนอื่น
        if (username) {
            const { data: dup } = await supabaseAdmin
                .from("users")
                .select("id")
                .neq("id", userId)
                .ilike("username", username)
                .maybeSingle();
            if (dup) return res.status(409).json({ error: "Username is already taken" });
        }
    }

    // อัปเดต email
    if (typeof email !== "undefined" && email) {
        const { error: eEmail } = await supabaseAdmin.auth.admin.updateUserById(userId, { email });
        if (eEmail) return res.status(400).json({ error: eEmail.message });
    }

    // อัปเดตโปรไฟล์
    const patch = { id: userId };
    if (typeof name !== "undefined") patch.name = name;
    if (typeof username !== "undefined") patch.username = username;
    if (typeof role !== "undefined") patch.role = role;

    const { data, error } = await supabaseAdmin
        .from("users")
        .upsert(patch, { onConflict: "id" })
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ user: data });
}
