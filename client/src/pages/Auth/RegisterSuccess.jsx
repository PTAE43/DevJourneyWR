import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function RegisterSuccess() {
    const [seconds, setSeconds] = useState(5);
    const navigate = useNavigate();

    useEffect(() => {
        const t = setInterval(() => {
            setSeconds((s) => {
                if (s <= 1) {
                    clearInterval(t);
                    // ครบ 5 วิ -> ไปหน้าโปรไฟล์
                    navigate("/profile", { replace: true });
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [navigate]);

    return (
        <div className="grid place-items-center px-4">
            <div className="w-full max-w-[720px] rounded-2xl bg-[#F3F2EF] p-10 text-center space-y-6">
                <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500 grid place-items-center text-white text-3xl">
                    ✓
                </div>

                <h2 className="text-2xl md:text-3xl font-semibold">
                    Registration success
                </h2>

                <p className="text-sm text-gray-600">
                    You’ll be redirected to your profile in{" "}
                    <span className="font-semibold">{seconds}</span> second
                    {seconds === 1 ? "" : "s"}…
                </p>

                <div className="flex items-center justify-center gap-3">
                    {/* ปุ่มไปหน้าแรก */}
                    <Link
                        to="/"
                        className="inline-block rounded-full bg-[#171511] px-6 py-2 text-white hover:opacity-95"
                    >
                        Go to home
                    </Link>

                    {/* ปุ่มไปโปรไฟล์ */}
                    <button
                        onClick={() => navigate("/profile", { replace: true })}
                        className="inline-block rounded-full border px-6 py-2 hover:bg-white"
                    >
                        Go to profile now
                    </button>
                </div>
            </div>
        </div>
    );
}
