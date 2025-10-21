import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ConfirmPopup from "@/components/Popup/ConfirmPopup";
import AdminTopBar from "../AdminTopBar";
import toast from "@/lib/toast";

export default function ArticleEditor({ id, onBack, onDeleted }) {
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
        published: false
    });

    // การเลือกรูป “แบบยังไม่อัปโหลด”
    const [pendingFile, setPendingFile] = useState(null); // File | null
    const [pendingPreview, setPendingPreview] = useState(""); // objectURL
    const [previewLoading, setPreviewLoading] = useState(false); // หมุนตอน render preview
    const [imgBust, setImgBust] = useState(Date.now()); // bust cache
    const [removeOnSave, setRemoveOnSave] = useState(false); // สั่งลบตอน Save

    // ชื่อผู้เขียน (ดึงจากโปรไฟล์)
    const [authorName, setAuthorName] = useState("");

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

    useEffect(() => {
        (async () => {
            try {
                const token = (await supabase.auth.getSession()).data.session?.access_token;
                const base = import.meta.env.VITE_SERVER_URL.replace(/\/+$/, "");
                const apiBase = base.endsWith("/api") ? base : `${base}/api`;
                const r = await fetch(`${apiBase}/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const json = await r.json();
                const nm = json?.user?.name || json?.user?.username || json?.user?.email || "";
                setAuthorName(nm);
            } catch {
                setAuthorName("");
            }
        })();
    }, []);

    /* preview */
    const onPickFile = (file) => {
        if (!file) return;
        if (!/^image\/(png|jpe?g)$/i.test(file.type)) {
            toast.error("Please use file type: JPG/PNG/WEBP.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size is limited to 2MB.");
            return;
        }

        setRemoveOnSave(false);
        setPendingFile(file);
        setPreviewLoading(true);
        const url = URL.createObjectURL(file);
        setPendingPreview(url);
        if (fileRef.current) fileRef.current.value = "";
    };

    /* Storage utils */
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

    /* Save (draft/publish) */
    const save = async (publishFlag) => {
        setLoading(true);
        const key = toast.loading(publishFlag ? "Save and publish…" : "Save as draft…");
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            const base = import.meta.env.VITE_SERVER_URL.replace(/\/+$/, "");
            const apiBase = base.endsWith("/api") ? base : `${base}/api`;

            const payload = { ...form };
            if (typeof publishFlag === "boolean") {
                payload.published = publishFlag;
                payload.status_id = publishFlag ? 2 : 1;
            } else {
                if (typeof payload.published === "boolean") {
                    payload.status_id = payload.published ? 2 : 1;
                }
            }

            // upload
            let newImageUrl = null;
            if (pendingFile) {
                try {
                    const up = await uploadToStorage(pendingFile);
                    newImageUrl = up.publicUrl;
                    payload.images = newImageUrl;
                } catch (e) {
                    toast.error(String(e.message));
                    throw e;
                }
            }

            // Remove
            if (removeOnSave) {
                payload.images = "";
            }

            // call API (POST/PUT)
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
            if (!r.ok) throw new Error(json.error || "Save failed.");

            // ลบไฟล์เก่าออกจาก storage
            const oldUrl = form.images || "";
            if ((pendingFile || removeOnSave) && oldUrl) {
                const parsed = extractStoragePath(oldUrl);
                if (parsed && parsed.bucket === "images") {
                    try {
                        await supabase.storage.from("images").remove([parsed.path]);
                    } catch { }
                }
            }

            // อัปเดตหน้าจอ
            if (newImageUrl !== null || removeOnSave) {
                setImgBust(Date.now());
                setPendingFile(null);
                if (pendingPreview) URL.revokeObjectURL(pendingPreview);
                setPendingPreview("");
                setRemoveOnSave(false);
                setForm((s) => ({ ...s, images: newImageUrl ?? "" }));
            }

            toast.success(publishFlag ? "Published." : "Saved as draft.");
            // ปิด loading ทันทีที่ขึ้น success เพื่อไม่ให้ซ้อน
            await new Promise((res) => setTimeout(res, 2000));
            toast.remove(key);
            onBack();
        } catch (e) {
            toast.remove(key);
            toast.error(String(e.message || "Save failed."));
        } finally {
            setLoading(false);
        }
    };

    /* Remove (เลื่อนการลบไปตอน Save) */
    const markRemove = () => {
        // ถ้ามีรูป pending ให้ล้างทิ้งไปเลย (ไม่อัปโหลด)
        if (pendingFile) {
            setPendingFile(null);
            if (pendingPreview) URL.revokeObjectURL(pendingPreview);
            setPendingPreview("");
        }
        // ถ้ามีรูปเดิมใน DB ให้ตั้งธงลบตอน Save
        if (form.images) setRemoveOnSave(true);
        setImgBust(Date.now());
    };

    /* Render  */
    const showingImage = (() => {
        if (pendingPreview) return pendingPreview;
        if (removeOnSave) return "";
        return form.images || "";
    })();

    const showSpinner = previewLoading || (loading && (pendingFile || removeOnSave));

    return (
        <>
            <AdminTopBar
                title="Create article"
                actions={[
                    { label: "< Back", onClick: onBack, variant: "outline" },
                    { label: "Save as draft", onClick: () => save(false), variant: "neutral" },
                    { label: "Save and publish", onClick: () => save(true), variant: "primary" },
                ]}
            />
            <div className="grid mt-8 mx-14 gap-4">
                <div className="relative mb-4">
                    <label className="block text-sm mb-3">Thumbnail image</label>
                    <div className="flex items-end gap-6">
                        <div className="relative w-[460px] h-[260px] rounded-lg border-2 border-dashed border-gray-300 grid place-items-center bg-[#EFEEEB] overflow-hidden">
                            {showingImage ? (
                                <img
                                    src={`${showingImage}${pendingPreview ? "" : `?v=${imgBust}`}`}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    onLoad={() => setPreviewLoading(false)}
                                />
                            ) : (
                                <span>
                                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                                        <path d="M5 13C5 9.22876 5 7.34315 6.17157 6.17157C7.34315 5 9.22876 5 13 5H27C30.7712 5 32.6569 5 33.8284 6.17157C35 7.34315 35 9.22876 35 13V27C35 30.7712 35 32.6569 33.8284 33.8284C32.6569 35 30.7712 35 27 35H13C9.22876 35 7.34315 35 6.17157 33.8284C5 32.6569 5 30.7712 5 27V13Z" stroke="#75716B" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M33 25.626L29.8486 22.4746L29.8228 22.4488C29.1781 21.8041 28.6585 21.2844 28.1948 20.9307C27.7135 20.5634 27.2342 20.3282 26.6667 20.3282C26.0992 20.3282 25.6199 20.5634 25.1385 20.9307C24.6749 21.2844 24.1552 21.804 23.5106 22.4487L23.4847 22.4746L21.7353 24.224C21.2505 24.7088 20.926 25.0315 20.6609 25.2283C20.4041 25.419 20.3004 25.4169 20.2428 25.4059C20.1852 25.3948 20.0881 25.3581 19.9205 25.0857C19.7475 24.8045 19.566 24.3844 19.2959 23.7542L17.7869 20.2332L17.7698 20.1932C17.2571 18.9969 16.8499 18.0467 16.4367 17.3751C16.0135 16.6873 15.5221 16.1873 14.7981 16.0479C14.0742 15.9085 13.4323 16.1902 12.7839 16.6717C12.1508 17.1418 11.4198 17.8728 10.4996 18.7931L10.4688 18.8239L7 22.2926V23.7068L11.1759 19.531C12.1339 18.5729 12.8133 17.8954 13.3801 17.4745C13.9386 17.0598 14.2909 16.9686 14.609 17.0299C14.9272 17.0911 15.2204 17.3066 15.5849 17.8991C15.9549 18.5004 16.3341 19.3818 16.8678 20.6271L18.3768 24.1481L18.3925 24.1848C18.6427 24.7686 18.8524 25.258 19.0687 25.6097C19.295 25.9775 19.5902 26.2986 20.0536 26.3878C20.5171 26.4771 20.9104 26.2886 21.2571 26.0312C21.5886 25.785 21.9651 25.4085 22.4142 24.9593L22.4424 24.9311L24.1918 23.1817C24.8685 22.5051 25.3411 22.0339 25.7451 21.7257C26.1375 21.4263 26.4057 21.3282 26.6667 21.3282C26.9276 21.3282 27.1958 21.4263 27.5882 21.7257C27.9922 22.0339 28.4649 22.5051 29.1415 23.1817L32.9798 27.02L33 26.9997V25.626Z" fill="#75716B" />
                                        <circle cx="27.5" cy="12.5" r="2.5" fill="#75716B" />
                                    </svg>
                                </span>
                            )}

                            {/* สปินเนอร์คลุมกรอบรูป */}
                            {showSpinner && (
                                <div className="absolute inset-0 bg-white/60 grid place-items-center ">
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
                            <button className="text-base rounded-full border border-gray-400 px-8 py-2 bg-white hover:text-blue-500 transition" onClick={() => fileRef.current?.click()}>
                                Upload thumbnail image
                            </button>
                            {(form.images || pendingPreview) && (
                                <button className="text-base rounded-full border border-gray-400 px-8 py-2 hover:text-red-500 transition" onClick={markRemove}>
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="absolute">
                        {(pendingFile || removeOnSave) && (
                            <p className="text-xs text-gray-400 mt-1">
                                {pendingFile
                                    ? "Selected a new image. It will upload when you click Save."
                                    : "Image will be removed when you click Save."}
                            </p>
                        )}
                    </div>

                </div>

                {/* Category */}
                <div className="text-base">
                    <label className="block mb-1">Category</label>
                    <div className="relative flex items-center w-[480px]">
                        <select
                            className="border rounded-lg px-3 py-2 w-full appearance-none cursor-pointer
                                focus:outline-none focus:ring-1 focus:ring-black/60"
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
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute right-3 stroke-gray-400">
                            <path d="M18 9L12 15L6 9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                </div>

                <div className="w-[480px]">
                    <label className="block mb-1 text-gray-300">Author name</label>
                    <input
                        value={authorName}
                        readOnly
                        className="w-full rounded-lg px-3 py-2 bg-[#EFEEEB] text-gray-300 cursor-not-allowed"
                        placeholder="—"
                    />
                </div>

                {/* Title */}
                <div>
                    <label className="block mb-1">Title</label>
                    <input className="w-full border rounded-lg px-3 py-2" value={form.title} onChange={(e) => pick("title", e.target.value)} />
                </div>

                {/* Intro */}
                <div>
                    <label className="block mb-1">Introduction (max 120 letters)</label>
                    <textarea className="w-full border rounded-lg px-3 py-2 h-[120px]" value={form.description} onChange={(e) => pick("description", e.target.value)} />
                </div>

                {/* Content */}
                <div>
                    <label className="block mb-1">Content</label>
                    <textarea className="w-full border rounded-lg px-3 py-2 min-h-[500px]" value={form.content} onChange={(e) => pick("content", e.target.value)} />
                </div>
                {!isNew && (
                    <div className="flex items-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M10 15L10 12" stroke="#75716B" strokeLinecap="round" />
                            <path d="M14 15L14 12" stroke="#75716B" strokeLinecap="round" />
                            <path d="M3 7H21C20.0681 7 19.6022 7 19.2346 7.15224C18.7446 7.35523 18.3552 7.74458 18.1522 8.23463C18 8.60218 18 9.06812 18 10V16C18 17.8856 18 18.8284 17.4142 19.4142C16.8284 20 15.8856 20 14 20H10C8.11438 20 7.17157 20 6.58579 19.4142C6 18.8284 6 17.8856 6 16V10C6 9.06812 6 8.60218 5.84776 8.23463C5.64477 7.74458 5.25542 7.35523 4.76537 7.15224C4.39782 7 3.93188 7 3 7Z" stroke="#75716B" strokeLinecap="round" />
                            <path d="M10.0681 3.37059C10.1821 3.26427 10.4332 3.17033 10.7825 3.10332C11.1318 3.03632 11.5597 3 12 3C12.4403 3 12.8682 3.03632 13.2175 3.10332C13.5668 3.17033 13.8179 3.26427 13.9319 3.37059" stroke="#75716B" strokeLinecap="round" />
                        </svg>
                        <button className="px-2 py-2 underline hover:text-red-500 transition" onClick={() => setConfirm(true)}>
                            Delete article
                        </button>
                    </div>
                )}

                {!isNew ? <div className="h-[20px]" /> : <div className="h-[120px]" />}


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
                            toast.success("Deleted.");
                            onDeleted();
                        } catch (e) {
                            toast.error(e.message);
                        }
                    }}
                />
            )}
        </>
    );
}