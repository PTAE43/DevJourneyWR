import hhLogo from "@/assets/image-header/hh.png";
import menutoggle from "@/assets/image-header/menu-toggle.png";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import UserMenu from "@/components/Menu/UserMenu";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthed, loading } = useAuth();
    const [me, setMe] = useState(null);

    const nav = useNavigate();
    const menuRef = useRef(null);
    const toggleRef = useRef(null);

    useEffect(() => {
        let alive = true;
        (async () => {
            if (!isAuthed) { setMe(null); return; }
            try {
                const r = await api.get("/profile");
                if (alive) setMe(r?.user || null);
            } catch { if (alive) setMe(null); }
        })();
        return () => { alive = false; };
    }, [isAuthed]);

    // ปิดเมนูเมื่อคลิกนอก / แตะนอก / กด Esc
    useEffect(() => {
        function handleOutside(e) {
            if (!isOpen) return;
            const menu = menuRef.current;
            const toggle = toggleRef.current;
            if (!menu || !toggle) return;
            const target = e.target;

            const clickedInsideMenu = menu.contains(target);
            const clickedToggle = toggle.contains(target);

            if (!clickedInsideMenu && !clickedToggle) setIsOpen(false);
        }
        function onEsc(e) {
            if (isOpen && e.key === "Escape") setIsOpen(false);
        }
        document.addEventListener("mousedown", handleOutside);
        document.addEventListener("touchstart", handleOutside, { passive: true });
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", handleOutside);
            document.removeEventListener("touchstart", handleOutside);
            document.removeEventListener("keydown", onEsc);
        };
    }, [isOpen]);

    async function logout() {
        await supabase.auth.signOut().catch(() => { });
        setIsOpen(false);
        nav("/", { replace: true });
    }

    return (
        <header className="sticky top-0 z-50 bg-white shadow-md">
            <nav className="mx-auto max-w-[1200px] px-6 md:py-4 mt-4 md:mt-0 h-[48px] md:h-[80px]">
                <div className="flex justify-between items-center md:h-[48px]">
                    {/* Logo */}
                    <Link to="/" className="shrink-0">
                        <img src={hhLogo} alt="Logo" className="h-[28px] w-auto md:h-[30px]" />
                    </Link>

                    {/* Mobile toggle */}
                    <button
                        ref={toggleRef}
                        onClick={() => setIsOpen(o => !o)}
                        className="md:hidden rounded-md p-2 hover:bg-black/5"
                        aria-label="Toggle menu"
                    >
                        <img src={menutoggle} alt="Menu" width={25} height={25} />
                    </button>

                    {/* Desktop */}
                    <div className="hidden md:flex items-center gap-4">
                        {!loading && !isAuthed && (
                            <>
                                <Link
                                    to="/login"
                                    className="flex h-[48px] w-[127px] items-center justify-center rounded-full border border-[var(--color-border-login)] bg-[var(--color-bg-login)] hover:bg-gray-100 text-[var(--color-text-login)]"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/register"
                                    className="flex h-[48px] w-[127px] items-center justify-center rounded-full border border-[var(--color-border-Signup)] bg-[var(--color-bg-Signup)] hover:border-gray-700 hover:bg-gray-700 text-[var(--color-text-Signup)]"
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                        {!loading && isAuthed && <UserMenu me={me} />}
                    </div>
                </div>

                {/* Backdrop (mobile only) */}
                {isOpen && <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsOpen(false)} />}

                {/* Mobile menu */}
                <ul
                    ref={menuRef}
                    className={`md:hidden fixed left-0 right-0 top-[72px] z-50 transition-all duration-300 ease-in-out ${isOpen ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-2"
                        }`}
                >
                    <div className="mx-4 rounded-2xl bg-white p-3 drop-shadow-lg">
                        {!loading && !isAuthed ? (
                            <>
                                <li className="mb-3">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="flex w-full justify-center rounded-full border border-[var(--color-border-login)] bg-[var(--color-bg-login)] py-3 text-[var(--color-text-login)]"
                                    >
                                        Log in
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/register"
                                        onClick={() => setIsOpen(false)}
                                        className="flex w-full justify-center rounded-full border border-[var(--color-border-Signup)] bg-[var(--color-bg-Signup)] py-3 text-[var(--color-text-Signup)]"
                                    >
                                        Sign up
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <Link to="/profile" onClick={() => setIsOpen(false)} className="block rounded-lg px-4 py-3 bg-[var(--color-bg-menu-toggle-mb)] shadow">
                                    Profile
                                </Link>
                                <Link to="/profile/reset" onClick={() => setIsOpen(false)} className="block rounded-lg px-4 py-3 bg-[var(--color-bg-menu-toggle-mb)] shadow">
                                    Reset password
                                </Link>
                                {["admin", "superadmin"].includes(me?.role) && (
                                    <Link to="/admin" onClick={() => setIsOpen(false)} className="block rounded-lg px-4 py-3 bg-[var(--color-bg-menu-toggle-mb)] shadow">
                                        Admin panel
                                    </Link>
                                )}
                                <button
                                    onClick={logout}
                                    className="flex w-full items-center gap-2 rounded-lg px-4 py-3 bg-[var(--color-bg-menu-toggle-mb)] shadow"
                                >
                                    <LogOut className="h-4 w-4" /> Log out
                                </button>
                            </div>
                        )}
                    </div>
                </ul>
            </nav>
        </header>
    );
}
