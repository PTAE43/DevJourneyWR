import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { api } from "@/lib/api";

export default function RequireAdmin() {
    const [loading, setLoading] = useState(true);
    const [ok, setOk] = useState(false);
    const loc = useLocation();

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const r = await api.get("/profile");
                const role = r?.user?.role ?? "user";
                const allowed = ["admin", "superadmin"].includes(role);
                if (alive) {
                    setOk(allowed);
                    setLoading(false);
                }
            } catch {
                if (alive) {
                    setOk(false);
                    setLoading(false);
                }
            }
        })();
        return () => { alive = false; };
    }, [loc.pathname]);

    if (loading) {
        return (
            <div className="grid min-h-[40vh] place-items-center">
                <div className="text-sm text-gray-500">Checking permission…</div>
            </div>
        );
    }

    return ok ? (
        <Outlet />
    ) : (
        <Navigate to="/admin/login" replace state={{ from: loc }} />
    );
}
