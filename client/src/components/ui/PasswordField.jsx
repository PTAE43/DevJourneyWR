import { useState } from "react";

export default function PasswordField({
    label, value, onChange, placeholder, error, name
}) {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-2">
            {label && <label className="text-sm text-gray-700">{label}</label>}
            <div className={`relative`}>
                <input
                    name={name}
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoComplete="new-password"
                    className={`w-full rounded-md border px-3 py-2 pr-12 outline-none
            ${error ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-gray-400"}`}
                />
                <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
                >
                    {show ? "Hide" : "Show"}
                </button>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}