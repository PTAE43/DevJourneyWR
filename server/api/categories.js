import { supabaseAdmin } from "./lib/supabaseAdmin.js";
import { applyCors } from "./lib/cors.js";

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

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