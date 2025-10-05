import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useComments(postId) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setErr("");
        const { data, error } = await supabase
            .from("comments")
            .select("id,content,created_at,user_id,users!inner(id,name,username,profile_pic)")
            .eq("post_id", postId)
            .order("created_at", { ascending: true });
        if (error) setErr(error.message);
        else setItems(data || []);
        setLoading(false);
    }, [postId]);

    useEffect(() => { if (postId) load(); }, [postId, load]);

    const add = useCallback(async (content) => {
        const { error } = await supabase.from("comments").insert([{ post_id: postId, content }]);
        if (error) throw error;
        await load();
    }, [postId, load]);

    const remove = useCallback(async (id) => {
        const { error } = await supabase.from("comments").delete().eq("id", id);
        if (error) throw error;
        await load();
    }, [load]);

    return { items, loading, err, add, remove, reload: load };
}