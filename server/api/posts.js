// import { createRequire } from "node:module";
// const require = createRequire(import.meta.url);
// const posts = require("../data/posts.json");
import { supabaseAdmin } from "../lib/supabaseAdmin.js";

// const norm = (s) => String(s ?? "").toLowerCase().trim();

export default async function handler(req, res) {
    try {
        const { page = 1, limit = 10, q = "", category } = req.query;

        const currentPage = Math.max(parseInt(page), 1);
        const itemsPerPage = Math.max(parseInt(limit), 1);

        const offset = (currentPage - 1) * itemsPerPage;
        const endIndex = offset + itemsPerPage - 1;

        let query = supabaseAdmin
            .from("posts")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false });

        if (category && category !== "all") query = query.eq("category", category);
        if (q) query = query.ilike("title", `%${q}%`);

        const { data, error, count } = await query.range(offset, endIndex);
        if (error) throw error;

        res.status(200).json({
            posts: data,
            currentPage,
            pageSize: itemsPerPage,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / itemsPerPage),
            hasMore: (offset + data.length) < (count || 0),
        });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}