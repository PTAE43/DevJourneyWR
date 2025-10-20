export default function AppToast({ status = 'info', title = '', description = '' }) {
    const styles = {
        success: 'bg-emerald-600 text-white',
        error: 'bg-rose-600 text-white',
        warning: 'bg-amber-500 text-neutral-900',
        info: 'bg-sky-600 text-white'
    }[status] || 'bg-neutral-800 text-white';

    return (
        <div className={`rounded-lg px-5 py-4 shadow-lg ${styles}`}>
            <div className="font-semibold">{title}</div>
            {!!description && (
                <div className="text-sm/5 opacity-90">{description}</div>
            )}
        </div>
    );
}
