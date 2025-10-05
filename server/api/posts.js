import { supabaseAdmin } from "./lib/supabaseAdmin.js";
import { getUserFromAuthHeader } from "./lib/auth.js";
import { applyCors } from "./lib/cors.js";

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    if (req.method === "GET") return getPosts(req, res);
    if (req.method === "POST") return createPost(req, res);
    return res.status(405).json({ error: "Method Not Allowed" });
}

// GET /api/posts?page=1&limit=10&q=&categoryId=all
async function getPosts(req, res) {
    try {
        const { page = "1", limit = "10", q = "", categoryId } = req.query;

        const currentPage = Math.max(parseInt(page, 10) || 1, 1);
        const pageSize = Math.min(50, Math.max(parseInt(limit, 10) || 10, 1)); // กัน limit ให้อยู่ 1–50
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabaseAdmin
            .from("posts")
            .select(`
        id, title, description, images, created_at, category_id, published, likes_count,
        category:categories!posts_category_id_fkey ( id, name )
      `, { count: "exact" })
            .eq("published", true)
            .order("created_at", { ascending: false });

        if (categoryId && categoryId !== "all") {
            const cid = Number(categoryId);
            if (!Number.isNaN(cid)) query = query.eq("category_id", cid);
        }
        if (q && String(q).trim()) {
            query = query.ilike("title", `%${String(q).trim()}%`);
        }

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

// POST /api/posts  (สำหรับ admin)
async function createPost(req, res) {
    try {
        const user = await getUserFromAuthHeader(req);
        if (!user) return res.status(401).json({ error: "Unauthorized" });

        const { data: urow, error: uerr } = await supabaseAdmin
            .from("users").select("role").eq("id", user.id).single();
        if (uerr) throw uerr;
        if (urow?.role !== "admin") {
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
            })
            .select()
            .single();

        if (error) throw error;
        res.status(200).json({ post: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}