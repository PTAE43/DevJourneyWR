import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Message, useToaster } from "rsuite";

export default function AdminUsers() {
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);

    const [edit, setEdit] = useState(null); 
    const [reset, setReset] = useState(null); 
    const toaster = useToaster();

    async function fetchUsers() {
        setLoading(true);
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            const base = import.meta.env.VITE_SERVER_URL.replace(/\/+$/, "");
            const apiBase = base.endsWith("/api") ? base : `${base}/api`;
            const r = await fetch(`${apiBase}/admin/users?page=${page}&limit=20&q=${encodeURIComponent(q)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await r.json();
            if (!r.ok) throw new Error(json.error || "Load failed");
            setList(json.users || []);
        } catch (e) {
            toaster.push(<Message type="error" closable>{e.message}</Message>, { placement: "bottomCenter" });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchUsers(); }, [page]);

    const onSearch = (e) => { e.preventDefault(); setPage(1); fetchUsers(); };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Users management</h1>

            <form onSubmit={onSearch} className="flex gap-2 mb-4">
                <input
                    placeholder="Search by email / username / name"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="border px-3 py-2 rounded w-[360px]"
                />
                <button className="rounded bg-black text-white px-4" disabled={loading}>
                    {loading ? "Loading…" : "Search"}
                </button>
            </form>

            <div className="rounded-xl border bg-white overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th className="text-left p-3">Email</th>
                            <th className="text-left p-3">Username</th>
                            <th className="text-left p-3">Name</th>
                            <th className="text-left p-3">Role</th>
                            <th className="text-right p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map(u => (
                            <tr key={u.id} className="border-t">
                                <td className="p-3">{u.email || "—"}</td>
                                <td className="p-3">{u.username || "—"}</td>
                                <td className="p-3">{u.name || "—"}</td>
                                <td className="p-3">{u.role || "user"}</td>
                                <td className="p-3 text-right space-x-2">
                                    <button
                                        className="px-3 py-1 rounded border hover:bg-neutral-50"
                                        onClick={() => setEdit({ id: u.id, email: u.email || "", name: u.name || "", username: u.username || "", role: u.role || "user" })}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="px-3 py-1 rounded border hover:bg-neutral-50"
                                        onClick={() => setReset({ id: u.id, email: u.email || "" })}
                                    >
                                        Reset password
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {list.length === 0 && (
                            <tr><td colSpan={5} className="p-6 text-center text-gray-500">No users</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination (ง่าย ๆ) */}
            <div className="mt-4 flex justify-end gap-2">
                <button className="px-3 py-1 rounded border" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                <button className="px-3 py-1 rounded border" onClick={() => setPage(p => p + 1)}>Next</button>
            </div>

            {edit && <EditUserModal data={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); fetchUsers(); }} />}
            {reset && <ResetPwModal data={reset} onClose={() => setReset(null)} onDone={() => setReset(null)} />}
        </div>
    );
}

function EditUserModal({ data, onClose, onSaved }) {
    const [form, setForm] = useState({ ...data });
    const [loading, setLoading] = useState(false);
    const toaster = useToaster();

    const save = async () => {
        setLoading(true);
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            const base = import.meta.env.VITE_SERVER_URL.replace(/\/+$/, "");
            const apiBase = base.endsWith("/api") ? base : `${base}/api`;
            const r = await fetch(`${apiBase}/admin/users`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: form.id,
                    name: form.name,
                    username: form.username,
                    email: form.email,
                    role: form.role,
                }),
            });
            const json = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(json.error || "Update failed");
            toaster.push(<Message type="success" closable>Updated</Message>, { placement: "bottomCenter" });
            onSaved();
        } catch (e) {
            toaster.push(<Message type="error" closable>{e.message}</Message>, { placement: "bottomCenter" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
            <div className="bg-white rounded-xl p-5 w-[520px]">
                <h3 className="text-lg font-semibold mb-3">Edit user</h3>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm">Email</label>
                        <input className="w-full border rounded px-3 py-2" value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                    <div>
                        <label className="block text-sm">Username</label>
                        <input className="w-full border rounded px-3 py-2" value={form.username}
                            onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                    </div>
                    <div>
                        <label className="block text-sm">Name</label>
                        <input className="w-full border rounded px-3 py-2" value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div>
                        <label className="block text-sm">Role</label>
                        <select className="w-full border rounded px-3 py-2" value={form.role}
                            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                            <option value="superadmin">superadmin</option>
                        </select>
                    </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <button className="px-4 py-2 rounded border" onClick={onClose}>Cancel</button>
                    <button className="px-4 py-2 rounded bg-black text-white disabled:opacity-50" onClick={save} disabled={loading}>
                        {loading ? "Saving…" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ResetPwModal({ data, onClose, onDone }) {
    const [pw, setPw] = useState("");
    const [loading, setLoading] = useState(false);
    const toaster = useToaster();

    const submit = async () => {
        setLoading(true);
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            const base = import.meta.env.VITE_SERVER_URL.replace(/\/+$/, "");
            const apiBase = base.endsWith("/api") ? base : `${base}/api`;
            const r = await fetch(`${apiBase}/admin/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ userId: data.id, newPassword: pw }),
            });
            const json = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(json.error || "Reset failed");
            toaster.push(<Message type="success" closable>Password updated</Message>, { placement: "bottomCenter" });
            onDone();
        } catch (e) {
            toaster.push(<Message type="error" closable>{e.message}</Message>, { placement: "bottomCenter" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
            <div className="bg-white rounded-xl p-5 w-[440px]">
                <h3 className="text-lg font-semibold">Reset password</h3>
                <p className="text-sm text-gray-600 mb-3">User: {data.email || data.id}</p>
                <label className="block text-sm">New password</label>
                <input className="w-full border rounded px-3 py-2" value={pw} onChange={e => setPw(e.target.value)} placeholder="min 8 chars" />
                <div className="mt-5 flex justify-end gap-2">
                    <button className="px-4 py-2 rounded border" onClick={onClose}>Cancel</button>
                    <button className="px-4 py-2 rounded bg-black text-white disabled:opacity-50" onClick={submit} disabled={loading || pw.length < 8}>
                        {loading ? "Saving…" : "Set password"}
                    </button>
                </div>
            </div>
        </div>
    );
}
