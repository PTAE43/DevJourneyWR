import { useEffect, useState, useMemo } from "react";
import AdminTopBar from "@/components/Admin/AdminTopBar";
import toast from "@/lib/toast";

export default function CategoryEditor({ initial, onBack, onSave, onDelete }) {
    const isNew = !initial?.id;
    const [name, setName] = useState(initial?.name || "");
    const [saving, setSaving] = useState(false);
    // const [confirm, setConfirm] = useState(false);
    // const [deleting, setDeleting] = useState(false);

    const isGeneral = useMemo(() => {
        const n = (initial?.name || "").trim().toLowerCase();
        return n === "general";
    }, [initial?.name])

    useEffect(() => {
        setName(initial?.name || "");
    }, [initial?.id, initial?.name]);

    const save = async () => {
        if (!name.trim()) return;
        try {
            setSaving(true);
            await onSave({ id: initial?.id, name: name.trim() });
            // toast.success("Saved.", "Category has been saved.");
            onBack?.();
        } catch (e) {
            toast.error(String(e.message));
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <AdminTopBar
                title={isNew ? "Create category" : "Edit category"}
                actions={[
                    { label: "< Back", onClick: onBack, variant: "outline" },
                    { label: "Save", onClick: save, variant: "primary", disabled: saving },
                ]}
            />

            <div className="mx-14 mt-8 max-w-xl">
                <label className="block text-sm mb-1">Name</label>
                <input
                    className="w-full border rounded-lg px-3 py-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Category name"
                />

                {/* {!isNew && (
                    <div className="mt-6 flex items-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M10 15L10 12" stroke="#75716B" strokeLinecap="round" />
                            <path d="M14 15L14 12" stroke="#75716B" strokeLinecap="round" />
                            <path
                                d="M3 7H21C20.0681 7 19.6022 7 19.2346 7.15224C18.7446 7.35523 18.3552 7.74458 18.1522 8.23463C18 8.60218 18 9.06812 18 10V16C18 17.8856 18 18.8284 17.4142 19.4142C16.8284 20 15.8856 20 14 20H10C8.11438 20 7.17157 20 6.58579 19.4142C6 18.8284 6 17.8856 6 16V10C6 9.06812 6 8.60218 5.84776 8.23463C5.64477 7.74458 5.25542 7.35523 4.76537 7.15224C4.39782 7 3.93188 7 3 7Z"
                                stroke="#75716B"
                                strokeLinecap="round"
                            />
                            <path
                                d="M10.0681 3.37059C10.1821 3.26427 10.4332 3.17033 10.7825 3.10332C11.1318 3.03632 11.5597 3 12 3C12.4403 3 12.8682 3.03632 13.2175 3.10332C13.5668 3.17033 13.8179 3.26427 13.9319 3.37059"
                                stroke="#75716B"
                                strokeLinecap="round"
                            />
                        </svg>
                        <button
                            className="px-2 py-2 underline hover:text-red-500  transition"
                            onClick={() => setConfirm(true)}
                            disabled={saving || isGeneral}
                            title={isGeneral ? "General cannot be deleted." : undefined}
                        >
                            Delete category
                        </button>
                    </div>
                )} */}
            </div>

            {/* {confirm && (
                <ConfirmPopup
                    title="Delete category"
                    description="Do you want to delete this category?"
                    confirmText="Delete"
                    loading={deleting}
                    onCancel={() => !deleting && setConfirm(false)}
                    onConfirm={async () => {
                        if (deleting) return;
                        setDeleting(true);
                        const key = toast.loading("Deleting category…");
                        try {
                            // ย้ายบทความทั้งหมดของหมวดนี้ไป General บน backend แล้วค่อยลบ
                            await onDelete?.(initial.id);
                            toast.success(key, "Deleted.", "Category has been deleted.");
                            setConfirm(false);
                            onBack?.(); // กลับไป list โดยไม่พา popup ไปด้วย
                        } catch (e) {
                            toast.error(key, e);
                        } finally {
                            setDeleting(false);
                        }
                    }}
                />
            )} */}
        </>
    );
}
