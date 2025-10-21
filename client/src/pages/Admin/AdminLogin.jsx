import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "@/lib/toast";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();
    const loc = useLocation();

    const doLogin = async (e) => {
        e.preventDefault();
        setErr("");
        setLoading(true);
        try {
            // 1) sign in
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password: pwd,
            });
            if (error) throw error;

            // 2) เรียก API ตรวจ role
            const rawBase = import.meta.env.VITE_SERVER_URL;
            if (!rawBase) throw new Error("Missing VITE_SERVER_URL");

            // normalize ไม่ให้มี / ซ้ำ
            const base = rawBase.replace(/\/+$/, "");

            const resp = await fetch(`${base}/profile`, {
                headers: { Authorization: `Bearer ${data.session.access_token}` },
            });

            if (!resp.ok) {
                throw new Error(`API /api/profile ${resp.status}`);
            }

            const ct = resp.headers.get("content-type") || "";
            if (!ct.includes("application/json")) {
                throw new Error(
                    "API returned non-JSON. Please check VITE_SERVER_URL (must be your server base URL, e.g. http://localhost:3000)"
                );
            }

            const r = await resp.json();

            const role = r?.user?.role;
            if (!["admin", "superadmin"].includes(role)) {
                await supabase.auth.signOut();
                throw new Error("This account is not an admin.");
            }

            toast.success("Welcome, admin.");
            const to = loc.state?.from?.pathname || "/admin";
            nav(to, { replace: true });
        } catch (e) {
            const msg = e.message || "Login failed";
            setErr(msg);
            toast.error(String(msg));
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen grid place-items-center p-6 bg-white">
            <form onSubmit={doLogin} className="flex flex-col justify-center items-center w-[798px] h-[512px] rounded-2xl bg-[var(--color-bg-adminpanel)] p-6 shadow-xl">
                <div className="text-center text-xl font-semibold text-[var(--color-h1-adminpanel)]">Admin panel</div>
                <h1 className="text-4xl font-semibold text-center my-2">Log in</h1>
                <div className="flex flex-col w-[558px]">
                    <label className="block text-sm mt-4">Email</label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full rounded-md border px-3 py-2 ${err ? "border-red-400" : ""}`}
                        placeholder="admin@email.com"
                        type="email"
                        autoComplete="username"
                    />

                    <div className="relative">
                        <label className="block text-sm mt-4">Password</label>
                        <input
                            value={pwd}
                            onChange={(e) => setPwd(e.target.value)}
                            className={`w-full rounded-md border px-3 py-2 ${err ? "border-red-400" : ""}`}
                            placeholder="123456789"
                            type="password"
                            autoComplete="current-password"
                        />

                        {err && (
                            <p className="absolute mt-2 text-xs text-red-500">
                                Your password is incorrect or this email doesn’t exist
                            </p>
                        )}
                    </div>


                    <div className="mt-12 text-center">
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-full bg-neutral-900 text-white px-10 py-2 disabled:opacity-50"
                        >
                            {loading ? "Logging in…" : "Log in"}
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
}
