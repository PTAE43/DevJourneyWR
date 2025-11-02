import React from "react";

function formatDateForCard(d) {
    try {
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return "";
        return dt.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    } catch { return ""; }
}

function getPostLink(p) {
    if (!p) return "#";
    if (p.slug) return `/posts/${p.slug}`;
    if (p.id) return `/posts/${p.id}`;
    return "#";
}

function getAuthorName(d) {
    return d?.author?.name || d?.author_name || d?.author || "Unknown";
}
function getAuthorAvatar(d) {
    return (
        d?.author?.profile_pic ||
        d?.author_profile_pic ||
        d?.profile_pic ||
        d?.profile ||
        ""
    );
}

function getCover(d) {
    return d?.images || d?.cover_url || d?.cover || d?.image_url || "";
}

function getDate(d) {
    return d?.published_at || d?.created_at || d?.updated_at || "";
}

function CardPost({ data }) {
    const cover = getCover(data);
    const authorName = getAuthorName(data);
    const authorAvatar = getAuthorAvatar(data);
    const when = formatDateForCard(getDate(data));
    const href = getPostLink(data);

    return (
        <div className="flex flex-col gap-4">
            <a href={href} className="relative h-[212px] sm:h-[360px]">
                <img
                    className="w-full h-full object-cover rounded-md"
                    src={cover}
                    alt={data?.title || "cover"}
                    loading="lazy"
                />
            </a>

            <div className="flex flex-col">
                <div className="flex mb-2">
                    <span className="category_posts">
                        {data?.category?.name}
                    </span>
                </div>

                <a href={href}>
                    <h2 className="text-start font-bold text-xl mb-2 line-clamp-2 hover:underline">
                        {data?.title}
                    </h2>
                </a>

                <p className="text-muted-foreground text-sm mb-4 flex-grow line-clamp-3">
                    {data?.description}
                </p>

                <div className="flex items-center text-sm">
                    {authorAvatar ? (
                        <img
                            className="w-8 h-8 rounded-full mr-2 object-cover"
                            src={authorAvatar}
                            alt={authorName}
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full mr-2 bg-neutral-200" />
                    )}
                    <span className="truncate max-w-[150px]">{authorName}</span>
                    <span className="mx-2 text-gray-300">||</span>
                    <span>{when}</span>
                </div>
            </div>
        </div>
    );
}

export default CardPost;
