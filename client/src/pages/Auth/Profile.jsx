import { useEffect, useMemo, useState, useRef } from "react";
import { api } from "@/lib/api.js";
import { uploadAvatar, removeAvatar } from "@/lib/avatars.js";
import default_avatar from "@/assets/images/profile/default-avatar.png";
import toast from "@/lib/toast";
import { User } from "lucide-react";

// ให้ตรงกับฝั่ง server (3–24 ตัว, a–z, 0–9, . _ -)
const USERNAME_RE = /^[A-Za-z0-9._-]{3,24}$/;

export default function ProfilePage() {
    const [me, setMe] = useState(null);
    const [form, setForm] = useState({ name: "", username: "" });
    const [loading, setLoading] = useState(false);

    const [originalAvatarUrl, setOriginalAvatarUrl] = useState("");
    const [originalAvatarPath, setOriginalAvatarPath] = useState("");
    const [newAvatar, setNewAvatar] = useState(null);

    const [touched, setTouched] = useState({ name: false, username: false });

    const fileRef = useRef(null);
    const LOADING_SLOT = "adminProfile:upload";
    useEffect(() => () => toast.flushSlot(LOADING_SLOT), []);

    useEffect(() => {
        (async () => {
            try {
                const r = await api.get("/profile");
                const u = r?.user || {};
                setMe(u);
                setForm({
                    name: u.name || "",
                    username: u.username || "",
                    email: u.email || "",
                    bio: u.bio || "",
                    profile_pic: u.profile_pic || "",
                });
                setOriginalAvatarUrl(u.profile_pic || "");
                setOriginalAvatarPath(storagePathFromUrl(u.profile_pic || ""));
            } catch {
                toast.error("Load profile failed");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // แปลง URL public > storage path (สำหรับลบไฟล์เก่า)
    function storagePathFromUrl(url) {
        if (!url) return "";
        const i = String(url).indexOf("/avatars/");
        return i !== -1 ? String(url).slice(i + "/avatars/".length) : "";
    }

    // validate
    const nameErr = useMemo(
        () => (!touched.name ? "" : form.name.trim() ? "" : "Name is required"),
        [form.name, touched.name]
    );

    const usernameErr = useMemo(() => {
        if (!touched.username) return "";
        if (!form.username.trim()) return "Username is required";
        if (!USERNAME_RE.test(form.username)) return "3–24 A-Z a-z 0-9 . _ -";
        return "";
    }, [form.username, touched.username]);

    const onPickFile = async (file) => {
        if (!file || !me?.id) return;

        // validation เบา ๆ
        if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
            toast.error("Please use file type: JPG/PNG/WEBP.");
            if (fileRef.current) fileRef.current.value = "";
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size is limited to 2MB.");
            if (fileRef.current) fileRef.current.value = "";
            return;
        }

        toast.loadingIn(LOADING_SLOT, "Uploading photo…");

        try {
            const up = await uploadAvatar(file, me.id); // { publicUrl, path }
            setNewAvatar(up);
            setForm((s) => ({ ...s, profile_pic: up.publicUrl })); // ดูภาพได้เลย
            await toast.replaceIn(LOADING_SLOT, "success", "Image upload completed.");
        } catch (err) {
            await toast.replaceIn(LOADING_SLOT, "error", "Upload failed", String(err?.message || "Please try again."));
        } finally {
            if (fileRef.current) fileRef.current.value = ""; // รีเซ็ต input
        }
    };

    // เช็คว่ามีการแก้ไขอะไรไหม
    const somethingChanged = useMemo(
        () =>
            form.name.trim() !== (me?.name || "") ||
            form.username.trim() !== (me?.username || "") ||
            !!newAvatar,
        [form, me, newAvatar]
    );

    // บันทึกโปรไฟล์
    async function onSave() {
        if (nameErr || usernameErr) {
            toast.warning("Please enter correct information.");
            return;
        }
        setLoading(true);
        try {
            const nextAvatarUrl = newAvatar?.publicUrl || originalAvatarUrl;

            // ต้องส่งใน key "body"
            await api.put("/profile", {
                body: {
                    name: form.name.trim(),
                    username: form.username.trim(),
                    profile_pic: nextAvatarUrl || null,
                },
            });

            // ถ้ามีรูปใหม่ > ค่อยลบไฟล์เก่า
            if (newAvatar && originalAvatarPath && originalAvatarPath !== newAvatar.path) {
                await removeAvatar(originalAvatarPath).catch(() => { });
            }

            // sync state
            setOriginalAvatarUrl(nextAvatarUrl);
            setOriginalAvatarPath(storagePathFromUrl(nextAvatarUrl));
            setNewAvatar(null);
            setMe((m) => ({
                ...m,
                name: form.name.trim(),
                username: form.username.trim(),
                profile_pic: nextAvatarUrl,
            }));

            toast.success("Saved profile.", "Your profile has been successfully updated.");
        } catch (err) {
            toast.error(String(err?.message || "Save failed."));
        } finally {
            setLoading(false);
        }
    }

    if (!me) return null;

    return (
        <div className="mx-auto max-w-[550px]">
            <div className="rounded-2xl bg-[#F4F3F1] p-6">
                <div className="flex items-center gap-6">
                    {form ? (
                        <img
                            src={form.profile_pic || default_avatar}
                            alt="avatar"
                            className="h-[88px] w-[88px] rounded-full object-cover ring-1 ring-black/10"
                        />
                    ) : (
                        <div className="h-[88px] w-[88px] rounded-full bg-neutral-200 grid place-items-center ring-1 ring-black/10">
                            <User className="h-8 w-8 text-neutral-500" />
                        </div>
                    )}

                    <label className="inline-flex items-center rounded-full border px-5 py-2 cursor-pointer">
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                            className="hidden" />
                        Upload profile picture
                    </label>
                </div>

                <div className="mt-8 space-y-5">
                    <div>
                        <label className="mb-1 block text-sm">Name</label>
                        <input
                            className={`w-full rounded-md border px-3 py-2 ${nameErr ? "border-red-400" : ""}`}
                            value={form.name}
                            onChange={(e) => {
                                setForm({ ...form, name: e.target.value });
                                if (!touched.name) setTouched((t) => ({ ...t, name: true }));
                            }}
                        />
                        {!!nameErr && <p className="mt-1 text-xs text-red-500">{nameErr}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm">Username</label>
                        <input
                            className={`w-full rounded-md border px-3 py-2 ${usernameErr ? "border-red-400" : ""}`}
                            value={form.username}
                            onChange={(e) => {
                                setForm({ ...form, username: e.target.value });
                                if (!touched.username) setTouched((t) => ({ ...t, username: true }));
                            }}
                        />
                        {!!usernameErr && <p className="mt-1 text-xs text-red-500">{usernameErr}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm">Email</label>
                        <input
                            className="w-full rounded-md border px-3 py-2 bg-gray-100 cursor-no-drop"
                            value={me.email || ""}
                            disabled
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            disabled={loading || !somethingChanged || !!nameErr || !!usernameErr}
                            onClick={onSave}
                            className="rounded-full bg-neutral-900 px-6 py-2 text-white disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
