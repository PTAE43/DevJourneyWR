import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient.js";
import SkeletonPost from "@/components/Skeletons/SkeletonsPost.jsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "@/lib/toast";
import { useAuth } from "@/contexts/AuthContext";
import LikeButton from "@/components/Likes/LikeButton";
import { api } from "@/lib/api";
import { formatBKK24, formatBKKDate } from "@/lib/datetime";
import ConfirmDialog from "@/components/Popup/ConfirmDialog";
import AuthGateDialog from "@/components/Popup/AuthGateDialog";
import Facebook_black from "@/assets/images/posts/Facebook_black.png";
import Copy_light from "@/assets/images/posts/Copy_light.png";
import LinkedIN_black from "@/assets/images/posts/LinkedIN_black.png";
import X_logo from "@/assets/images/posts/X_logo.jpg";
import default_avatar from "@/assets/images/profile/default-avatar.png"

const COMMENTS_PAGE_SIZE = 5;

export default function SiglePost() {
    const { user } = useAuth();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // comments state
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [filter, setFilter] = useState("new");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [authGateOpen, setAuthGateOpen] = useState(false);

    const { slugOrId } = useParams();

    // Load post
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const asNumber = Number(slugOrId);
                const isId = Number.isFinite(asNumber) && String(asNumber) === slugOrId;

                if (!isId) throw new Error("Invalid post id.");
                const { data, error } = await supabase
                    .from("posts")
                    .select(`
            id, title, description, content, images, created_at, published, likes_count, category_id,
            category:categories!posts_category_id_fkey ( id, name )
          `)
                    .eq("id", asNumber)
                    .single();

                if (error) throw error;

                setPost(data || null);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } catch (e) {
                setError(e.message || "Failed to load post.");
            } finally {
                setLoading(false);
            }
        })();
    }, [slugOrId]);

    // mapper ช่วยจัดรูปร่าง
    const mapComments = (data) =>
        (data || []).map((c) => ({
            id: c.id,
            user_id: c.user_id,
            content: c.content,
            created_at: c.created_at,
            author_name: c.author?.name || "Anonymous",
            author_avatar:
                c.author?.profile_pic || default_avatar,
        }));

    // Load comments
    async function fetchComments(postId, { reset = false, pageArg = 1 } = {}) {
        if (!postId) return;

        reset ? setLoadingComments(true) : setLoadingMore(true);
        try {
            const limit = COMMENTS_PAGE_SIZE;
            const pageToUse = Number.isFinite(pageArg) ? pageArg : 1;
            const res = await api.get("/comments", {
                params: { postId, order: filter, page: pageToUse, limit }
            });

            const list = mapComments(res?.comments);
            setComments(prev => {
                const merged = reset ? list : [...prev, ...list];
                // กันคอมเมนต์ซ้ำด้วย id
                const seen = new Set();
                const dedup = [];
                for (const c of merged) {
                    if (!seen.has(c.id)) { seen.add(c.id); dedup.push(c); }
                }
                return dedup;
            });

            const moreByMeta =
                typeof res?.totalPages === "number" && typeof res?.currentPage === "number"
                    ? res.currentPage < res.totalPages
                    : undefined;

            setHasMore(
                typeof moreByMeta === "boolean" ? moreByMeta : list.length === limit
            );
        } catch (e) {
            toast.error(String(e.message || "Load comments failed."));
        } finally {
            reset ? setLoadingComments(false) : setLoadingMore(false);
        }
    }

    // ครั้งแรก/เปลี่ยน filter ให้ reset หน้าและโหลดใหม่
    useEffect(() => {
        if (post?.id) {
            setPage(1);
            setHasMore(true);
            fetchComments(post.id, { reset: true, pageArg: 1 });
        }
    }, [post?.id, filter]);

    // Send
    async function handleSend() {
        const text = draft.trim();
        if (!text) return;

        if (!user) {
            toast.warning("Please log in to comment.");
            return;
        }

        if (text.length > 500) {
            toast.warning("Max 500 characters.");
            return;
        }

        setSending(true);
        try {
            const { comment } = await api.post("/comments", {
                body: { postId: post.id, content: text },
            });

            const newItem = {
                id: comment.id,
                user_id: comment.user_id,
                content: comment.content,
                created_at: comment.created_at,
                author_name: comment.author?.name || user?.email || "You",
                author_avatar:
                    comment.author?.profile_pic ||
                    user?.user_metadata?.avatar_url ||
                    default_avatar,
            };

            // "Latest"
            if (filter === "new" && page === 1) {
                setComments((prev) => [newItem, ...prev]);
            } else {
                setPage(1);
                setHasMore(true);
                fetchComments(post.id, { reset: true, pageArg: 1 });
            }

            setDraft("");
        } catch (e) {
            toast.error(String(e.message || "Send comment failed."));
        } finally {
            setSending(false);
        }
    }

    // Delete comment
    async function handleDeleteConfirmed() {
        if (!confirmDeleteId) return;
        try {
            await api.delete("/comments", { params: { id: confirmDeleteId } });
            setComments((prev) => prev.filter((c) => c.id !== confirmDeleteId));
        } catch (e) {
            toast.error(String(e.message || "Delete failed."));
        } finally {
            setConfirmDeleteId(null);
        }
    }

    const requireAuthForLike = () => {
        if (!user) {
            setAuthGateOpen(true);
            return true;
        }
        return false;
    };

    const ArrangeContent = useMemo(
        () => String(post?.content || "").replace(/(##\s*)/g, "\n\n$1"),
        [post?.content]
    );

    if (loading) return <SkeletonPost minHight="70vh" />;
    if (error) return <div className="mx-auto max-w-[1200px] px-4 py-8">{error}</div>;
    if (!post) return null;

    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(post?.title || "");
    const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    const liHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    const xHref = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;

    return (
        <article className="mx-auto max-w-[1200px] px-4 pb-8">
            <Link to="/" className="text-lg text-gray-500 hover:underline">
                ← Back
            </Link>

            {post.images && (
                <div className="mt-6 overflow-hidden rounded-xl">
                    <div className="relative w-full">
                        <img
                            src={post.images}
                            alt={post.title}
                            className="w-full h-auto md:h-[587px] object-cover"
                            loading="eager"
                        />
                    </div>
                </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left */}
                <div className="lg:col-span-2">
                    <div className="flex items-center md:py-4">
                        {(() => {
                            const cat = Array.isArray(post?.category) ? post.category[0] : post?.category;
                            const catName = cat?.name || "—";
                            return <span className="category_posts">{catName}</span>;
                        })()}
                        <span className="pl-4">{formatBKKDate(post.created_at)}</span>
                    </div>

                    <h1 className="mt-2 leading-[32px] md:leading-[40px] text-2xl md:text-4xl font-bold text-[var(--color-h1-title)]">
                        {post.title}
                    </h1>

                    <div
                        className="prose-sm max-w-none mt-6
                            prose-h2:font-bold prose-h2:mt-6 md:prose-h2:text-xl
                            prose-p:indent-8 prose-p:leading-6 prose-p:mt-[-14px]
                            prose-ul:list-disc prose-ol:list-decimal prose-li:my-1
                            text-[var(--color-text-content)]"
                    >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{ArrangeContent}</ReactMarkdown>
                    </div>

                    {/* like / share / social */}
                    <div className="grid items-center grid-cols-1 lg:grid-cols-3 rounded-xl px-4 py-4 mt-8 gap-3 text-sm bg-[var(--color-bg-like-share)]">
                        <div className="lg:col-span-1">
                            <LikeButton
                                postId={post.id}
                                initialCount={post.likes_count ?? 0}
                                className="px-7 hover:bg-red-100"
                                onRequireAuth={requireAuthForLike}
                            />
                        </div>

                        <div className="flex justify-end lg:col-span-2 gap-1">
                            <button
                                className="flex items-center rounded-full border px-8 py-1 gap-1 mr-8 bg-white hover:bg-gray-100"
                                onClick={async () => {
                                    await navigator.clipboard.writeText(window.location.href);
                                    toast.success("Link copied.");
                                }}
                            >
                                <img src={Copy_light} width={24} height={24} />
                                Copy link
                            </button>

                            <a href={fbHref} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={Facebook_black}
                                    width={48}
                                    height={48}
                                    className="rounded-full p-1 bg-white hover:opacity-90"
                                    alt="Share to Facebook"
                                />
                            </a>

                            <a href={liHref} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={LinkedIN_black}
                                    width={48}
                                    height={48}
                                    className="rounded-full p-1 bg-white hover:opacity-90"
                                    alt="Share to LinkedIn"
                                />
                            </a>

                            <a href={xHref} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={X_logo}
                                    width={48}
                                    height={48}
                                    className="rounded-full p-1 bg-white hover:opacity-90"
                                    alt="Share to X"
                                />
                            </a>
                        </div>
                    </div>

                    {/* Comments composer */}
                    <section className="mt-8">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Comment
                        </label>

                        <div className="rounded-lg border overflow-hidden focus-within:ring-1 focus-within:ring-black/60 bg-white">
                            <textarea
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                rows={4}
                                placeholder="What are your thoughts?"
                                className="w-full resize-none p-3 outline-none"
                            />
                            <div className="flex items-center justify-between px-3 pb-3 text-xs text-gray-500">
                                <span>{draft.trim().length}/500</span>
                                <button
                                    onClick={handleSend}
                                    disabled={sending || draft.trim().length === 0 || draft.trim().length > 500}
                                    className="rounded-full bg-black px-6 py-2 text-white hover:opacity-90 disabled:opacity-50"
                                >
                                    {sending ? "Sending..." : "Send"}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Comments list */}
                    <div className="mt-6 space-y-6">
                        {/* Filter bar */}
                        <div className="flex items-center gap-2 text-sm">
                            <div className="flex gap-2">
                                {["new", "old", "mine"].map((k) => (
                                    <button
                                        key={k}
                                        onClick={() => setFilter(k)}
                                        className={`rounded-full border px-3 py-1 ${filter === k ? "bg-black text-white" : "bg-white hover:bg-neutral-100"
                                            }`}
                                    >
                                        {k === "new" ? "Latest" : k === "old" ? "Oldest" : "Mine"}
                                    </button>
                                ))}
                            </div>
                            {loadingComments && <div className="text-sm text-gray-500">Loading…</div>}
                        </div>

                        {!loadingComments && comments.length === 0 && (
                            <div className="text-sm text-gray-500">Be the first to comment.</div>
                        )}

                        {comments.map((c) => (
                            <div
                                key={c.id}
                                className={`border-b-2 p-4 px-4 ${c.user_id === user?.id ? "bg-[#fafafa] rounded-lg px-2" : ""
                                    }`}
                            >
                                <div className="flex items-center font-semibold gap-3">
                                    <img
                                        src={c.author_avatar}
                                        alt={c.author_name}
                                        className="w-[44px] h-[44px] rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <div className="text-lg">{c.author_name}</div>
                                        <span className="text-xs text-gray-400">
                                            {formatBKK24(c.created_at)}
                                        </span>
                                    </div>

                                    {c.user_id === user?.id && (
                                        <button
                                            onClick={() => setConfirmDeleteId(c.id)}
                                            className="text-xs rounded-full border px-5 py-2 hover:bg-red-600 hover:text-white"
                                            title="Delete comment"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>

                                <div className="pt-3 text-gray-700 leading-relaxed">{c.content}</div>
                            </div>
                        ))}

                        {/* Load more */}
                        {comments.length > 0 && hasMore && (
                            <div className="pt-2">
                                <button
                                    onClick={() => {
                                        if (loadingMore || !hasMore) return;
                                        const next = page + 1;
                                        setPage(next);
                                        fetchComments(post.id, { reset: false, pageArg: next });
                                    }}
                                    disabled={loadingMore}
                                    className="mx-auto block rounded-full border px-5 py-2 bg-white hover:bg-neutral-100 disabled:opacity-50"
                                >
                                    {loadingMore ? "Loading…" : "Load more"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* sticky */}
                <div className="lg:col-span-1">
                    <div className="sticky md:top-[90px]">
                        <div className="rounded-xl border border-black/10 bg-[var(--color-bg-author)] p-4">
                            <div className="flex items-center font-semibold border-b-2 pb-4 gap-3">
                                <img
                                    src={post.profile || default_avatar}
                                    alt={post.author || "Author"}
                                    className="w-[44px] h-[44px] rounded-full object-cover"
                                />
                                <div>
                                    <div className="text-sm text-gray-400">Author</div>
                                    <span className="text-lg">{post.author || "—"}</span>
                                </div>
                            </div>

                            <div className="pt-4 text-md text-gray-600 leading-relaxed">
                                <p className="mt-2">
                                    I am a pet enthusiast and freelance writer who specializes in
                                    animal behavior and care. With a deep love for cats, I enjoy
                                    sharing insights on feline companionship and wellness.
                                </p>
                                <p className="mt-6">
                                    When I’m not writing, I spend time volunteering at my local
                                    animal shelter, helping cats find loving homes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                title="Delete comment"
                description="Do you want to delete this comment?"
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDeleteConfirmed}
            />

            <AuthGateDialog open={authGateOpen} onClose={() => setAuthGateOpen(false)} />
        </article>
    );
}
