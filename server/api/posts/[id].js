// import { createRequire } from "node:module";
// const require = createRequire(import.meta.url);
// const posts = require("../../data/posts.json");
import { supabaseAdmin } from "../../lib/supabaseAdmin.js";

export default async function handler(req, res) {
    try {
        const { id } = req.query;
        let q = supabaseAdmin.from("posts")
            .select("*")
            .eq("id", id) //เอาไว้สลับ ("slug", id)
            .single();

        const { data, error } = await q;
        if (error) throw error;
        res.status(200).json({ post: data });

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}