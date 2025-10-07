import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { api } from "@/lib/api";

export default function RequireAdmin() {
    const [state, setState] = useState({ loading: true, ok: false });
    const loc = useLocation();

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const r = await api.get("/profile");
                const role = r?.user?.role || "user";
                if (alive) setState({ loading: false, ok: role === "admin" });
            } catch {
                if (alive) setState({ loading: false, ok: false });
            }
        })();
        return () => { alive = false; };
    }, [loc.key]);

    if (state.loading) {
        return (
            <div className="grid min-h-[40vh] place-items-center">
                <div className="text-sm text-gray-500">Checking permission…</div>
            </div>
        );
    }

    return state.ok ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
