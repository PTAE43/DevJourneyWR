import { Link } from "react-router-dom";

export default function RegisterSuccess() {
    return (
        <div className="grid place-items-center px-4">
            <div className="w-full max-w-[720px] rounded-2xl bg-[#F3F2EF] p-10 text-center space-y-6">
                <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500 grid place-items-center text-white text-3xl">✓</div>
                <h2 className="text-2xl md:text-3xl font-semibold">Registration success</h2>
                <Link
                    to="/"
                    className="inline-block rounded-full bg-[#171511] px-6 py-2 text-white"
                >
                    Continue
                </Link>
            </div>
        </div>
    );
}
