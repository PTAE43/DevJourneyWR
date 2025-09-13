import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { getLikeStatus, likePost, unlikePost } from "@/lib/likes";
import { Heart } from "lucide-react";

export const LikeButton = ({ postId, initialCount = 0, className = "" }) => {
    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState(initialCount);
    const [busy, setBusy] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const data = await getLikeStatus(postId);
                if (alive) {
                    setLiked(Boolean(data.liked));
                    setCount(Number.isFinite(data.count) ? data.count : 0);
                }

            } catch (error) {
                return console.log({ error: error.message });
            }
        })
        return () => { alive = false; };
    }, [postId]);

    const toggle = async () => {
        if (busy) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate("/auth/login"); return; }

        setBusy(true);
        try {

        } catch (error) {
            setLiked(v => !v);
            setCount(c => (liked ? c + 1 : Math.max(0, c - 1)));
            return console.log({ error: error.message });
        } finally {
            setBusy(false);
        }
    }

    return (
        <div>
            <button
                type="button"
                title={liked ? "Unlike" : "Like"}
                disabled={liked}
                onClick={toggle}
                aria-pressed={liked}
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${liked
                    ? "bg-rose-50 border-rose-200 text-rose-600"
                    : "hover:bg-gray-50"}disabled:opacity-60 ${className}`}
            >
                <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                <span>{count}</span>
            </button>
        </div>
    )

}