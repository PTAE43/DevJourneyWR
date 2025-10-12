import { supabaseAdmin } from "./lib/supabaseAdmin.js";
import { getUserFromAuthHeader } from "./lib/auth.js";
import { applyCors } from "./lib/cors.js";

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    if (req.method === "GET") return getPosts(req, res);
    if (req.method === "POST") return createPost(req, res);
    if (req.method === "PUT") return updatePost(req, res);
    if (req.method === "DELETE") return deletePost(req, res);
    return res.status(405).json({ error: "Method Not Allowed" });
}

// GET /api/posts?page=1&limit=10&q=&categoryId=all&status=all|draft|published&scope=public|me
async function getPosts(req, res) {
    try {
        const { page = "1", limit = "10", q = "", categoryId, status = "all", scope = "public" } = req.query;

        const currentPage = Math.max(parseInt(page, 10) || 1, 1);
        const pageSize = Math.min(50, Math.max(parseInt(limit, 10) || 10, 1));
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;

        // scope=me → ต้องมี token
        let authed = null;
        if (scope === "me") {
            authed = await getUserFromAuthHeader(req);
            if (!authed) return res.status(401).json({ error: "Unauthorized" });
        }

        let query = supabaseAdmin
            .from("posts")
            .select(`
                id, title, description, images, content, created_at, category_id, status_id, published, likes_count, author_id,
                category:categories!posts_category_id_fkey ( id, name )
            `, { count: "exact" })
            .order("created_at", { ascending: false });

        if (scope === "public") {
            query = query.eq("published", true);
        } else if (scope === "me") {
            query = query.eq("author_id", authed.id);
        }

        if (categoryId && categoryId !== "all") {
            const cid = Number(categoryId);
            if (!Number.isNaN(cid)) query = query.eq("category_id", cid);
        }

        if (q && String(q).trim()) {
            query = query.ilike("title", `%${String(q).trim()}%`);
        }

        if (status === "published") query = query.eq("published", true);
        if (status === "draft") query = query.eq("published", false);

        const { data, error, count } = await query.range(from, to);
        if (error) throw error;

        const total = count || 0;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const hasMore = from + (data?.length || 0) < total;

        res.status(200).json({
            posts: data ?? [],
            currentPage,
            pageSize,
            total,
            totalPages,
            hasMore,
        });
    } catch (e) {
        console.error("GET /api/posts error:", e);
        res.status(500).json({ error: String(e?.message || e) });
    }
}

// POST /api/posts  (admin เท่านั้น) – เซ็ต author_id ให้ผู้สร้าง
async function createPost(req, res) {
    try {
        const user = await getUserFromAuthHeader(req);
        if (!user) return res.status(401).json({ error: "Unauthorized" });

        const { data: urow, error: uerr } = await supabaseAdmin
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();
        if (uerr) throw uerr;
        if (urow?.role !== "admin" && urow?.role !== "superadmin") {
            return res.status(403).json({ error: "Forbidden" });
        }

        const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

        const { data, error } = await supabaseAdmin
            .from("posts")
            .insert({
                title: body.title,
                description: body.description,
                images: body.images,
                content: body.content,
                category_id: body.category_id,
                status_id: body.status_id,
                published: body.published ?? true,
                author_id: user.id, // ★ สำคัญ
            })
            .select()
            .single();

        if (error) throw error;
        res.status(200).json({ post: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// PUT /api/posts  (admin/superadmin + เป็นเจ้าของโพสต์ หรือ superadmin)
async function updatePost(req, res) {
    try {
        const user = await getUserFromAuthHeader(req);
        if (!user) return res.status(401).json({ error: "Unauthorized" });

        const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
        const id = Number(body?.id);
        if (!id) return res.status(400).json({ error: "id required" });

        const { data: me, error: eMe } =
            await supabaseAdmin.from("users").select("role").eq("id", user.id).single();
        if (eMe) throw eMe;

        const { data: row, error: eRow } =
            await supabaseAdmin.from("posts").select("id, author_id").eq("id", id).single();
        if (eRow) throw eRow;

        if (me?.role !== "superadmin" && row.author_id !== user.id) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const patch = {
            title: body.title,
            description: body.description,
            images: body.images,
            content: body.content,
            category_id: body.category_id,
            status_id: body.status_id,
            published: body.published,
        };

        const { data, error } = await supabaseAdmin
            .from("posts")
            .update(patch)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json({ post: data });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
}

// DELETE /api/posts?id=123  (เจ้าของหรือ superadmin)
async function deletePost(req, res) {
    try {
        const user = await getUserFromAuthHeader(req);
        if (!user) return res.status(401).json({ error: "Unauthorized" });

        const id = Number(req.query.id);
        if (!id) return res.status(400).json({ error: "id required" });

        const { data: me, error: eMe } =
            await supabaseAdmin.from("users").select("role").eq("id", user.id).single();
        if (eMe) throw eMe;

        const { data: row, error: eRow } =
            await supabaseAdmin.from("posts").select("id, author_id").eq("id", id).single();
        if (eRow) throw eRow;

        if (me?.role !== "superadmin" && row.author_id !== user.id) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const { error } = await supabaseAdmin.from("posts").delete().eq("id", id);
        if (error) throw error;
        res.status(200).json({ ok: true });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
}

// เฟส 4
// เพิ่ม author_id ตอนสร้างโพสต์
// GET รองรับ scope=me เพื่อให้หน้า Admin ดึงเฉพาะโพสต์ของตัวเองได้
// เติม PUT/DELETE พร้อมตรวจสิทธิ์ (เจ้าของโพสต์หรือ superadmin)