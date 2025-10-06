import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Generic modal rendered via React Portal to document.body
 * - Centered to viewport จริง ๆ (ไม่โดน transform ของพาเรนต์)
 * - Close on backdrop click / Esc
 */
export default function Modal({
    open,
    onClose,
    children,
    className = "",
    width = "520px",
}) {
    const panelRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    const onBackdropMouseDown = (e) => {
        // คลิกนอกกล่อง = ปิด
        if (panelRef.current && !panelRef.current.contains(e.target)) onClose?.();
    };

    const modalNode = (
        <div
            className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4"
            onMouseDown={onBackdropMouseDown}
            aria-modal="true"
            role="dialog"
        >
            <div
                ref={panelRef}
                style={{ width }} // ใช้ inline style เพื่อรองรับค่า dynamic
                className={`relative max-w-[92vw] rounded-2xl bg-white p-6 shadow-2xl ${className}`}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="absolute right-3 top-3 rounded-full p-1 text-neutral-500 hover:bg-neutral-100"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>
                {children}
            </div>
        </div>
    );

    // เรนเดอร์ออกสู่ body เพื่อไม่ติดข้อจำกัดของพาเรนต์ที่มี transform
    return createPortal(modalNode, document.body);
}
