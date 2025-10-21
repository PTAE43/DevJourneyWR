import { supabaseAdmin } from "./lib/supabaseAdmin.js";
import { applyCors } from "./lib/cors.js";
import { getUserFromAuthHeader } from "./lib/auth.js";

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    if (req.method === "GET") return list(req, res);
    if (req.method === "POST") return create(req, res);
    if (req.method === "PUT") return update(req, res);
    if (req.method === "DELETE") return remove(req, res);

    return res.status(405).json({ message: "Method not allowed" });
}

async function list(req, res) {
    try {
        const { data, error } = await supabaseAdmin
            .from("categories")
            .select("id, name")
            .order("name", { ascending: true });

        if (error) throw error;
        res.status(200).json({ categories: data ?? [] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function assertAdmin(req) {
    const me = await getUserFromAuthHeader(req);
    if (!me) return { error: "Unauthorized", code: 401 };
    const { data, error } =
        await supabaseAdmin.from("users").select("role").eq("id", me.id).single();
    if (error) return { error: error.message, code: 400 };
    if (data?.role !== "admin" && data?.role !== "superadmin")
        return { error: "Forbidden", code: 403 };
    return { me };
}

async function create(req, res) {
    const chk = await assertAdmin(req);
    if (chk.error) return res.status(chk.code).json({ error: chk.error });

    try {
        const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
        const name = String(body?.name || "").trim();
        if (!name) return res.status(400).json({ error: "name required" });

        const { data, error } = await supabaseAdmin
            .from("categories").insert({ name }).select().single();
        if (error) throw error;
        res.status(201).json({ category: data });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
}

async function update(req, res) {
    const chk = await assertAdmin(req);
    if (chk.error) return res.status(chk.code).json({ error: chk.error });

    try {
        const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
        const id = Number(body?.id);
        const name = String(body?.name || "").trim();
        if (!id || !name) return res.status(400).json({ error: "id/name required" });

        const { data, error } = await supabaseAdmin
            .from("categories").update({ name }).eq("id", id).select().single();
        if (error) throw error;
        res.status(200).json({ category: data });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
}

async function remove(req, res) {
    const chk = await assertAdmin(req);
    if (chk.error) return res.status(chk.code).json({ error: chk.error });

    try {
        const id = Number(req.query.id);
        if (!id) return res.status(400).json({ error: "id required" });

        // หา General
        const { data: cats, error: catErr } = await supabaseAdmin
            .from("categories").select("id,name");
        if (catErr) throw catErr;

        const general = (cats || []).find(
            (c) => String(c.name || "").trim().toLowerCase() === "general"
        );
        if (!general) return res.status(400).json({ error: 'Category "General" not found' });

        if (id === general.id) {
            return res.status(400).json({ error: 'General cannot be deleted' });
        }

        // reassignToId: ถ้า client ส่งมาก็ใช้; ไม่งั้นใช้ General
        const reassignToId = Number(req.query.reassignToId) || general.id;

        // 1) ย้ายโพสต์ทั้งหมดในหมวดนี้ไป reassignToId
        const { error: upErr } = await supabaseAdmin
            .from("posts")
            .update({ category_id: reassignToId })
            .eq("category_id", id);
        if (upErr) throw upErr;

        // 2) ลบหมวด
        const { error: delErr } = await supabaseAdmin
            .from("categories").delete().eq("id", id);
        if (delErr) throw delErr;

        res.status(200).json({ ok: true });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
}