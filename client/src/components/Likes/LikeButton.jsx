import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { getLikeStatus, likePost, unlikePost } from "@/lib/likes";
import { Heart } from "lucide-react";

// เอาไว้เรียก popup ให้เลือก Login/Register
function AuthPrompt({ open, onClose }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[999] grid place-items-center bg-black/40">
            <div className="w-[320px] rounded-xl bg-white p-5 shadow-xl">
                <h3 className="mb-2 text-lg font-semibold">Please sign in</h3>
                <p className="mb-4 text-sm text-gray-500">Log in or create an account to like this post.</p>
                <div className="flex justify-end gap-2">
                    <a href="/login" className="rounded-full border px-4 py-2 hover:bg-gray-50">Log in</a>
                    <a href="/register" className="rounded-full bg-black px-4 py-2 text-white hover:opacity-90">Sign up</a>
                    <button onClick={onClose} className="ml-auto text-sm text-gray-500">Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default function LikeButton({ postId, initialCount = 0, className = "" }) {
    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState(initialCount);
    const [busy, setBusy] = useState(false);
    const [cooldownLeft, setCooldownLeft] = useState(0); // วินาที
    const [showAuth, setShowAuth] = useState(false);

    // โหลดสถานะแรกเข้า
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const { liked, count } = await getLikeStatus(postId);
                if (alive) { setLiked(Boolean(liked)); setCount(Number(count) || 0); }
            } catch (e) {
                console.error("getLikeStatus:", e?.message);
            }
        })();
        return () => { alive = false; };
    }, [postId]);

    // นับถอยหลังคูลดาวน์
    useEffect(() => {
        if (cooldownLeft <= 0) return;
        const t = setInterval(() => setCooldownLeft(s => (s <= 1 ? 0 : s - 1)), 1000);
        return () => clearInterval(t);
    }, [cooldownLeft]);

    const label = useMemo(() => {
        if (busy) return "Loading…";
        if (cooldownLeft > 0) return `Wait ${cooldownLeft}s`;
        return liked ? "Unlike" : "Like";
    }, [busy, cooldownLeft, liked]);

    const toggle = async () => {
        if (busy) return;

        // คูลดาวน์: คลิกช่วงที่ยังไม่นับครบ -> ไม่ยิง API, โชว์เฉพาะ label
        if (cooldownLeft > 0) return;

        // ต้องล็อกอินก่อน
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setShowAuth(true); return; }

        setBusy(true);
        try {
            if (liked) {
                const { liked: nowLiked, count: c } = await unlikePost(postId);
                setLiked(!!nowLiked); setCount(Number(c) || 0);
            } else {
                const { liked: nowLiked, count: c } = await likePost(postId);
                setLiked(!!nowLiked); setCount(Number(c) || 0);
            }
            // เริ่มคูลดาวน์ 10 วิทุกครั้งหลังกด
            setCooldownLeft(10);
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
                    disabled:opacity-60 ${className}`}
            >
                <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
                <span>{count}</span>
                {cooldownLeft > 0 && <span className="text-xs text-gray-500">({cooldownLeft}s)</span>}
            </button>

            <AuthPrompt open={showAuth} onClose={() => setShowAuth(false)} />
        </>
    );
}