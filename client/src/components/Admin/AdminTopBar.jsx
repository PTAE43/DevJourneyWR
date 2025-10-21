import { Link } from "react-router-dom";

export default function AdminTopBar({
    title,
    actions = [],
    className = "",
    children,
}) {
    return (
        <div className={`rounded-2xl bg-[var(--color-bg-layout)] ${className}`}>
            <div className="border-b">
                <div className="flex items-center justify-between px-[60px] h-[96px]">
                    {/* Left: Title */}
                    <h2 className="text-2xl font-semibold">{title}</h2>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                        {actions.map((a, i) => {
                            const common =
                                "inline-flex items-center justify-center rounded-full px-10 h-[48px] text-base transition disabled:opacity-50";
                            const variants = {
                                primary: "bg-neutral-900 text-white hover:opacity-90",
                                neutral: "bg-white text-neutral-800 border hover:bg-neutral-50",
                                outline: "border text-neutral-800 hover:bg-neutral-50",
                                danger: "bg-red-600 text-white hover:opacity-90",
                            };
                            const cls = `${common} ${variants[a.variant || "neutral"]} ${a.className || ""
                                }`;

                            // ถ้ามี `to` เรนเดอร์เป็น Link
                            if (a.to) {
                                return (
                                    <Link
                                        key={i}
                                        to={a.to}
                                        className={cls}
                                        aria-disabled={a.disabled || a.loading}
                                        onClick={(e) => {
                                            if (a.disabled || a.loading) e.preventDefault();
                                        }}
                                    >
                                        {a.loading ? "Loading…" : a.label}
                                    </Link>
                                );
                            }

                            // ปกติเป็นปุ่ม
                            return (
                                <button
                                    key={i}
                                    type={a.type || "button"}
                                    onClick={a.onClick}
                                    disabled={a.disabled || a.loading}
                                    className={cls}
                                >
                                    {a.loading ? "Loading…" : a.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* เผื่ออยากวางอะไรต่อใต้เส้นขอบ */}
            {children}
        </div>
    );
}
