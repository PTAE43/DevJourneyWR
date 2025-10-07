import ResetPassword from "@/pages/Auth/ResetPassword";

export default function AdminResetPassword() {
    // reuse
    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Reset password</h2>
            <div className="rounded-2xl bg-[#F4F3F1] p-6 max-w-[640px]">
                <ResetPassword />
            </div>
        </div>
    );
}
