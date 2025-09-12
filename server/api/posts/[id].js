import { supabaseAdmin } from "../../lib/supabaseAdmin.js";
import { applyCors } from "../../lib/cors.js";

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    try {
        const { id } = req.query;
        const { data, error } = await supabaseAdmin
            .from("posts")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        res.status(200).json({ post: data });
    } catch (e) {
        res.status(404).json({ message: e.message });
    }
}