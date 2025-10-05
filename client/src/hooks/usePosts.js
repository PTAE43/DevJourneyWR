import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function usePosts() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        (async () => {
            setLoading(true);
            setErr("");
            const { data, error } = await supabase
                .from("posts")
                .select("id,title,description,images,created_at")
                .eq("published", true)
                .order("created_at", { ascending: false });

            if (error) setErr(error.message);
            else setItems(data || []);
            setLoading(false);
        })();
    }, []);

    return { items, loading, err };
}