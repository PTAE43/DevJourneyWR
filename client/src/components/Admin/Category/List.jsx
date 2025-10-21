import { useEffect, useRef, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import ConfirmPopup from "@/components/Popup/ConfirmPopup";
import toast from "@/lib/toast";

export default function CategoryList({
    items = [],
    onEdit,
    // onDelete ไม่ใช้แล้ว (ลบเองใน list)
    emptyText = "",
    striped = true,
    searchValue = "",
    onSearchChange,
    onSearch,
    searching = false,
    searchPlaceholder = "Search…",
    searchDelay = 400,
    searchAutoOnMount = false,
}) {
    const showSearch =
        typeof onSearchChange === "function" || typeof onSearch === "function";

    // ใช้ ref เก็บฟังก์ชันล่าสุด กันโหลดซ้ำๆ
    const onSearchRef = useRef(onSearch);
    useEffect(() => { onSearchRef.current = onSearch; }, [onSearch]);

    const first = useRef(true);
    useEffect(() => {
        if (!onSearchRef.current) return;
        if (first.current) {
            first.current = false;
            if (!searchAutoOnMount) return;
        }
        const t = setTimeout(() => {
            onSearchRef.current && onSearchRef.current();
        }, Math.max(0, searchDelay));
        return () => clearTimeout(t);
    }, [searchValue, searchDelay, searchAutoOnMount]);

    // ====== ย้าย popup/ลบ มาไว้ที่นี่ ======
    const [confirm, setConfirm] = useState(null); // {id, name}
    const [deleting, setDeleting] = useState(false);

    const generalId = useMemo(() => {
        const g = (items || []).find(
            (c) => (c.name || "").trim().toLowerCase() === "general"
        );
        return g?.id || null;
    }, [items]);

    const requestDelete = async (id) => {
        if (!id) return;
        if (!generalId) {
            toast.error('Category "General" not found');
            return;
        }
        setDeleting(true);
        const key = toast.loading("Deleting category…");
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            const base = import.meta.env.VITE_SERVER_URL.replace(/\/+$/, "");
            const apiBase = base.endsWith("/api") ? base : `${base}/api`;

            // บอก backend ให้ reassign โพสต์ทั้งหมดไป general แล้วค่อยลบ
            const r = await fetch(`${apiBase}/categories?id=${id}&reassignToId=${generalId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(json.error || "Delete failed");

            toast.settleSuccess(key, "Deleted.", "Category has been deleted.");
            setConfirm(null);

            // refresh รายการ
            onSearchRef.current && onSearchRef.current();
        } catch (e) {
            toast.settleError(key, e);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="mt-8 mx-14 text-base font-medium">
            {showSearch && (
                <div className="flex justify-start items-center gap-2 mb-4">
                    <div className="relative flex">
                        <input
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            className="border rounded-lg px-9 py-2 w-[360px]"
                        />
                    </div>
                    <div className="absolute pl-2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="11" cy="11" r="6" stroke="#75716B" />
                            <path d="M20 20L17 17" stroke="#75716B" strokeLinecap="round" />
                        </svg>
                    </div>
                    {searching && (
                        <div className="ml-1 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    )}
                </div>
            )}

            <div className="rounded-lg border overflow-hidden bg-white">
                <table className="w-full text-sm">
                    <colgroup>
                        <col />
                        <col style={{ width: 120 }} />
                    </colgroup>
                    <thead className="h-[48px] bg-[#f9f8f6] text-gray-400
                            top-0 z-10 relative after:absolute after:left-0 after:-bottom-px
                            shadow-[0_6px_12px_-6px_rgba(0,0,0,0.1)]">
                        <tr>
                            <th className="text-left font-medium p-3 pl-5">Category</th>
                            <th className="text-left font-medium p-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((c, i) => {
                            const isGeneral = (c.name || "").trim().toLowerCase() === "general";
                            return (
                                <tr key={c.id} className={`h-[64px] odd:bg-[#f9f8f6] even:bg-[#efeeeb] border-t ${striped && i % 2 === 1 ? "bg-[#FAF9F7]" : ""}`}>
                                    <td className="p-3 truncate pl-5">{c.name}</td>
                                    <td>
                                        <div className="flex justify-center items-center">
                                            <button className="px-3" onClick={() => onEdit?.(c)}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="stroke-gray-500 hover:stroke-green-500 transition">
                                                    <path d="M15 5.91406C15.3604 5.91406 15.6531 6.066 15.916 6.2666C16.1673 6.45837 16.4444 6.73733 16.7676 7.06055L16.9395 7.23242C17.2627 7.55564 17.5416 7.83268 17.7334 8.08398C17.934 8.3469 18.0859 8.63961 18.0859 9C18.0859 9.36038 17.934 9.6531 17.7334 9.91602C17.5416 10.1673 17.2627 10.4444 16.9395 10.7676L9.74512 17.9619C9.56928 18.1377 9.4185 18.2942 9.22754 18.4023C9.03664 18.5104 8.82512 18.5589 8.58398 18.6191L5.92969 19.2832C5.7655 19.3242 5.587 19.3702 5.43848 19.3848C5.28375 19.3999 5.02289 19.3959 4.81348 19.1865C4.60407 18.9771 4.6001 18.7163 4.61523 18.5615C4.62976 18.413 4.67575 18.2345 4.7168 18.0703L5.38086 15.416C5.44114 15.1749 5.48962 14.9634 5.59766 14.7725C5.70578 14.5815 5.86225 14.4307 6.03809 14.2549L13.2324 7.06055C13.5556 6.73733 13.8327 6.45837 14.084 6.2666C14.3469 6.066 14.6396 5.91406 15 5.91406Z" />
                                                    <path d="M12.5 7.5L15.5 5.5L18.5 8.5L16.5 11.5L12.5 7.5Z" fill="#75716B" />
                                                </svg>
                                            </button>
                                            <button
                                                className="px-3"
                                                onClick={() => setConfirm({ id: c.id, name: c.name })}
                                                disabled={isGeneral}
                                                title={isGeneral ? "General cannot be deleted." : undefined}
                                            >
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="stroke-gray-500 hover:stroke-red-500 transition">
                                                    <path d="M10 15L10 12" strokeLinecap="round" />
                                                    <path d="M14 15L14 12" strokeLinecap="round" />
                                                    <path d="M3 7H21C20.0681 7 19.6022 7 19.2346 7.15224C18.7446 7.35523 18.3552 7.74458 18.1522 8.23463C18 8.60218 18 9.06812 18 10V16C18 17.8856 18 18.8284 17.4142 19.4142C16.8284 20 15.8856 20 14 20H10C8.11438 20 7.17157 20 6.58579 19.4142C6 18.8284 6 17.8856 6 16V10C6 9.06812 6 8.60218 5.84776 8.23463C5.64477 7.74458 5.25542 7.35523 4.76537 7.15224C4.39782 7 3.93188 7 3 7Z" strokeLinecap="round" />
                                                    <path d="M10.0681 3.37059C10.1821 3.26427 10.4332 3.17033 10.7825 3.10332C11.1318 3.03632 11.5597 3 12 3C12.4403 3 12.8682 3.03632 13.2175 3.10332C13.5668 3.17033 13.8179 3.26427 13.9319 3.37059" strokeLinecap="round" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        {items.length === 0 && (
                            <tr><td colSpan={2} className="p-6 text-center text-gray-500">{emptyText}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {confirm && (
                <ConfirmPopup
                    title="Delete category"
                    description={
                        <div className="flex justify-center items-center gap-2">
                            <div>Do you want to delete</div>
                            <div className="font-medium text-red-500 whitespace-nowrap">
                                {(confirm.name || "").length > 15
                                    ? `${confirm.name.slice(0, 15)}… ?`
                                    : (confirm.name || "")}
                            </div>
                        </div>
                    }
                    confirmText="Delete"
                    loading={deleting}
                    onCancel={() => !deleting && setConfirm(null)}
                    onConfirm={() => requestDelete(confirm.id)}
                />
            )}
        </div >
    );
}
