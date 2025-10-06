import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getLikeStatus, likePost, unlikePost } from "@/lib/likes";
import AuthGateDialog from "../Popup/AuthGateDialog";

export default function LikeButton({
    postId,
    initialCount = 0,
    className,
}) {
    const { user } = useAuth();

    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState(initialCount);
    const [busy, setBusy] = useState(false);
    const [cooldownLeft, setCooldownLeft] = useState(0); // วินาที

    // modal: ให้เลือก Login/Register
    const [authOpen, setAuthOpen] = useState(false);

    // โหลดสถานะแรกเข้า
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const { liked, count } = await getLikeStatus(postId);
                if (!alive) return;
                setLiked(Boolean(liked));
                setCount(Number(count) || 0);
            } catch (e) {
                console.error("getLikeStatus:", e?.message);
            }
        })();
        return () => {
            alive = false;
        };
    }, [postId]);

    // นับถอยหลังคูลดาวน์
    useEffect(() => {
        if (cooldownLeft <= 0) return;
        const t = setInterval(() => setCooldownLeft((s) => (s <= 1 ? 0 : s - 1)), 1000);
        return () => clearInterval(t);
    }, [cooldownLeft]);

    const label = useMemo(() => {
        if (busy) return "Loading…";
        if (cooldownLeft > 0) return `Wait ${cooldownLeft}s`;
        return liked ? "Unlike" : "Like";
    }, [busy, cooldownLeft, liked]);

    const toggle = async () => {
        if (busy) return;
        if (cooldownLeft > 0) return;

        // ต้องล็อกอินก่อน
        if (!user) {
            setAuthOpen(true);
            return;
        }

        setBusy(true);
        try {
            if (liked) {
                const { liked: nowLiked, count: c } = await unlikePost(postId);
                setLiked(!!nowLiked);
                setCount(Number(c) || 0);
            } else {
                const { liked: nowLiked, count: c } = await likePost(postId);
                setLiked(!!nowLiked);
                setCount(Number(c) || 0);
            }
            setCooldownLeft(3);
        } catch (e) {
            console.error("toggle like:", e?.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <button
                type="button"
                title={label}
                onClick={toggle}
                disabled={busy || cooldownLeft > 0}
                aria-pressed={liked}
                className={`flex items-center gap-2 rounded-full border px-5 py-2 text-lg transition
          ${liked ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-white hover:bg-gray-50"}
          disabled:opacity-60 ${className || ""}`}
            >
                <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
                <span>{count}</span>
                {cooldownLeft > 0 && (
                    <span className="text-xs text-gray-500">({cooldownLeft}s)</span>
                )}
            </button>

            <AuthGateDialog
                open={authOpen}
                onClose={() => setAuthOpen(false)}
            />
        </>
    );
}