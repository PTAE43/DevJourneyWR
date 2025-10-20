import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { uploadAvatar, removeAvatar } from "@/lib/avatars";
import default_avatar from "@/assets/images/profile/default-avatar.png";
import AdminTopBar from "@/components/Admin/AdminTopBar";
import { useToaster } from "rsuite";
import AppToast from "@/components/Toast/AppToast";

/** สำหรับลบไฟล์เก่าใน bucket 'avatars' */
function storagePathFromUrl(url) {
    if (!url) return "";
    const i = String(url).indexOf("/avatars/");
    return i !== -1 ? String(url).slice(i + "/avatars/".length) : "";
}

export default function AdminProfile() {
    const [me, setMe] = useState(null); // เก็บข้อมูลผู้ใช้ดิบ
    const [form, setForm] = useState({
        name: "",
        username: "",
        email: "",
        bio: "",
        profile_pic: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // ยังไม่ลบของเก่าจนกว่าจะกด Save
    const [originalAvatarUrl, setOriginalAvatarUrl] = useState("");
    const [originalAvatarPath, setOriginalAvatarPath] = useState("");
    const [newAvatar, setNewAvatar] = useState(null); // { publicUrl, path }

    const fileRef = useRef(null);

    const rsToaster = useToaster();
    const toast = {
        success: (title, description, opts) =>
            rsToaster.push(<AppToast status="success" title={title} description={description} />, { placement: "bottomCenter", duration: 4000, ...(opts || {}) }),
        error: (title, description, opts) =>
            rsToaster.push(<AppToast status="error" title={title} description={description} />, { placement: "bottomCenter", duration: 4000, ...(opts || {}) }),
        info: (title, description, opts) =>
            rsToaster.push(<AppToast status="info" title={title} description={description} />, { placement: "bottomCenter", duration: 4000, ...(opts || {}) }),
        warning: (title, description, opts) =>
            rsToaster.push(<AppToast status="warning" title={title} description={description} />, { placement: "bottomCenter", duration: 4000, ...(opts || {}) }),
        remove: (key) => rsToaster.remove(key),
    };

    // โหลดโปรไฟล์ครั้งแรก
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const r = await api.get("/profile");
                const u = r?.user || {};
                if (!alive) return;
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
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    // อัปโหลด: พรีวิวเลย แต่ยังไม่ลบของเก่า จนกว่าจะ Save
    const onPickFile = async (file) => {
        if (!file || !me?.id) return;

        // validation เบา ๆ
        if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
            toast.error("กรุณาใช้ประเภทไฟล์: JPG/PNG/WEBP");
            // reset input เพื่อให้เลือกไฟล์เดิมได้อีกครั้ง
            if (fileRef.current) fileRef.current.value = "";
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error("ขนาดไฟล์ต้องไม่เกิน: 2MB");
            if (fileRef.current) fileRef.current.value = "";
            return;
        }

        // toast loading (sticky)
        const key = toast.info("Uploading photo…", undefined, { duration: 0 });

        try {
            const up = await uploadAvatar(file, me.id); // { publicUrl, path }
            setNewAvatar(up);
            setForm((s) => ({ ...s, profile_pic: up.publicUrl })); // ดูภาพได้เลย
            toast.remove(key);
            toast.success("Uploaded");
        } catch (err) {
            toast.remove(key);
            toast.error(String(err?.message || "Upload failed"));
        } finally {
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    // กด Save > อัปเดตข้อมูล + ถ้ามีรูปใหม่ค่อยลบไฟล์เก่า
    const save = async () => {
        setSaving(true);
        try {
            const nextAvatarUrl = newAvatar?.publicUrl || originalAvatarUrl;

            await api.put("/profile", {
                body: {
                    name: form.name,
                    username: form.username,
                    bio: form.bio,
                    profile_pic: nextAvatarUrl || null,
                },
            });

            // ถ้ามีรูปใหม่ และไฟล์เก่าคนละ path > ลบทิ้ง
            if (newAvatar && originalAvatarPath && originalAvatarPath !== newAvatar.path) {
                await removeAvatar(originalAvatarPath).catch(() => { });
            }

            // sync state
            setOriginalAvatarUrl(nextAvatarUrl);
            setOriginalAvatarPath(storagePathFromUrl(nextAvatarUrl || ""));
            setNewAvatar(null);

            toast.success("Saved profile", "Your profile has been successfully updated");
        } catch {
            toast.error("Save failed");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-xl pl-16 mt-8">Loading…</div>;

    return (
        <>
            <AdminTopBar
                title="Profile"
                actions={[
                    {
                        label: saving ? "Saving…" : "Save",
                        onClick: save,
                        variant: "primary",
                        loading: saving,
                        disabled: saving,
                    },
                ]}
            />

            <div className="mt-10 px-12 grid gap-4 max-w-2xl">
                <div className="flex items-center gap-8">
                    <img
                        src={form.profile_pic || default_avatar}
                        className="w-[120px] h-[120px] rounded-full object-cover ring-1 ring-black/10"
                    />
                    <div className="space-x-2">
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                        />
                        <button
                            className="rounded-full bg-white hover:bg-white/10 border border-black/40 px-8 py-2"
                            onClick={() => fileRef.current?.click()}
                        >
                            Upload profile picture
                        </button>
                    </div>
                </div>

                <div className="h-px bg-neutral-200 my-4" />

                <Field label="Name">
                    <input
                        className="w-full rounded-md border px-3 py-2"
                        value={form.name}
                        onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    />
                </Field>

                <Field label="Username">
                    <input
                        className="w-full rounded-md border px-3 py-2"
                        value={form.username}
                        onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
                    />
                </Field>

                <Field label="Email">
                    <input
                        className="w-full rounded-md border px-3 py-2 bg-gray-100 cursor-not-allowed"
                        value={form.email}
                        disabled
                    />
                </Field>
            </div>

            <div className="mt-10 px-12 grid gap-4 w-full">
                <Field label="Bio (max 120 letters)">
                    <textarea
                        rows={4}
                        className="w-full rounded-md border px-3 py-2"
                        value={form.bio}
                        onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))}
                    />
                </Field>
            </div>
        </>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="mb-1 block text-sm">{label}</label>
            {children}
        </div>
    );
}
