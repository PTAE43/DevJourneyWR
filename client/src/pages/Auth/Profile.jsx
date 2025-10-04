import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient.js";
import { api } from "@/lib/api.js";
import { uploadAvatar, removeAvatar } from "@/lib/avatars.js";
import { toaster, Message } from "rsuite";
import { User, Key } from "lucide-react";
import { NavLink } from "react-router-dom";

const USERNAME_RE = /^[A-Za-z0-9._-]{5,25}$/;

export default function ProfilePage() {
    const [me, setMe] = useState(null); // table users supabase
    const [form, setForm] = useState({ name: "", username: "" });
    const [avatarUrl, setAvatarUrl] = useState(""); // preview url
    const [avatarPath, setAvatarPath] = useState(""); // supabase storage
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            const { data } = await api.get("/profile");
            const u = data?.user || {};
            setMe(u);
            setForm({ name: u.name || "", username: u.username || "" });
            setAvatarUrl(u.profile_pic || "");
            setAvatarPath(storagePathFromUrl(u.profile_pic)); // ถ้าใส่ path ไว้ใน url
        })();
    }, []);

    function storagePathFromUrl(url) {
        if (!url) return "";
        // รูปที่ public
        const i = url.indexOf("/avatars/");
        return i !== -1 ? url.slice(i + "/avatars/".length) : "";
    }

    const nameErr = useMemo(() => (form.name.trim() ? "" : "Name is required"), [form.name]);
    const usernameErr = useMemo(() => {
        if (!form.username.trim()) return "Username is required";
        if (!USERNAME_RE.test(form.username)) return "5–25 อักษร A-Z a-z 0-9 ._-*";
        return "";

    }, [form.username]);

    async function onPickFile(e) {
        const file = e.target.files?.[0];
        if (!file || !me?.id) return;

        setLoading(true);
        try {

            const { publicUrl, path } = await uploadAvatar(file, me.id); // อัปโหลดใหม่
            if (avatarPath) await removeAvatar(avatarPath); // ลบไฟล์เดิม
            setAvatarUrl(publicUrl);
            setAvatarPath(path);

        } catch (err) {
            toaster.push(<Message type="error">{err.message}</Message>, { placement: "bottomEnd" });

        } finally {
            setLoading(false);
        }
    }

    async function onSave() {
        if (nameErr || usernameErr) {
            toaster.push(<Message type="warning">กรุณากรอกข้อมูลให้ถูกต้อง</Message>, { placement: "bottomEnd" });
            return;
        }
        setLoading(true);
        try {
            await api.put("/profile", {
                name: form.name.trim(),
                username: form.username.trim(),
                profile_pic: avatarUrl || null,
            });

            toaster.push(<Message type="success">
                Saved profile<br />
                <span>Your profile has been successfully updated</span>
            </Message>, { placement: "bottomEnd" });

        } catch (err) {
            const msg = err?.response?.data?.error || err.message;
            toaster.push(<Message type="error">{msg}</Message>, { placement: "bottomEnd" });
        } finally {
            setLoading(false);
        }
    }

    if (!me) return null;

    return (
        <div className="mx-auto max-w-[900px] p-6">
            <div className="rounded-2xl bg-[#F4F3F1] p-6">
                <div className="flex items-center gap-6">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="avatar"
                            className="h-[88px] w-[88px] rounded-full object-cover ring-1 ring-black/10"
                        />
                    ) : (
                        <div className="h-[88px] w-[88px] rounded-full bg-neutral-200
                    grid place-items-center ring-1 ring-black/10">
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
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                        {!!nameErr && <p className="mt-1 text-xs text-red-500">{nameErr}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm">Username</label>
                        <input
                            className={`w-full rounded-md border px-3 py-2 ${usernameErr ? "border-red-400" : ""}`}
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                        />
                        {!!usernameErr && <p className="mt-1 text-xs text-red-500">{usernameErr}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm">Email</label>
                        <input className="w-full rounded-md border px-3 py-2 bg-gray-100" value={me.email || ""} disabled />
                    </div>

                    <div className="pt-2">
                        <button
                            disabled={loading}
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
