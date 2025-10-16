export default function ConfirmPopup({ title, description, confirmText, onCancel, onConfirm }) {
    return (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
            <div className="flex flex-col justify-center items-center gap-8 bg-white rounded-xl p-6 w-[477px] h-[256px] shadow-xl">
                <h3 className="text-2xl font-semibold">{title}</h3>
                <p className="text-base text-gray-600">{description}</p>
                <div className="flex gap-2">
                    <button className="w-[138px] h-[48px] rounded-full border hover:bg-gray-50 transition" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="w-[138px] h-[48px] rounded-full bg-neutral-900 text-white hover:bg-neutral-700 transition" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}