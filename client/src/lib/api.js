import { supabase } from "@/lib/supabaseClient";

const API_BASE = (() => {
    if (import.meta.env.DEV) return "/api";
    return (import.meta.env.VITE_SERVER_URL || "").replace(/\/+$/, "");
})();

const isPublicGet = (path, method) => {
    if (method !== "GET") return false;
    if (path === "/categories") return true;
    if (path === "/posts" || path.startsWith("/posts/")) return true;
    return false;
};

export async function apiFetch(
    path,
    { method = "GET", params, body, signal } = {}
) {
    const normPath = path.startsWith("/") ? path : `/${path}`;
    let url = `${API_BASE}${normPath}`;

    if (params && Object.keys(params).length) {
        const qs = new URLSearchParams(
            Object.fromEntries(
                Object.entries(params).map(([k, v]) => [k, v == null ? "" : String(v)])
            )
        ).toString();
        if (qs) url += `?${qs}`;
    }

    const needAuth = !isPublicGet(normPath, method);

    let token = null;
    if (needAuth) {
        try {
            const { data } = await supabase.auth.getSession();
            token = data?.session?.access_token || null;
        } catch { }
    }

    const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body != null && !(body instanceof FormData)
            ? { "Content-Type": "application/json" }
            : {}),
    };

    const res = await fetch(url, {
        method,
        headers,
        body:
            body == null
                ? undefined
                : body instanceof FormData
                    ? body
                    : JSON.stringify(body),
        signal,
    });

    // เมื่อ fetch เสร็จ
    const text = await res.text();
    let json = {};
    try {
        json = text ? JSON.parse(text) : {};
    } catch {
        json = { raw: text };
    }

    if (!res.ok) {
        const msg = json?.error || json?.message || (json?.raw ? String(json.raw).slice(0, 300) : `HTTP ${res.status}`);
        throw new Error(msg);
    }
    return json;
}

export const api = {
    get: (path, opts) => apiFetch(path, { ...opts, method: "GET" }),
    post: (path, opts) => apiFetch(path, { ...opts, method: "POST" }),
    put: (path, opts) => apiFetch(path, { ...(opts || {}), method: "PUT" }),
    delete: (path, opts) => apiFetch(path, { ...opts, method: "DELETE" }),
};

export { API_BASE };
