import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Message, useToaster } from "rsuite";
import AdminTopBar from "@/components/Admin/AdminTopBar";
import { Variable } from "lucide-react";

export default function AdminCategories() {
    const [q, setQ] = useState("");
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [edit, setEdit] = useState(null);   // {id?, name}
    const [confirm, setConfirm] = useState(null); // id
    const toaster = useToaster();

    const apiBase = (() => {
        const base = import.meta.env.VITE_SERVER_URL.replace(/\/+$/, "");
        return base.endsWith("/api") ? base : `${base}/api`;
    })();

    const load = async () => {
        setLoading(true);
        try {
            const r = await fetch(`${apiBase}/categories`);
            const json = await r.json();
            let l = json.categories || [];
            const qq = q.trim().toLowerCase();
            if (qq) l = l.filter(c => c.name.toLowerCase().includes(qq));
            setList(l);
        } finally { setLoading(false); }
    };
    useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
    const onSearch = (e) => { e.preventDefault(); load(); };

    const save = async () => {
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            const method = edit?.id ? "PUT" : "POST";
            const r = await fetch(`${apiBase}/categories`, {
                method,
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ id: edit?.id, name: edit?.name }),
            });
            const json = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(json.error || "Save failed");
            toaster.push(<Message type="success" closable>Saved</Message>, { placement: "bottomCenter" });
            setEdit(null);
            load();
        } catch (e) {
            toaster.push(<Message type="error" closable>{e.message}</Message>, { placement: "bottomCenter" });
        }
    };

    const remove = async () => {
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            const r = await fetch(`${apiBase}/categories?id=${confirm}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(json.error || "Delete failed");
            toaster.push(<Message type="success" closable>Deleted</Message>, { placement: "bottomCenter" });
            setConfirm(null);
            load();
        } catch (e) {
            toaster.push(<Message type="error" closable>{e.message}</Message>, { placement: "bottomCenter" });
        }
    };

    return (
        <>
            <AdminTopBar
                title="Category manegements"
                actions={[
                    { label: "+ Create category", onClick: () => setEdit({ name: "" }), variant: "primary" },
                ]}
            />

            <form onSubmit={onSearch} className="mb-3">
                <input className="border rounded px-3 py-2 w-[320px]" placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
                <button className="ml-2 rounded bg-black text-white px-4">{loading ? "…" : "Search"}</button>
            </form>

            <div className="rounded-xl border overflow-hidden bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th className="text-left p-3">Category</th>
                            <th className="text-right p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map(c => (
                            <tr key={c.id} className="border-t">
                                <td className="p-3">{c.name}</td>
                                <td className="p-3 text-right space-x-2">
                                    <button className="px-3 py-1 rounded border hover:bg-neutral-50" onClick={() => setEdit({ id: c.id, name: c.name })}>Edit</button>
                                    <button className="px-3 py-1 rounded border hover:bg-neutral-50" onClick={() => setConfirm(c.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {list.length === 0 && (
                            <tr><td colSpan={2} className="p-6 text-center text-gray-500">No categories</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {edit && (
                <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
                    <div className="bg-white rounded-xl p-6 w-[420px]">
                        <h3 className="text-lg font-semibold mb-3">{edit.id ? "Edit category" : "Create category"}</h3>
                        <label className="block text-sm mb-1">Name</label>
                        <input className="w-full border rounded px-3 py-2" value={edit.name} onChange={e => setEdit(s => ({ ...s, name: e.target.value }))} />
                        <div className="mt-5 flex justify-end gap-2">
                            <button className="px-4 py-2 rounded border" onClick={() => setEdit(null)}>Cancel</button>
                            <button className="px-4 py-2 rounded bg-neutral-900 text-white disabled:opacity-50" disabled={!edit.name.trim()} onClick={save}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirm && (
                <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
                    <div className="bg-white rounded-xl p-6 w-[360px]">
                        <h3 className="text-lg font-semibold mb-2">Delete category</h3>
                        <p className="text-sm text-gray-600 mb-4">Do you want to delete this category?</p>
                        <div className="flex justify-end gap-2">
                            <button className="px-4 py-2 rounded border" onClick={() => setConfirm(null)}>Cancel</button>
                            <button className="px-4 py-2 rounded bg-neutral-900 text-white" onClick={remove}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
