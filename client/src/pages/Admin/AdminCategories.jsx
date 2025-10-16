import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Message, useToaster } from "rsuite";
import AdminTopBar from "@/components/Admin/AdminTopBar";
import CategoryList from "@/components/Admin/Category/List";
import CategoryEditor from "@/components/Admin/Category/Editor";
import ConfirmPopup from "@/components/Popup/ConfirmPopup";

export default function AdminCategories() {
    const [mode, setMode] = useState("list"); // "edit"
    const [editing, setEditing] = useState(null); // {id?, name}
    const [confirm, setConfirm] = useState(null); // {id, name}

    const [q, setQ] = useState("");
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const toaster = useToaster();

    const apiBase = (() => {
        const base = import.meta.env.VITE_SERVER_URL.replace(/\/+$/, "");
        return base.endsWith("/api") ? base : `${base}/api`;
    })();

    // โหลดหมวดหมู่
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch(`${apiBase}/categories`);
            const json = await r.json();
            let l = json.categories || [];
            const qq = q.trim().toLowerCase();
            if (qq) l = l.filter((c) => c.name.toLowerCase().includes(qq));
            setList(l);
        } finally {
            setLoading(false);
        }
    }, [apiBase, q]);

    useEffect(() => { load(); }, [load]);

    // บันทึก (สร้าง/แก้ไข)
    const save = async ({ id, name }) => {
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            const method = id ? "PUT" : "POST";
            const r = await fetch(`${apiBase}/categories`, {
                method,
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ id, name }),
            });
            const json = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(json.error || "Save failed");
            toaster.push(<Message type="success" closable>Saved</Message>, { placement: "bottomCenter" });
            setMode("list");
            setEditing(null);
            load();
        } catch (e) {
            toaster.push(<Message type="error" closable>{e.message}</Message>, { placement: "bottomCenter" });
        }
    };

    // ลบ
    const remove = async (id) => {
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            const r = await fetch(`${apiBase}/categories?id=${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(json.error || "Delete failed");
            toaster.push(<Message type="success" closable>Deleted</Message>, { placement: "bottomCenter" });
            setConfirm(null);
            if (mode !== "list") {
                setMode("list");
                setEditing(null);
            }
            load();
        } catch (e) {
            toaster.push(<Message type="error" closable>{e.message}</Message>, { placement: "bottomCenter" });
        }
    };

    if (mode === "edit") {
        return (
            <CategoryEditor
                initial={editing || { name: "" }}
                onBack={() => { setMode("list"); setEditing(null); }}
                onSave={save}
                onDelete={(id) => setConfirm({ id, name: editing?.name || "" })}
            />
        );
    }

    return (
        <>
            <AdminTopBar
                title="Category management"
                actions={[
                    {
                        label: "+ Create category",
                        onClick: () => { setEditing({ name: "" }); setMode("edit"); },
                        variant: "primary",
                    },
                ]}
            />

            <CategoryList
                items={list}
                onEdit={(c) => { setEditing({ id: c.id, name: c.name }); setMode("edit"); }}
                onDelete={(c) => setConfirm({ id: c.id, name: c.name })}
                searchValue={q}
                onSearchChange={setQ}
                onSearch={load}
                searching={loading}
                searchDelay={500}
                searchAutoOnMount={false}
            />

            {/* Popup ยืนยันการลบ */}
            {confirm && (
                <ConfirmPopup
                    title="Delete category"
                    description={
                        <div className="flex gap-2">
                            Do you want to delete
                            <span className=" font-medium text-red-500">{confirm.name || "this category"} ?</span>
                        </div>
                    }
                    confirmText="Delete"
                    onCancel={() => setConfirm(null)}
                    onConfirm={() => remove(confirm.id)}
                />
            )}
        </>
    );
}
