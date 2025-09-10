import React from "react";

export default function SkeletonPost({ minHight = "70vh", className = "" }) {
    return (
        <article
            className={`mx-auto w-full max-w-[1200px] px-4 py-8 ${className}`}
            style={{ minHeight: typeof minHight === "number" ? `${minHight}px` : minHight }}
            aria-busy="true"
            aria-live="polite"
        >
            <div className="mb-4 h-4 w-24 rounded bg-black/10 animate-pulse" />
            <div className="h-8 w-3/4 rounded bg-black/10 animate-pulse" />
            <div className="mt-2 h-4 w-1/2 rounded bg-black/10 animate-pulse" />

            <div className="mt-6 w-full overflow-hidden rounded-xl bg-black/10 animate-pulse">
                <div className="aspect-[16/9]" />
            </div>

            <div className="mt-6 space-y-3">
                <div className="h-4 w-full rounded bg-black/10 animate-pulse" />
                <div className="h-4 w-11/12 rounded bg-black/10 animate-pulse" />
                <div className="h-4 w-10/12 rounded bg-black/10 animate-pulse" />
                <div className="h-4 w-9/12 rounded bg-black/10 animate-pulse" />
            </div>
        </article>
    );
}