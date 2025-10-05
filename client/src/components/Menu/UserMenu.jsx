import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, KeyRound, User as UserIcon, LayoutDashboard } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export default function UserMenu({ me }) {
    const { isAuthed } = useAuth();
    const [open, setOpen] = useState(false);
    const nav = useNavigate();
    const loc = useLocation();
    const popRef = useRef(null);

    const logout = useCallback(async () => {
        try {
            await supabase.auth.signOut();
        } catch {
            /* ignore */
        } finally {
            setOpen(false);
            nav("/", { replace: true });
        }
    }, [nav]);

    // ปิดเมื่อเปลี่ยนเส้นทาง
    useEffect(() => setOpen(false), [loc.pathname]);

    // คลิกข้างนอกเพื่อปิด & ปุ่ม Esc
    useEffect(() => {
        function onClick(e) {
            if (!popRef.current) return;
            if (!popRef.current.contains(e.target)) setOpen(false);
        }
        function onEsc(e) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, []);

    if (!isAuthed) return null;

    const displayName = me?.name || me?.email || "User";
    const avatarSrc = me?.profile_pic || "/images/profile/default-avatar.png";

    return (
        <div className="flex items-center gap-3 relative" ref={popRef}>
            <button className="relative rounded-full p-1 hover:bg-black/5" aria-label="Notifications" type="button">
                <Bell className="h-5 w-5" />
                {/* badge mock */}
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <button
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-black/5"
                aria-haspopup="menu"
                aria-expanded={open}
                type="button"
            >
                <img
                    key={avatarSrc} 
                    src={avatarSrc}
                    onError={(e) => { e.currentTarget.src = "/images/profile/default-avatar.png"; }}
                    className="h-8 w-8 rounded-full object-cover"
                    alt="avatar"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                />
                <span className="hidden sm:inline max-w-[160px] truncate">{displayName}</span>
                <ChevronDown className="h-4 w-4" />
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black/5 z-50 overflow-hidden"
                >
                    <Link to="/profile" role="menuitem" className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-50">
                        <UserIcon className="h-4 w-4" /> Profile
                    </Link>
                    <Link to="/profile/reset" role="menuitem" className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-50">
                        <KeyRound className="h-4 w-4" /> Reset password
                    </Link>
                    {me?.role === "admin" && (
                        <Link to="/admin" role="menuitem" className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-50">
                            <LayoutDashboard className="h-4 w-4" /> Admin panel
                        </Link>
                    )}
                    <button
                        onClick={logout}
                        role="menuitem"
                        className="flex w-full items-center gap-2 px-4 py-2 hover:bg-neutral-50"
                        type="button"
                    >
                        <LogOut className="h-4 w-4" /> Log out
                    </button>
                </div>
            )}
        </div>
    );
}
