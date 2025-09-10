import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../lib/api";
import SkeletonPost from "@/components/Skeletons/SkeletonsPost";

export default function SiglePost() {

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { id } = useParams();

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/posts/${id}`);
                setPost(data.post || data.data || data);
                window.scrollTo(0, 0);
            } catch (e) {
                setError(e?.response?.data?.message || "Failed to load post.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return <SkeletonPost minHight="70vh" />;
    if (error) return <div className="mx-auto max-w-[1200px] px-4 py-8">{error}</div>;
    if (!post) return null;

    return (
        <article className="mx-auto max-w-[1200px] px-4 py-8">
            <Link to="/" className="text-lg text-gray-500 hover:underline">← Back</Link>

            {post.images && (
                <div className="mt-6 overflow-hidden rounded-xl">
                    <div className="relative w-full">
                        <img
                            src={post.images}
                            alt={post.title}
                            className="w-full h-auto object-cover"
                            loading="eager"
                        />
                    </div>
                </div>
            )}


            {/* ---------- GRID 2 คอลัมน์ ---------- */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                
                <div className="lg:col-span-2">
                    <h1 className="mt-2 text-3xl md:text-4xl font-bold">{post.title}</h1>
                    <div className="prose prose-neutral max-w-none">
                        
                        {post.content}
                        {post.content}
                        {post.content}
                        {post.content}
                        {post.content}

                    </div>

                    {/* share / reactions (ตัวอย่างวางที่ท้ายบทความ) */}
                    <div className="mt-8 flex items-center gap-3 text-sm text-gray-500">
                        <button className="rounded-full border px-3 py-1 hover:bg-gray-50">👍 Like</button>
                        <button
                            className="rounded-full border px-3 py-1 hover:bg-gray-50"
                            onClick={() => navigator.clipboard?.writeText(window.location.href)}
                        >
                            Copy link
                        </button>
                    </div>

                    {/* comments placeholder (ต่อยอดภายหลัง) */}
                    <section className="mt-8">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Comment
                        </label>
                        <textarea
                            className="w-full rounded-lg border p-3 outline-none focus:ring-1"
                            rows={4}
                            placeholder="What are your thoughts?"
                        />
                        <div className="mt-3">
                            <button className="rounded-full bg-black px-5 py-2 text-white hover:opacity-90">
                                Send
                            </button>
                        </div>
                    </section>
                </div>

                {/* RIGHT: author card (sticky) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-5">
                        <div className="rounded-xl border border-black/10 bg-white p-4">

                            <div className="flex items-center mt-2 font-semibold border-b-2 pb-4 gap-3">
                                <img src={post.profile} className="w-[44px] h-[44px]" />
                                <div>
                                    <div className="text-sm text-gray-400">Author</div>
                                    <span className="text-lg">{post.author}</span>
                                </div>
                            </div>

                            <p className="pt-4 text-md text-gray-600">
                                <p className="mt-2">I am a pet enthusiast and freelance writer who specializes in animal behavior and care. With a deep love for cats, I enjoy sharing insights on feline companionship and wellness. </p>
                                <p className="mt-6">When i’m not writing, I spends time volunteering at my local animal shelter, helping cats find loving homes.</p>
                            </p>
                            {/* โซเชียลตัวอย่าง */}
                            <div className="mt-4 flex items-center gap-3 text-gray-500">
                                {post.authorTwitter && (
                                    <a
                                        className="hover:text-black"
                                        href={post.authorTwitter}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Twitter
                                    </a>
                                )}
                                {post.authorGithub && (
                                    <a
                                        className="hover:text-black"
                                        href={post.authorGithub}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        GitHub
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* ---------- END GRID ---------- */}

        </article>
    );
}
