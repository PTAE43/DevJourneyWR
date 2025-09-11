import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../lib/api";
import SkeletonPost from "@/components/Skeletons/SkeletonsPost";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

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

    const ArrangeContent = String(post.content || "").replace(/(##\s*)/g, "\n\n$1");

    return (
        <article className="mx-auto max-w-[1200px] px-4 py-8">
            <Link to="/" className="text-lg text-gray-500 hover:underline">← Back</Link>

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
                <div className="lg:col-span-2">
                    <div className="flex items-center md:py-4">
                        <span className="category_posts">{post.category}</span>
                        <span className="pl-4">{post.date}</span>
                    </div>
                    <h1 className="mt-2 leading-[32px] md:leading-[40px] text-2xl md:text-4xl font-bold text-[var(--color-h1-title)]">
                        {post.title}
                    </h1>
                    <div className="prose-sm max-w-none mt-6
                                    prose-h2:font-bold prose-h2:mt-6 md:prose-h2:text-xl
                                    prose-p:indent-8 prose-p:leading-6 prose-p:mt-[-14px]
                                    prose-ul:list-disc prose-ol:list-decimal prose-li:my-1
                                    text-[var(--color-text-content)]
                                    ">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {ArrangeContent}
                        </ReactMarkdown>
                    </div>

                    {/*like / share / social*/}
                    <div className="grid items-center grid-cols-1 lg:grid-cols-3 rounded-xl border-2 px-4 py-4 mt-8 gap-3 text-sm bg-[var(--color-bg-like-share)]">
                        <div className="lg:col-span-1">
                            <button className="flex items-center rounded-full border-2 px-8 py-2 bg-white hover:text-white hover:bg-[var(--color-button-like-hover)] gap-2">
                                <img src="/images/posts/happy_light.png" width={24} height={24} className="rounded-full bg-white" />
                                {post.likes}
                            </button>
                        </div>
                        <div className="flex justify-end lg:col-span-2 gap-2">
                            <button
                                className="flex items-center rounded-full border-2 px-3 py-1 gap-1 bg-white hover:bg-sky-200"
                                onClick={async () => {
                                    await navigator.clipboard.writeText(window.location.href);
                                    toast.success("I have copied the link to this page.");
                                }
                                }
                            >
                                <img src="/images/posts/Copy_light.png" width={24} height={24} />
                                Copy link
                            </button>

                            <Link to="https://www.facebook.com" target="_blank">
                                <img src="/images/posts/Facebook_black.png" width={48} height={48} className="rounded-full bg-white hover:border" />
                            </Link>
                            <Link to="https://www.linkedin.com/in/ptae43/" target="_blank">
                                <img src="/images/posts/LinkedIN_black.png" width={48} height={48} className="rounded-full bg-white hover:border" />
                            </Link>
                            <Link to="https://x.com/home" target="_blank">
                                <img src="/images/posts/Twitter_black.png" width={48} height={48} className="rounded-full bg-white hover:border" />
                            </Link>
                        </div>

                    </div>

                    {/*comments*/}
                    <section className="mt-8">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Comment
                        </label>
                        <textarea
                            className="w-full rounded-lg border p-3 outline-none focus:ring-1"
                            rows={4}
                            placeholder="What are your thoughts?"
                        />
                        <div className="flex justify-end mt-1">
                            <button className="rounded-full bg-black px-8 py-2 text-white hover:opacity-90">
                                Send
                            </button>
                        </div>
                    </section>

                    <div className="border-b-2 p-4">
                        <div className="flex items-center mt-2 font-semibold gap-3">
                            <img src={post.profile} className="w-[44px] h-[44px]" />
                            <div>
                                <div className="text-lg">{post.author}</div>
                                <span className="text-xs text-gray-400">12 September 2024 at 18:30</span>
                            </div>
                        </div>
                        <div className="pt-4 text-md text-gray-600">
                            <p className="mt-2">I am a pet enthusiast and freelance writer who specializes in animal behavior and care. With a deep love for cats, I enjoy sharing insights on feline companionship and wellness. </p>
                        </div>
                    </div>
                    <div className="border-b-2 p-4">
                        <div className="flex items-center mt-2 font-semibold gap-3">
                            <img src={post.profile} className="w-[44px] h-[44px]" />
                            <div>
                                <div className="text-lg">{post.author}</div>
                                <span className="text-xs text-gray-400">12 September 2024 at 18:30</span>
                            </div>
                        </div>
                        <div className="pt-4 text-md text-gray-600">
                            <p className="mt-2">I am a pet enthusiast and freelance writer who specializes in animal behavior and care. With a deep love for cats, I enjoy sharing insights on feline companionship and wellness. </p>
                        </div>
                    </div>
                    <div className="border-b-2 p-4">
                        <div className="flex items-center mt-2 font-semibold gap-3">
                            <img src={post.profile} className="w-[44px] h-[44px]" />
                            <div>
                                <div className="text-lg">{post.author}</div>
                                <span className="text-xs text-gray-400">12 September 2024 at 18:30</span>
                            </div>
                        </div>
                        <div className="pt-4 text-md text-gray-600">
                            <p className="mt-2">I am a pet enthusiast and freelance writer who specializes in animal behavior and care. With a deep love for cats, I enjoy sharing insights on feline companionship and wellness. </p>
                        </div>
                    </div>
                    <div className="h-40"></div>
                </div>



                {/*sticky*/}
                <div className="lg:col-span-1">
                    <div className="sticky top-5">
                        <div className="rounded-xl border border-black/10 bg-[var(--color-bg-author)] p-4">

                            <div className="flex items-center mt-2 font-semibold border-b-2 pb-4 gap-3">
                                <img src={post.profile} className="w-[44px] h-[44px]" />
                                <div>
                                    <div className="text-sm text-gray-400">Author</div>
                                    <span className="text-lg">{post.author}</span>
                                </div>
                            </div>

                            <div className="pt-4 text-md text-gray-600">
                                <p className="mt-2">I am a pet enthusiast and freelance writer who specializes in animal behavior and care. With a deep love for cats, I enjoy sharing insights on feline companionship and wellness. </p>
                                <p className="mt-6">When i’m not writing, I spends time volunteering at my local animal shelter, helping cats find loving homes.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
