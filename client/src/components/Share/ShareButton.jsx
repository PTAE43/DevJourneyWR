import React from "react";

export default function ShareButton({
    title,
    text,
    url,
    className = "",
    children,
    onResult,
}) {
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

    const notify = (payload) => {
        try {
            onResult?.(payload);
        } catch {
            if (!payload.ok) console.error(payload.message);
        }
    };

    const copy = async () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(shareUrl);
            } else {
                const ta = document.createElement("textarea");
                ta.value = shareUrl;
                ta.style.position = "fixed";
                ta.style.left = "-9999px";
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
            }
            notify({ ok: true, type: "copy", message: "Link copied." });
        } catch (e) {
            notify({ ok: false, type: "error", message: e?.message || "Copy failed." });
        }
    };

    const doShare = async () => {
        const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
        if (canShare) {
            try {
                await navigator.share({ title, text, url: shareUrl });
                notify({ ok: true, type: "share", message: "Shared." });
            } catch (e) {
                // กัน error;
                const msg = String(e?.name || "").toLowerCase();
                if (msg.includes("abort") || msg.includes("canceled")) {
                    return;
                }
                // copy ได้ เอาไว้ กัน error;
                await copy();
            }
        } else {
            await copy();
        }
    };

    return (
        <button
            type="button"
            onClick={doShare}
            className={className}
            aria-label="Share"
        >
            {children ?? "Share"}
        </button>
    );
}