import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function useMe() {
    const { isAuthed } = useAuth();
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let alive = true;
        (async () => {
            if (!isAuthed) { setMe(null); return; }
            setLoading(true);
            try {
                const { data } = await api.get("/profile");
                if (alive) setMe(data?.user || null);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [isAuthed]);

    return { me, loading };
}

//เอาไว้เรียกใช้ซ้ำๆ ตอนนี้ยังไม่ได้ใช้งาน