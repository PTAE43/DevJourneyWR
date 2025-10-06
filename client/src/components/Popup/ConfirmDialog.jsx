import Modal from "./Modal";

export default function ConfirmDialog({
    open,
    onClose,
    title = "Are you sure?",
    description = "",
    confirmText = "OK",
    cancelText = "Cancel",
    loading = false,
    onConfirm,
}) {
    return (
        <Modal open={open} onClose={onClose}>
            <div className="text-lg font-semibold mb-2 text-center">{title}</div>
            {description ? (
                <p className="text-center text-sm text-neutral-600">{description}</p>
            ) : null}

            <div className="mt-6 flex items-center justify-center gap-3">
                <button className="rounded-full border px-5 py-2" onClick={onClose} disabled={loading}>
                    {cancelText}
                </button>
                <button
                    className="rounded-full bg-neutral-900 px-6 py-2 text-white disabled:opacity-50"
                    onClick={onConfirm}
                    disabled={loading}
                >
                    {loading ? `${confirmText}…` : confirmText}
                </button>
            </div>
        </Modal>
    );
}
