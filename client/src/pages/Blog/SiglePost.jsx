// client/src/pages/Blog/SiglePost.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient.js";
import SkeletonPost from "@/components/Skeletons/SkeletonsPost.jsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useToaster, Message } from "rsuite";
import { useAuth } from "@/contexts/AuthContext";
import LikeButton from "@/components/Likes/LikeButton";

export default function SiglePost() {

    const toaster = useToaster();
    const { user } = useAuth(); // ใช้เช็คเจ้าของคอมเมนต์ + บังคับล็อกอินตอนส่ง

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // comments state
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);

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
                        id, title, description, content, images, created_at, published, likes_count,category_id,
                        category:categories!posts_category_id_fkey ( id, name )
                    `)
                    .eq("id", asNumber)
                    .single();

                if (error) throw error;

                setPost(data || null);
                // scroll ขึ้นอย่างนุ่มนวล
                window.scrollTo({ top: 0, behavior: "smooth" });
            } catch (e) {
                setError(e.message || "Failed to load post.");
            } finally {
                setLoading(false);
            }
        })();
    }, [slugOrId]);

    // Load comments
    async function fetchComments(postId) {
        if (!postId) return;
        setLoadingComments(true);
        try {
            const { data, error } = await supabase
                .from("comments")
                .select(`
                    id, post_id, user_id, content, created_at,
                    author:users!comments_user_id_fkey ( id, name, profile_pic )
                `)
                .eq("post_id", postId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            const list =
                (data || []).map((c) => ({
                    id: c.id,
                    user_id: c.user_id,
                    content: c.content,
                    created_at: c.created_at,
                    author_name: c.author?.name || "Anonymous",
                    author_avatar: c.author?.profile_pic || "/images/profile/default-avatar.png",
                })) || [];

            setComments(list);
        } catch (e) {
            toaster.push(
                <Message type="error" closable>
                    {e.message || "Load comments failed."}
                </Message>,
                { placement: "bottomCenter" }
            );
        } finally {
            setLoadingComments(false);
        }
    }

    useEffect(() => {
        if (post?.id) fetchComments(post.id);
    }, [post?.id]);

    // Send comment
    async function handleSend() {
        const text = draft.trim();
        if (!text) return;

        if (!user) {
            toaster.push(
                <Message type="warning" closable>
                    Please log in to comment.
                </Message>,
                { placement: "bottomCenter" }
            );
            return;
        }

        if (text.length > 500) {
            toaster.push(<Message type="warning">Max 500 characters.</Message>, {
                placement: "bottomCenter",
            });
            return;
        }

        setSending(true);
        try {
            const payload = { post_id: post.id, content: text };
            const { data, error } = await supabase
                .from("comments")
                .insert(payload)
                .select(`
                    id, post_id, user_id, content, created_at,
                    author:users!comments_user_id_fkey ( id, name, profile_pic )
                `)
                .single();

            if (error) throw error;

            const newItem = {
                id: data.id,
                user_id: data.user_id,
                content: data.content,
                created_at: data.created_at,
                author_name: data.author?.name || user?.email || "You",
                author_avatar:
                    data.author?.profile_pic ||
                    user?.user_metadata?.avatar_url ||
                    "/images/profile/default-avatar.png",
            };

            setComments((prev) => [newItem, ...prev]);
            setDraft("");
        } catch (e) {
            toaster.push(
                <Message type="error" closable>
                    {e.message || "Send comment failed."}
                </Message>,
                { placement: "bottomCenter" }
            );
        } finally {
            setSending(false);
        }
    }

    // Delete comment (owner only by RLS)
    async function handleDelete(id) {
        try {
            const { error } = await supabase.from("comments").delete().eq("id", id);
            if (error) throw error;
            setComments((prev) => prev.filter((c) => c.id !== id));
        } catch (e) {
            toaster.push(
                <Message type="error" closable>
                    {e.message || "Delete failed."}
                </Message>,
                { placement: "bottomCenter" }
            );
        }
    }

    const ArrangeContent = useMemo(
        () => String(post?.content || "").replace(/(##\s*)/g, "\n\n$1"),
        [post?.content]
    );

    if (loading) return <SkeletonPost minHight="70vh" />;
    if (error) return <div className="mx-auto max-w-[1200px] px-4 py-8">{error}</div>;
    if (!post) return null;

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
                {/* Left: content */}
                <div className="lg:col-span-2">
                    <div className="flex items-center md:py-4">
                        <span className="category_posts">{post.category?.name}</span>
                        <span className="pl-4">{post.created_at}</span>
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
                    <div className="grid items-center grid-cols-1 lg:grid-cols-3 rounded-xl border-2 px-4 py-4 mt-8 gap-3 text-sm bg-[var(--color-bg-like-share)]">
                        <div className="lg:col-span-1">
                            <LikeButton postId={post.id} initialCount={post.likes_count ?? 0} className="mt-2" />
                        </div>

                        <div className="flex justify-end lg:col-span-2 gap-2">
                            <button
                                className="flex items-center rounded-full border-2 px-3 py-1 gap-1 bg-white hover:bg-sky-200"
                                onClick={async () => {
                                    await navigator.clipboard.writeText(window.location.href);
                                    toaster.push(<Message type="success">Link copied.</Message>, {
                                        placement: "bottomCenter",
                                    });
                                }}
                            >
                                <img src="/images/posts/Copy_light.png" width={24} height={24} />
                                Copy link
                            </button>

                            <Link to="https://www.facebook.com" target="_blank">
                                <img
                                    src="/images/posts/Facebook_black.png"
                                    width={48}
                                    height={48}
                                    className="rounded-full bg-white hover:border"
                                />
                            </Link>
                            <Link to="https://www.linkedin.com/in/ptae43/" target="_blank">
                                <img
                                    src="/images/posts/LinkedIN_black.png"
                                    width={48}
                                    height={48}
                                    className="rounded-full bg-white hover:border"
                                />
                            </Link>
                            <Link to="https://x.com/home" target="_blank">
                                <img
                                    src="/images/posts/Twitter_black.png"
                                    width={48}
                                    height={48}
                                    className="rounded-full bg-white hover:border"
                                />
                            </Link>
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
                                    disabled={
                                        sending || draft.trim().length === 0 || draft.trim().length > 500
                                    }
                                    className="rounded-full bg-black px-6 py-2 text-white hover:opacity-90 disabled:opacity-50"
                                >
                                    {sending ? "Sending..." : "Send"}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Comments list */}
                    <div className="mt-6 space-y-6">
                        {loadingComments && (
                            <div className="text-sm text-gray-500">Loading comments…</div>
                        )}

                        {!loadingComments && comments.length === 0 && (
                            <div className="text-sm text-gray-500">Be the first to comment.</div>
                        )}

                        {comments.map((c) => (
                            <div key={c.id} className="border-b-2 pb-4">
                                <div className="flex items-center font-semibold gap-3">
                                    <img
                                        src={c.author_avatar}
                                        alt={c.author_name}
                                        className="w-[44px] h-[44px] rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <div className="text-lg">{c.author_name}</div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(c.created_at).toLocaleString()}
                                        </span>
                                    </div>

                                    {c.user_id === user?.id && (
                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            className="text-xs rounded-full border px-3 py-1 hover:bg-gray-50"
                                            title="Delete comment"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>

                                <div className="pt-3 text-gray-700 leading-relaxed">{c.content}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* sticky */}
                <div className="lg:col-span-1">
                    <div className="sticky md:top-[90px]">
                        <div className="rounded-xl border border-black/10 bg-[var(--color-bg-author)] p-4">
                            <div className="flex items-center font-semibold border-b-2 pb-4 gap-3">
                                <img
                                    src={post.profile || "/images/profile/default-avatar.png"}
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
        </article>
    );
}
