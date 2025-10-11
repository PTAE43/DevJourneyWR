import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Message, useToaster } from "rsuite";
import { Link } from "react-router-dom";
import { formatBKK24 } from "@/lib/datetime";

export default function AdminNotifications() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const toaster = useToaster();

    const apiBase = (() => {
        const base = import.meta.env.VITE_SERVER_URL.replace(/\/+$/, "");
        return base.endsWith("/api") ? base : `${base}/api`;
    })();

    const load = async () => {
        setLoading(true);
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            const [rC, rL] = await Promise.all([
                fetch(`${apiBase}/comments?owner=me&page=1&limit=50`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${apiBase}/likes?owner=me&page=1&limit=50`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            const [jc, jl] = await Promise.all([rC.json(), rL.json()]);
            if (!rC.ok) throw new Error(jc.error || "Load comments failed");
            if (!rL.ok) throw new Error(jl.error || "Load likes failed");

            const commentItems = (jc.comments || []).map(c => ({
                type: "comment",
                id: `c-${c.id}`,
                created_at: c.created_at,
                actor: c.actor,
                post: c.post,
                text: c.content,
            }));
            const likeItems = (jl.likes || []).map(l => ({
                type: "like",
                id: `l-${l.id}`,
                created_at: l.created_at,
                actor: l.actor,
                post: l.post,
            }));

            const merged = [...commentItems, ...likeItems].sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );
            setItems(merged);
        } catch (e) {
            toaster.push(<Message type="error" closable>{e.message}</Message>, { placement: "bottomCenter" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); /* eslint-disable-line */ }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Notification</h1>
            <div className="rounded-xl border bg-white divide-y">
                {items.map(n => (
                    <div key={n.id} className="flex items-start gap-3 p-4">
                        <img
                            src={n.actor?.profile_pic || "/images/profile/default-avatar.png"}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                            <div className="text-sm">
                                <span className="font-semibold">{n.actor?.name || "Someone"}</span>{" "}
                                {n.type === "comment" ? "commented on your article:" : "liked your article:"}{" "}
                                <span className="font-medium">{n.post?.title || "—"}</span>
                            </div>
                            {n.type === "comment" && (
                                <div className="mt-1 text-sm text-gray-600">“{n.text}”</div>
                            )}
                            <div className="text-xs text-gray-400 mt-1">{formatBKK24(n.created_at)}</div>
                        </div>
                        <Link
                            to={`/posts/${n.post?.id}`}
                            className="text-sm underline whitespace-nowrap ml-2"
                        >
                            View
                        </Link>
                    </div>
                ))}

                {(!loading && items.length === 0) && (
                    <div className="p-6 text-center text-gray-500 text-sm">No notifications</div>
                )}
            </div>
        </div>
    );
}
