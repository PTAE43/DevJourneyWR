import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api.js";
import { uploadAvatar, removeAvatar } from "@/lib/avatars.js";
import { useToaster, Message, Loader } from "rsuite";
import { User } from "lucide-react";

const USERNAME_RE = /^[A-Za-z0-9._-]{5,25}$/;

export default function ProfilePage() {
    const [me, setMe] = useState(null);                         // ข้อมูล users จาก supabase
    const [form, setForm] = useState({ name: "", username: "" });
    const [avatarUrl, setAvatarUrl] = useState("");             // preview url
    const [loading, setLoading] = useState(false);              // สถานะระหว่าง save

    const [originalAvatarUrl, setOriginalAvatarUrl] = useState("");
    const [originalAvatarPath, setOriginalAvatarPath] = useState("");
    const [newAvatar, setNewAvatar] = useState(null);           // ข้อมูลไฟล์ใหม่ (รอ save)

    const [touched, setTouched] = useState({ name: false, username: false });

    const toaster = useToaster();

    // โหลดโปรไฟล์ครั้งแรก
    useEffect(() => {
        (async () => {
            const { data } = await api.get("/profile");
            const u = data?.user || {};
            setMe(u);
            setForm({ name: u.name || "", username: u.username || "" });
            setAvatarUrl(u.profile_pic || "");
            setOriginalAvatarUrl(u.profile_pic || "");
            setOriginalAvatarPath(storagePathFromUrl(u.profile_pic));
        })();
    }, []);

    // แปลง URL public >storage path (สำหรับลบไฟล์เก่า)
    function storagePathFromUrl(url) {
        if (!url) return "";
        const i = url.indexOf("/avatars/");
        return i !== -1 ? url.slice(i + "/avatars/".length) : "";
    }

    // validate
    const nameErr = useMemo(
        () => (!touched.name ? "" : form.name.trim() ? "" : "Name is required"),
        [form.name, touched.name]
    );

    const usernameErr = useMemo(() => {
        if (!touched.username) return "";
        if (!form.username.trim()) return "Username is required";
        if (!USERNAME_RE.test(form.username)) return "5–25 A-Z a-z 0-9 . _ -";
        return "";
    }, [form.username, touched.username]);

    // อัปโหลดรูป (แค่พรีวิว + เก็บสถานะไว้ก่อน)
    async function onPickFile(e) {
        const file = e.target.files?.[0];
        if (!file || !me?.id) return;

        // ขึ้น toast “Uploading…”
        const toastId = toaster.push(
            <Message type="info" closable>
                <div className="flex items-center gap-2">
                    <Loader /> Uploading photo…
                </div>
            </Message>,
            { placement: "bottomCenter", duration: 0 }
        );

        try {
            const up = await uploadAvatar(file, me.id);
            setAvatarUrl(up.publicUrl);
            setNewAvatar(up);
        } catch (err) {
            toaster.push(<Message type="error" closable>{err.message}</Message>, { placement: "bottomCenter" });
        } finally {
            toaster.remove(toastId);
        }
    }

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
            toaster.push(<Message type="warning">กรุณากรอกข้อมูลให้ถูกต้อง</Message>, { placement: "bottomCenter" });
            return;
        }
        setLoading(true);
        try {
            const nextAvatarUrl = newAvatar?.publicUrl || originalAvatarUrl;

            await api.put("/profile", {
                name: form.name.trim(),
                username: form.username.trim(),
                profile_pic: nextAvatarUrl || null,
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

            toaster.push(
                <Message type="success" closable>
                    Saved profile<br />
                    <span>Your profile has been successfully updated</span>
                </Message>,
                { placement: "bottomCenter" }
            );
        } catch (err) {
            const msg = err?.response?.data?.error || err.message;
            toaster.push(<Message type="error" closable>{msg}</Message>, { placement: "bottomCenter" });
        } finally {
            setLoading(false);
        }
    }

    if (!me) return null;

    return (
        <div className="mx-auto max-w-[550px]">
            <div className="rounded-2xl bg-[#F4F3F1] p-6">
                <div className="flex items-center gap-6">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="avatar"
                            className="h-[88px] w-[88px] rounded-full object-cover ring-1 ring-black/10"
                        />
                    ) : (
                        <div className="h-[88px] w-[88px] rounded-full bg-neutral-200 grid place-items-center ring-1 ring-black/10">
                            <User className="h-8 w-8 text-neutral-500" />
                        </div>
                    )}

                    <label className="inline-flex items-center rounded-full border px-5 py-2 cursor-pointer">
                        <input type="file" accept="image/*" onChange={onPickFile} className="hidden" />
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
