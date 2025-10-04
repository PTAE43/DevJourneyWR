export default function TextField({
    label, type = "text", value, onChange, placeholder,
    error, name, autoComplete = "off"
}) {
    return (
        <div className="space-y-2">
            {label && <label className="text-sm text-gray-700">{label}</label>}
            <input
                name={name}
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                autoComplete={autoComplete}
                className={`w-full rounded-md border px-3 py-2 outline-none
          ${error ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-gray-400"}`}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}