import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useLike(postId, userId) {
    const [count, setCount] = useState(0);
    const [liked, setLiked] = useState(false);

    const refresh = useCallback(async () => {
        const [{ count }, { data: mine }] = await Promise.all([
            supabase.from("likes").select("*", { count: "exact", head: true }).eq("post_id", postId),
            userId ? supabase.from("likes").select("id").eq("post_id", postId).eq("user_id", userId).maybeSingle() : { data: null }
        ].map(p => p.then(r => r).catch(() => ({ count: 0, data: null })))); // ป้องกัน throw

        setCount(count || 0);
        setLiked(!!mine?.data);
    }, [postId, userId]);

    useEffect(() => { if (postId) refresh(); }, [postId, refresh]);

    const toggle = useCallback(async () => {
        if (!userId) throw new Error("Please log in first.");
        if (liked) {
            await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId);
        } else {
            await supabase.from("likes").insert([{ post_id: postId, user_id: userId }]); // RLS จะบังคับให้ user_id = auth.uid() ตาม policy
        }
        await refresh();
    }, [liked, postId, userId, refresh]);

    return { count, liked, toggle, refresh };
}