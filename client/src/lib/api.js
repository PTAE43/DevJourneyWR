import { supabase } from "@/lib/supabaseClient";

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
    let url = `${import.meta.env.VITE_SERVER_URL}${path}`;

    if (params && Object.keys(params).length) {
        const qs = new URLSearchParams(
            Object.fromEntries(
                Object.entries(params).map(([k, v]) => [k, v == null ? "" : String(v)])
            )
        ).toString();
        if (qs) url += `?${qs}`;
    }

    const needAuth = !isPublicGet(path, method);

    let token = null;
    if (needAuth) {
        try {
            const { data } = await supabase.auth.getSession();
            token = data?.session?.access_token || null;
        } catch {
            /* ignore */
        }
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

    // safe parse
    const text = await res.text();
    let json = {};
    try {
        json = text ? JSON.parse(text) : {};
    } catch {
        json = { raw: text }; // กรณี response ไม่ใช่ JSON
    }

    if (!res.ok) {
        throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
    }
    return json;
}

export const api = {
    get: (path, opts) => apiFetch(path, { ...opts, method: "GET" }),
    post: (path, opts) => apiFetch(path, { ...opts, method: "POST" }),
    put: (path, opts) => apiFetch(path, { ...(opts || {}), method: "PUT" }),
    delete: (path, opts) => apiFetch(path, { ...opts, method: "DELETE" }),
};
