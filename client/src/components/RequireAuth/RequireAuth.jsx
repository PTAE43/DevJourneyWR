import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RequireAuth() {
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [authed, setAuthed] = useState(false);

    useEffect(() => {
        let unsub = () => { };

        (async () => {
            // 1.เช็ค session
            const { data } = await supabase.auth.getSession();
            setAuthed(!!data.session);
            setLoading(false);

            // 2.ตามสถานะ auth
            const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
                setAuthed(!!session);
            });
            unsub = () => sub.subscription.unsubscribe();
        })();

        return () => unsub();
    }, []);

    if (loading) return null;
    if (!authed) return <Navigate to="/login" replace state={{ from: location }} />;
    return <Outlet />;
}