import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { User, Key, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { api } from "@/lib/api";

const ProfileCtx = createContext(null);
export function useProfile() {
    return useContext(ProfileCtx);
}

export default function ProfileLayout() {
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("/profile");
                setMe(data?.user || null);
            } catch {
                navigate("login", { replace: true });
            } finally {
                setLoading(false);
            }
        })();
    }, [navigate]);

    const activeLabel = useMemo(
        () => (location.pathname.endsWith("/reset") ? "Reset password" : "Profile"),
        [location.pathname]
    );

    async function onLogout() {
        await supabase.auth.signOut();
        navigate("/login", { replace: true });
    }

    return (
        <ProfileCtx.Provider value={{ me, setMe }}>
            <div className="mx-auto max-w-[794px] p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {me?.profile_pic ? (
                            <img
                                src={me.profile_pic}
                                alt="avatar"
                                className="h-12 w-12 rounded-full object-cover ring-1 ring-black/10"
                            />
                        ) : (
                            <div className="grid h-12 w-12 place-items-center rounded-full bg-neutral-200 ring-1 ring-black/10">
                                <User className="h-6 w-6 text-neutral-500" />
                            </div>
                        )}

                        <div className="flex items-baseline gap-3">
                            <div className="text-xl font-semibold text-neutral-800">
                                {me?.name || me?.username || (loading ? "…" : "—")}
                            </div>
                            <span className="text-xl text-neutral-400">|</span>
                            <div className="text-xl font-semibold">{activeLabel}</div>
                        </div>
                    </div>


                </div>

                <div className="md:flex md:gap-8">
                    <aside className="mb-6 md:mb-0 md:w-[260px]">
                        <div className="rounded-2xl bg-[#F4F3F1] p-4">
                            <nav className="space-y-2">
                                <NavLink
                                    end
                                    to="."
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-lg px-3 py-2 transition ${isActive
                                            ? "bg-white text-black shadow"
                                            : "text-gray-700 hover:bg-white/70"
                                        }`
                                    }
                                >
                                    <User className="h-4 w-4" />
                                    <span>Profile</span>
                                </NavLink>

                                <NavLink
                                    to="reset"
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-lg px-3 py-2 transition ${isActive
                                            ? "bg-white text-black shadow"
                                            : "text-gray-700 hover:bg-white/70"
                                        }`
                                    }
                                >
                                    <Key className="h-4 w-4" />
                                    <span>Reset password</span>
                                </NavLink>
                                <button
                                    onClick={onLogout}
                                    className="flex items-center w-full gap-3 rounded-lg px-3 py-2 transition hover:bg-white/70"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </nav>
                        </div>
                    </aside>

                    <section
                        key={location.pathname}
                        className="flex-1 opacity-0 translate-y-2 transition-all duration-200
                       data-[ready=true]:opacity-100 data-[ready=true]:translate-y-0"
                        data-ready={!loading}
                    >
                        {loading ? (
                            <div className="rounded-2xl bg-[#F4F3F1] p-6">
                                <div className="h-6 w-40 rounded bg-white/60" />
                                <div className="mt-4 h-40 rounded bg-white/60" />
                            </div>
                        ) : (
                            <Outlet />
                        )}
                    </section>
                </div>
            </div>
        </ProfileCtx.Provider>
    );
}
