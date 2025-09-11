import { supabaseAdmin } from "../../lib/supabaseAdmin.js";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        // token เอาไว้ตรวจก่อนโพสต์
        const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token);
        if (userErr || !user) {
            return res.status(401).json({ message: "Invalid token." });
        }

        const { title, content, category, images } = req.body;
        const { data, error } = await supabaseAdmin
            .from("posts")
            .insert({ title, content, category, images, author_id: user.id })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ post: data });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}