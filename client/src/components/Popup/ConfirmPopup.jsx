import React from "react";
import clsx from "clsx";

export default function ConfirmPopup({
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onCancel,
    onConfirm,
    loading = false,
}) {
    const handleBackdrop = (e) => {
        if (loading) return; // กันปิดตอนกำลังทำงาน
        if (e.target === e.currentTarget) onCancel?.();
    };
    return (
        <div
            className="fixed inset-0 bg-black/40 grid place-items-center z-50"
            onMouseDown={handleBackdrop}
        >
            <div
                className="flex flex-col justify-center items-center gap-8 bg-white rounded-xl p-6 w-[477px] h-[256px] shadow-xl"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <h3 className="text-2xl font-semibold">{title}</h3>
                <div className="text-center text-gray-600 mb-6">
                    {typeof description === "string" ? (
                        <p>{description}</p>
                    ) : (
                        description
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        className={clsx("w-[138px] h-[48px] rounded-full border",
                            loading
                                ? "opacity-70 cursor-not-allowed"
                                : " hover:bg-gray-50 transition"
                        )}
                        disabled={loading}
                        onClick={() => onCancel?.()}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={clsx("w-[138px] h-[48px] rounded-full bg-neutral-900",
                            loading
                                ? "opacity-70 cursor-not-allowed"
                                : "text-white hover:bg-neutral-700 transition"
                        )}
                        disabled={loading}
                        onClick={() => onConfirm?.()}
                    >
                        {loading ? `${confirmText}...` : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}