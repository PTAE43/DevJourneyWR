import AdminTopBar from "@/components/Admin/AdminTopBar";
import ResetPassword from "@/pages/Auth/ResetPassword";

export default function AdminResetPassword() {
    // reuse
    return (
        <div>
            <AdminTopBar title="Reset password" />
            <div className="mt-8 rounded-2xl max-w-[620px]">
                <ResetPassword />
            </div>
        </div>
    );
}
