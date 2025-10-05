import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

export function useMe() {
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const reload = useCallback(async () => {
        setLoading(true);
        setErr("");
        try {
            // ⬇️ api.get คืน JSON ตรงๆ
            const r = await api.get("/profile");
            setMe(r?.user || null);
        } catch (e) {
            setErr(e?.message || "Failed to load profile");
            setMe(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const update = useCallback(
        async (payload) => {
            await api.put("/profile", payload);
            await reload();
        },
        [reload]
    );

    useEffect(() => { reload(); }, [reload]);

    return { me, loading, err, reload, update };
}