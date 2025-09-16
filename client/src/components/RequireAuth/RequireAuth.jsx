import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
    const [session, setSession] = useState(undefined);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
        const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
        return () => sub.subscription.unsubscribe();
    }, []);

    if (session === undefined) return null;
    if (!session) return <Navigate to="/auth/login" replace />;
    return children;
}