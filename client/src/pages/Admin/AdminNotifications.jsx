import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Link } from "react-router-dom";
import AdminTopBar from "@/components/Admin/AdminTopBar";
import toast from "@/lib/toast";
import { formatBKK24 } from "@/lib/datetime";

// base สำหรับ /api (เดิม)
const apiBase = (() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return (new URL("/api", origin)).toString().replace(/\/+$/, "");
})();

export default function AdminNotifications() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    async function safeJson(res) {
        const ct = res.headers.get("content-type") || "";
        const text = await res.text();
        if (!ct.includes("application/json")) {
            return { _nonJson: true, _raw: text.slice(0, 120) };
        }
        try {
            return JSON.parse(text);
        } catch {
            return { _nonJson: true, _raw: text.slice(0, 120) };
        }
    }

    const load = async () => {
        setLoading(true);
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) { setItems([]); return; }

            const [rC, rL] = await Promise.all([
                fetch(`${apiBase}/comments?owner=me&page=1&limit=50`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${apiBase}/likes?owner=me&page=1&limit=50`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            const [jc, jl] = await Promise.all([safeJson(rC), safeJson(rL)]);

            if (jc?._nonJson || jl?._nonJson) {
                setItems([]); // แสดงว่างไว้ไปก่อน
                return;
            }

            if (!rC.ok) throw new Error(jc?.error || `HTTP ${rC.status}`);
            if (!rL.ok) throw new Error(jl?.error || `HTTP ${rL.status}`);

            const commentItems = (jc.comments || []).map(c => ({
                type: "comment",
                id: `c-${c.id}`,
                created_at: c.created_at,
                actor: c.actor,
                post: c.post,
                comment_id: c.id,
            }));

            const likeItems = (jl.likes || []).map(l => ({
                type: "like",
                id: `l-${l.id}`,
                created_at: l.created_at || l.liked_at,
                actor: l.actor,
                post: l.post,
                comment_id: 0,
            }));

            const merged = [...commentItems, ...likeItems].sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );
            setItems(merged);
        } catch (e) {
            // error จริง ๆ ค่อยเด้ง
            toast.error(String(e.message || e));
            setItems([]);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => { load(); /* eslint-disable-line */ }, []);

    return (
        <>
            <AdminTopBar title="Notification" />

            <div className="mt-8 mx-14 rounded-xl border bg-white divide-y">
                {items.map((n) => {
                    const isComment = n.type === "comment";
                    const badge = (
                        <span
                            className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${isComment ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                                }`}
                        >
                            {isComment ? "Comment" : "Like"}
                        </span>
                    );
                    const avatar = n.actor?.profile_pic || "/images/profile/default-avatar.png";
                    const name = n.actor?.name || "Someone";
                    const postTitle = n.post?.title || "—";
                    const hash = n.type === "comment" && n.comment_id ? `#comment-${n.comment_id}` : "";
                    const to = `/posts/${n.post?.id || ""}${hash}`;

                    return (
                        <div
                            key={n.id}
                            className={`flex items-start gap-3 p-4 border-l-4 ${isComment ? "border-l-amber-300" : "border-l-blue-300"
                                }`}
                        >
                            <img src={avatar} className="w-10 h-10 rounded-full object-cover" alt="Profile" />
                            <div className="flex-1">
                                <div className="text-sm">
                                    <span className="font-semibold">{name}</span>{" "}
                                    {isComment ? "commented on your article:" : "liked your article:"}{" "}
                                    <span className="font-medium">{postTitle}</span>
                                    {badge}
                                </div>
                                {isComment && n.comment_id ? (
                                    <div className="mt-1 text-xs text-gray-600">Comment • ID: {n.comment_id}</div>
                                ) : null}
                                <div className="text-xs text-gray-400 mt-1">{formatBKK24(n.created_at)}</div>
                            </div>
                            <Link to={to} className="text-sm underline whitespace-nowrap ml-2">View</Link>
                        </div>
                    );
                })}

                {!loading && items.length === 0 && (
                    <div className="p-6 text-center text-gray-500 text-sm">No notifications</div>
                )}
            </div>
        </>
    );
}
