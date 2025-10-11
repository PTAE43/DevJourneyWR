// client/src/pages/Admin/AdminArticles.jsx
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Message, useToaster } from "rsuite";

const PAGE_SIZE = 10;

/* ------------------------------------------------------------------ */
/*  Root                                                              */
/* ------------------------------------------------------------------ */
export default function AdminArticles() {
    const [mode, setMode] = useState("list"); // 'list' | 'edit'
    const [editingId, setEditingId] = useState(null); // null | 'new' | number

    return mode === "list" ? (
        <ArticleList
            onCreate={() => {
                setEditingId("new");
                setMode("edit");
            }}
            onEdit={(id) => {
                setEditingId(id);
                setMode("edit");
            }}
        />
    ) : (
        <ArticleEditor
            id={editingId}
            onBack={() => {
                setMode("list");
                setEditingId(null);
            }}
            onDeleted={() => {
                setMode("list");
                setEditingId(null);
            }}
        />
    );
}

/* ------------------------------------------------------------------ */
/*  List                                                              */
/* ------------------------------------------------------------------ */
function ArticleList({ onCreate, onEdit }) {
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("all"); // all|draft|published
    const [categoryId, setCategoryId] = useState("all");

    const [list, setList] = useState([]);
    const [cats, setCats] = useState([]);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirm, setConfirm] = useState(null); // {id,title}

    const toaster = useToaster();

    useEffect(() => {
        (async () => {
            try {
                const base = import.meta.env.VITE_SERVER_URL.replace(/\/+$/, "");
                const apiBase = base.endsWith("/api") ? base : `${base}/api`;
                const r = await fetch(`${apiBase}/categories`);
                const json = await r.json();
                setCats(json.categories || []);
            } catch {
                /* ignore */
            }
        })();
    }, []);

    const fetchList = async () => {
        setLoading(true);
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            const base = import.meta.env.VITE_SERVER_URL.replace(/\/+$/, "");
            const apiBase = base.endsWith("/api") ? base : `${base}/api`;
            const url = new URL(`${apiBase}/posts`);
            url.searchParams.set("scope", "me");
            url.searchParams.set("page", String(page));
            url.searchParams.set("limit", String(PAGE_SIZE));
            url.searchParams.set("q", q);
            url.searchParams.set("status", status);
            if (categoryId !== "all") url.searchParams.set("categoryId", categoryId);
            const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            const json = await r.json();
            if (!r.ok) throw new Error(json.error || "Load failed");
            setList(json.posts || []);
            setHasMore(json.hasMore || json.currentPage < json.totalPages);
        } catch (e) {
            toaster.push(<Message type="error" closable>{e.message}</Message>, {
                placement: "bottomCenter",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList(); // eslint-disable-line
    }, [page, status, categoryId]);

    const onSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchList();
    };

    const requestDelete = async (id) => {
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            const base = import.meta.env.VITE_SERVER_URL.replace(/\/+$/, "");
            const apiBase = base.endsWith("/api") ? base : `${base}/api`;
            const r = await fetch(`${apiBase}/posts?id=${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(json.error || "Delete failed");
            toaster.push(<Message type="success" closable>Deleted</Message>, {
                placement: "bottomCenter",
            });
            setConfirm(null);
            fetchList();
        } catch (e) {
            toaster.push(<Message type="error" closable>{e.message}</Message>, {
                placement: "bottomCenter",
            });
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold">Article management</h1>
                <button onClick={onCreate} className="rounded-full bg-neutral-900 text-white px-4 py-2">
                    + Create article
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                <form onSubmit={onSearch} className="flex gap-2">
                    <input
                        placeholder="Search…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="border rounded px-3 py-2 w-[300px]"
                    />
                    <button className="rounded bg-black text-white px-4" disabled={loading}>
                        {loading ? "Loading…" : "Search"}
                    </button>
                </form>

                <select className="border rounded px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="all">Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </select>

                <select className="border rounded px-3 py-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="all">Category</option>
                    {cats.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="rounded-xl border overflow-hidden bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th className="text-left p-3">Article title</th>
                            <th className="text-left p-3">Category</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-right p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((p) => (
                            <tr key={p.id} className="border-t">
                                <td className="p-3 truncate">{p.title}</td>
                                <td className="p-3">{Array.isArray(p.category) ? p.category[0]?.name : p.category?.name || "—"}</td>
                                <td className="p-3">{p.published ? <span className="text-emerald-600">● Published</span> : "Draft"}</td>
                                <td className="p-3 text-right space-x-2">
                                    <button className="px-3 py-1 rounded border hover:bg-neutral-50" onClick={() => onEdit(p.id)}>
                                        Edit
                                    </button>
                                    <button className="px-3 py-1 rounded border hover:bg-neutral-50" onClick={() => setConfirm({ id: p.id, title: p.title })}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {list.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-6 text-center text-gray-500">
                                    No articles
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex justify-end gap-2">
                <button className="px-3 py-1 rounded border" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Prev
                </button>
                {hasMore && (
                    <button className="px-3 py-1 rounded border" onClick={() => setPage((p) => p + 1)}>
                        Next
                    </button>
                )}
            </div>

            {confirm && (
                <ConfirmPopup
                    title="Delete article"
                    description={`Do you want to delete “${confirm.title}”?`}
                    confirmText="Delete"
                    onCancel={() => setConfirm(null)}
                    onConfirm={() => requestDelete(confirm.id)}
                />
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Editor                                                            */
/* ------------------------------------------------------------------ */
function ArticleEditor({ id, onBack, onDeleted }) {
    const isNew = id === "new";
    const [cats, setCats] = useState([]);
    const [loading, setLoading] = useState(false); // ใช้เป็นสถานะ Save
    const [confirm, setConfirm] = useState(null);

    // รูปปัจจุบันที่อยู่ใน DB
    const [form, setForm] = useState({
        title: "",
        description: "",
        images: "",
        content: "",
        category_id: "",
        status_id: null,
        published: false,
    });

    // การเลือกรูป “แบบยังไม่อัปโหลด”
    const [pendingFile, setPendingFile] = useState(null); // File | null
    const [pendingPreview, setPendingPreview] = useState(""); // objectURL
    const [previewLoading, setPreviewLoading] = useState(false); // หมุนตอน render preview
    const [imgBust, setImgBust] = useState(Date.now()); // bust cache
    const [removeOnSave, setRemoveOnSave] = useState(false); // สั่งลบตอน Save

    const toaster = useToaster();
    const fileRef = useRef(null);

    const pick = (k, v) => setForm((s) => ({ ...s, [k]: v }));

    useEffect(() => {
        (async () => {
            const base = import.meta.env.VITE_SERVER_URL.replace(/\/+$/, "");
            const apiBase = base.endsWith("/api") ? base : `${base}/api`;
            const r = await fetch(`${apiBase}/categories`);
            const json = await r.json();
            setCats(json.categories || []);
        })();
    }, []);

    useEffect(() => {
        (async () => {
            if (isNew) return;
            const base = import.meta.env.VITE_SERVER_URL.replace(/\/+$/, "");
            const apiBase = base.endsWith("/api") ? base : `${base}/api`;
            const r = await fetch(`${apiBase}/posts/${id}`);
            const json = await r.json();
            if (json.post) {
                setForm({
                    title: json.post.title || "",
                    description: json.post.description || "",
                    images: json.post.images || "",
                    content: json.post.content || "",
                    category_id: json.post.category_id || "",
                    status_id: json.post.status_id || null,
                    published: !!json.post.published,
                });
                setImgBust(Date.now());
            }
        })();
    }, [id, isNew]);

    /* ------------------------- เลือกไฟล์: preview เท่านั้น ------------------------- */
    const onPickFile = (file) => {
        if (!file) return;
        if (!/^image\/(png|jpe?g)$/i.test(file.type)) {
            toaster.push(<Message type="error" closable>Only JPG/PNG allowed</Message>, { placement: "bottomCenter" });
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toaster.push(<Message type="error" closable>Max 2MB</Message>, { placement: "bottomCenter" });
            return;
        }

        // เคลียร์คำสั่งลบ (ถ้ามี) เพราะเลือกไฟล์ใหม่แล้ว
        setRemoveOnSave(false);

        setPendingFile(file);
        setPreviewLoading(true);
        const url = URL.createObjectURL(file);
        setPendingPreview(url);
        // เมื่อรูปแสดงเสร็จจะปิดสปิน (ดู onLoad ของ <img> ด้านล่าง)
        if (fileRef.current) fileRef.current.value = "";
    };

    /* ------------------------- helper: Storage utils ------------------------- */
    const extractStoragePath = (url) => {
        try {
            const u = new URL(url);
            const m = u.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
            if (!m) return null;
            return { bucket: m[1], path: decodeURIComponent(m[2]) };
        } catch {
            return null;
        }
    };

    const uploadToStorage = async (file) => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const bucket = "images";
        const clean = file.name.replace(/\s+/g, "_");
        const key = `${user.id}/${Date.now()}_${clean}`;

        const { data, error } = await supabase.storage.from(bucket).upload(key, file, {
            upsert: true,
            contentType: file.type,
            cacheControl: "3600",
        });
        if (error) throw error;
        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
        return { publicUrl: pub.publicUrl, bucket, path: data.path };
    };

    /* ------------------------- Save (draft/publish) ------------------------- */
    const save = async (publishFlag) => {
        setLoading(true);
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            const base = import.meta.env.VITE_SERVER_URL.replace(/\/+$/, "");
            const apiBase = base.endsWith("/api") ? base : `${base}/api`;

            const payload = { ...form };
            if (typeof publishFlag === "boolean") payload.published = publishFlag;

            // 1) ถ้ามีไฟล์ที่เลือกไว้ → upload ก่อน แล้วใส่ URL ลง payload.images
            let newImageUrl = null;
            if (pendingFile) {
                const up = await uploadToStorage(pendingFile);
                newImageUrl = up.publicUrl;
                payload.images = newImageUrl;
            }

            // 2) ถ้าเลือก Remove ไว้ → เคลียร์รูปใน payload
            if (removeOnSave) {
                payload.images = "";
            }

            // 3) call API (POST/PUT)
            let r, json;
            if (isNew) {
                r = await fetch(`${apiBase}/posts`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify(payload),
                });
            } else {
                r = await fetch(`${apiBase}/posts`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ id, ...payload }),
                });
            }
            json = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(json.error || "Save failed");

            // 4) ถ้าอัปโหลดรูปใหม่สำเร็จ หรือสั่งลบ → ลบไฟล์เก่าออกจาก storage
            const oldUrl = form.images || "";
            if ((pendingFile || removeOnSave) && oldUrl) {
                const parsed = extractStoragePath(oldUrl);
                if (parsed && parsed.bucket === "images") {
                    try {
                        await supabase.storage.from("images").remove([parsed.path]);
                    } catch {
                        /* ignore */
                    }
                }
            }

            // 5) เคลียร์สถานะชั่วคราว + อัปเดตหน้าจอ
            if (newImageUrl !== null || removeOnSave) {
                setImgBust(Date.now());
                setPendingFile(null);
                if (pendingPreview) URL.revokeObjectURL(pendingPreview);
                setPendingPreview("");
                setRemoveOnSave(false);
                setForm((s) => ({ ...s, images: newImageUrl ?? "" }));
            }

            toaster.push(<Message type="success" closable>Saved</Message>, { placement: "bottomCenter" });

            // กรณีสร้างใหม่ ให้รีเฟรชเพื่อได้ id (งานจริงอาจ route ไป /admin/articles/:id)
            if (isNew && json.post?.id) {
                window.location.reload();
            }
        } catch (e) {
            toaster.push(<Message type="error" closable>{e.message}</Message>, { placement: "bottomCenter" });
        } finally {
            setLoading(false);
        }
    };

    /* ------------------------- Remove (เลื่อนการลบไปตอน Save) ------------------------- */
    const markRemove = () => {
        // ถ้ามีรูป pending ให้ล้างทิ้งไปเลย (ไม่อัปโหลด)
        if (pendingFile) {
            setPendingFile(null);
            if (pendingPreview) URL.revokeObjectURL(pendingPreview);
            setPendingPreview("");
        }
        // ถ้ามีรูปเดิมใน DB → ตั้งธงลบตอน Save
        if (form.images) setRemoveOnSave(true);
        setImgBust(Date.now());
    };

    /* ------------------------- Render ------------------------- */
    const showingImage = (() => {
        if (pendingPreview) return pendingPreview; // รูปใหม่ที่เพิ่งเลือก
        if (removeOnSave) return ""; // กำลังจะลบ → แสดง No image
        return form.images || ""; // รูปเดิมจาก DB
    })();

    const showSpinner = previewLoading || (loading && (pendingFile || removeOnSave));

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">{isNew ? "Create article" : "Edit article"}</h1>
                <div className="flex gap-2">
                    <button className="rounded border px-4 py-2" onClick={onBack}>
                        Back
                    </button>
                    <button className="rounded-full px-4 py-2 bg-white border" disabled={loading} onClick={() => save(false)}>
                        Save as draft
                    </button>
                    <button
                        className="rounded-full px-4 py-2 bg-neutral-900 text-white disabled:opacity-50"
                        disabled={loading}
                        onClick={() => save(true)}
                    >
                        Save and publish
                    </button>
                </div>
            </div>

            <div className="grid gap-4">
                {/* Thumbnail */}
                <div>
                    <label className="block text-sm mb-1">Thumbnail image</label>
                    <div className="flex items-center gap-3">
                        <div className="relative w-[300px] h-[180px] rounded border grid place-items-center bg-neutral-50 overflow-hidden">
                            {showingImage ? (
                                <img
                                    src={`${showingImage}${pendingPreview ? "" : `?v=${imgBust}`}`}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    onLoad={() => setPreviewLoading(false)}
                                />
                            ) : (
                                <span className="text-sm text-gray-400">No image</span>
                            )}

                            {/* สปินเนอร์คลุมกรอบรูป */}
                            {showSpinner && (
                                <div className="absolute inset-0 bg-white/60 grid place-items-center">
                                    <div className="h-8 w-8 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin" />
                                </div>
                            )}
                        </div>

                        <div className="space-x-2">
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/png,image/jpeg"
                                hidden
                                onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                            />
                            <button className="rounded border px-4 py-2" onClick={() => fileRef.current?.click()}>
                                Upload thumbnail image
                            </button>
                            {(form.images || pendingPreview) && (
                                <button className="rounded border px-4 py-2" onClick={markRemove}>
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                    {(pendingFile || removeOnSave) && (
                        <p className="text-xs text-gray-500 mt-1">
                            {pendingFile
                                ? "Selected a new image. It will upload when you click Save."
                                : "Image will be removed when you click Save."}
                        </p>
                    )}
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm mb-1">Category</label>
                    <select
                        className="border rounded px-3 py-2 w-[320px]"
                        value={form.category_id || ""}
                        onChange={(e) => pick("category_id", Number(e.target.value) || null)}
                    >
                        <option value="">Select category</option>
                        {cats.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm mb-1">Title</label>
                    <input className="w-full border rounded px-3 py-2" value={form.title} onChange={(e) => pick("title", e.target.value)} />
                </div>

                {/* Intro */}
                <div>
                    <label className="block text-sm mb-1">Introduction (max 120 letters)</label>
                    <textarea className="w-full border rounded px-3 py-2 h-[120px]" value={form.description} onChange={(e) => pick("description", e.target.value)} />
                </div>

                {/* Content */}
                <div>
                    <label className="block text-sm mb-1">Content</label>
                    <textarea className="w-full border rounded px-3 py-2 min-h-[300px]" value={form.content} onChange={(e) => pick("content", e.target.value)} />
                </div>

                {!isNew && (
                    <div className="pt-6">
                        <button className="rounded-full border px-4 py-2" onClick={() => setConfirm(true)}>
                            Delete article
                        </button>
                    </div>
                )}
            </div>

            {confirm && (
                <ConfirmPopup
                    title="Delete article"
                    description="Do you want to delete this article?"
                    confirmText="Delete"
                    onCancel={() => setConfirm(false)}
                    onConfirm={async () => {
                        try {
                            const token = (await supabase.auth.getSession()).data.session?.access_token;
                            const base = import.meta.env.VITE_SERVER_URL.replace(/\/+$/, "");
                            const apiBase = base.endsWith("/api") ? base : `${base}/api`;
                            const r = await fetch(`${apiBase}/posts?id=${id}`, {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            const json = await r.json().catch(() => ({}));
                            if (!r.ok) throw new Error(json.error || "Delete failed");
                            onDeleted();
                        } catch (e) {
                            toaster.push(<Message type="error" closable>{e.message}</Message>, { placement: "bottomCenter" });
                        }
                    }}
                />
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Reusable confirm popup                                            */
/* ------------------------------------------------------------------ */
function ConfirmPopup({ title, description, confirmText, onCancel, onConfirm }) {
    return (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
            <div className="bg-white rounded-xl p-6 w-[360px] shadow-xl">
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-600 mb-4">{description}</p>
                <div className="flex justify-end gap-2">
                    <button className="px-4 py-2 rounded border" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="px-4 py-2 rounded bg-neutral-900 text-white" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
