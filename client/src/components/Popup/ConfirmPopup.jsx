export default function ConfirmPopup({ title, description, confirmText, onCancel, onConfirm }) {
    return (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
            <div className="bg-white rounded-xl p-6 w-[360px] shadow-xl">
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-600 mb-4">{description}</p>
                <div className="flex justify-end gap-2">
                    <button className="px-4 py-2 rounded border" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="px-4 py-2 rounded bg-neutral-900 text-white" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}