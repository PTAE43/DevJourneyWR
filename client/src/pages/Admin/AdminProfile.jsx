import { useEffect, useState } from "react";
import { Message, useToaster } from "rsuite";
import { api } from "@/lib/api";

export default function AdminProfile() {
    const [form, setForm] = useState({ name: "", username: "", email: "", bio: "", profile_pic: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const toaster = useToaster();

    useEffect(() => {
        (async () => {
            try {
                const r = await api.get("/profile");
                const u = r?.user || {};
                setForm({
                    name: u.name || "",
                    username: u.username || "",
                    email: u.email || "",
                    bio: u.bio || "",
                    profile_pic: u.profile_pic || "",
                });
            } catch (e) {
                toaster.push(<Message type="error" closable>Load profile failed</Message>, { placement: "bottomCenter" });
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            await api.put("/profile", { body: form });
            toaster.push(<Message type="success" closable>Saved profile</Message>, { placement: "bottomCenter" });
        } catch (e) {
            toaster.push(<Message type="error" closable>Save failed</Message>, { placement: "bottomCenter" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-xl pl-16 mt-8">Loading…</div>;

    return (
        <div className="rounded-2xl bg-[var(--color-bg-layout)]">
            <div className="border-b-2">
                <div className="flex justify-between items-center p-6 mx-10">
                    <h2 className="text-xl font-semibold">Profile</h2>
                    <button
                        onClick={save}
                        disabled={saving}
                        className="rounded-full bg-neutral-900 text-white px-5 py-2 disabled:opacity-50"
                    >
                        {saving ? "Saving…" : "Save"}
                    </button>
                </div>
            </div>


            <div className="mt-10 px-12 grid gap-4 max-w-2xl">
                <div className="flex items-center gap-8">
                    <img
                        src={form.profile_pic || "/src/assets/images/profile/default-avatar.png"}
                        className="w-[120px] h-[120px] rounded-full object-cover ring-1 ring-black/10"
                    />
                    {/* ปุ่มอัปโหลด (mock) */}
                    <button
                        className="rounded-full bg-white hover:bg-white/10 border px-8 py-2"
                        onClick={() => toaster.push(<Message type="info">Upload coming soon</Message>, { placement: "bottomCenter" })}
                    >
                        Upload profile picture
                    </button>
                </div>

                <div className="h-px bg-neutral-200 my-2" />

                <Field label="Name">
                    <input className="w-full rounded-md border px-3 py-2" value={form.name}
                        onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
                </Field>

                <Field label="Username">
                    <input className="w-full rounded-md border px-3 py-2" value={form.username}
                        onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))} />
                </Field>

                <Field label="Email">
                    <input className="w-full rounded-md border px-3 py-2" value={form.email}
                        onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
                </Field>

                <Field label="Bio (max 120 letters)">
                    <textarea
                        rows={4}
                        className="w-full rounded-md border px-3 py-2"
                        value={form.bio}
                        onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))}
                    />
                </Field>
            </div>
        </div>
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
