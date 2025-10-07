import { supabaseAdmin } from "../lib/supabaseAdmin.js";
import { getUserFromAuthHeader } from "../lib/auth.js";
import { applyCors } from "../lib/cors.js";

export default async function handler(req, res) {
    if (applyCors(req, res)) return;
    try {
        if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

        const authed = await getUserFromAuthHeader(req);
        if (!authed) return res.status(401).json({ error: "Unauthorized" });

        // ตรวจสิทธิ superadmin
        const { data: me, error: eMe } = await supabaseAdmin
            .from("users")
            .select("id, role")
            .eq("id", authed.id)
            .single();
        if (eMe) return res.status(400).json({ error: eMe.message });
        if (me?.role !== "superadmin") return res.status(403).json({ error: "Forbidden" });

        let body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
        const userId = String(body.userId || "").trim();
        const newPassword = String(body.newPassword || "").trim();

        if (!userId || !newPassword) return res.status(400).json({ error: "userId and newPassword are required" });
        if (newPassword.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword });
        if (error) return res.status(400).json({ error: error.message });

        // (แนะนำ) ตัด session เดิมทั้งหมดของผู้ใช้นั้น
        await supabaseAdmin.auth.admin.signOut(data.user.id).catch(() => { });

        return res.status(200).json({ ok: true });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}
