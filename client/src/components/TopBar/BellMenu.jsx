import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

function timeago(iso) {
    if (!iso) return "";
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
}

// สร้าง base สำหรับเรียก API (ใช้ /apinoti ตามที่ย้ายไปใหม่)
const apiBase = (() => {
    const root = (import.meta.env.VITE_SERVER_URL_V2 || "").replace(/\/+$/, "");
    if (import.meta.env.DEV) return "/apinoti";
    return root.endsWith("/apinoti") ? root : `${root}/apinoti`;
})();

export default function BellMenu() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [badge, setBadge] = useState(0);
    const ref = useRef(null);
    const navigate = useNavigate();

    async function getToken() {
        try {
            const { data } = await supabase.auth.getSession();
            return data?.session?.access_token || null;
        } catch {
            return null;
        }
    }

    async function fetchUnread() {
        const token = await getToken();
        // ถ้าไม่ล็อกอิน ให้เคลียร์รายการและ badge เงียบ ๆ
        if (!token) {
            setItems([]);
            setBadge(0);
            return;
        }

        const url = `${apiBase}/notifications?scope=bell&page=1&limit=10`;
        try {
            const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
            const list = Array.isArray(j.items) ? j.items : [];
            setItems(list);
            setBadge(list.length);
        } catch {
            // เงียบไว้ใน bell; ไม่ต้องเด้ง toast ตรงนี้
            setItems([]);
            setBadge(0);
        }
    }

    // ปิดเมื่อคลิกนอก/esc
    useEffect(() => {
        function onDocClick(e) {
            if (open && ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        function onEsc(e) {
            if (open && e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, [open]);

    // โหลด badge รอบแรก และรีโหลดทุกครั้งที่เปิด popup
    useEffect(() => {
        fetchUnread(); // initial
    }, []);
    useEffect(() => {
        if (open) fetchUnread();
    }, [open]);

    async function markReadAndGo(n) {
        const token = await getToken();
        if (token) {
            // mark as read แบบ best-effort
            try {
                await fetch(`${apiBase}/notifications/${n.id}/read`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch {
                /* ignore */
            }
        }
        // ไปหน้าโพสต์ + anchor คอมเมนต์ (ถ้ามี)
        const hash = n.type === "comment" && n.comment_id ? `#comment-${n.comment_id}` : "";
        setOpen(false);
        navigate(`/posts/${n.post?.id}${hash}`);
    }

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                aria-label="Notifications"
                onClick={() => setOpen((v) => !v)}
                className="relative p-2 rounded-full hover:bg-gray-100"
            >
                {/* ไอคอนกระดิ่ง (inline svg เพื่อลด dependency) */}
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path
                        d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6v-5a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z"
                        fill="currentColor"
                    />
                </svg>
                {badge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-xl border p-2 z-50">
                    {items.length === 0 ? (
                        <div className="px-3 py-6 text-sm text-gray-500 text-center">No new notifications</div>
                    ) : (
                        items.map((n) => (
                            <button
                                key={n.id}
                                onClick={() => markReadAndGo(n)}
                                className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 flex gap-3"
                            >
                                <img
                                    src={n.actor?.profile_pic || "/images/profile/default-avatar.png"}
                                    className="w-9 h-9 rounded-full object-cover"
                                    alt=""
                                />
                                <div className="flex-1">
                                    <div className="text-sm">
                                        <span className="font-semibold">{n.actor?.name || "Someone"}</span>{" "}
                                        {n.type === "comment"
                                            ? "Commented on your article."
                                            : "liked your article."}
                                    </div>
                                    <div className="text-xs text-gray-400">{timeago(n.created_at)}</div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}