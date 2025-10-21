import { useState, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "@/lib/toast";
import { Eye, EyeOff } from "lucide-react";
import ConfirmDialog from "@/components/Popup/ConfirmDialog";

export default function ResetPassword() {

    const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
    const [show, setShow] = useState({ current: false, next: false, confirm: false });
    const [touched, setTouched] = useState({ current: false, next: false, confirm: false });
    const [loading, setLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    //handlers
    const setField = useCallback((k, v) => {
        setPwd(s => ({ ...s, [k]: v }));
    }, []);
    const touchField = useCallback(k => {
        setTouched(s => ({ ...s, [k]: true }));
    }, []);

    //validate กัน re-render อีกที
    const errors = useMemo(() => {
        const e = { current: "", next: "", confirm: "" };
        if (touched.next) {
            if (!pwd.next) e.next = "Required";
            else if (pwd.next.length < 6) e.next = "Password must be at least 6 characters";
        }
        if (touched.confirm) {
            if (!pwd.confirm) e.confirm = "Required";
            else if (pwd.confirm !== pwd.next) e.confirm = "Confirm password does not match";
        }
        return e;
    }, [pwd.next, pwd.confirm, touched.next, touched.confirm]);

    const validateAll = () => {
        const e = {};
        if (!pwd.next) e.next = "Required";
        else if (pwd.next.length < 6) e.next = "Password must be at least 6 characters";
        if (!pwd.confirm) e.confirm = "Required";
        else if (pwd.confirm !== pwd.next) e.confirm = "Confirm password does not match";
        return e;
    };

    const askConfirm = () => {
        const e = validateAll();
        if (Object.keys(e).length) {
            setTouched({ current: true, next: true, confirm: true });
            toast.warning("Please fix the highlighted fields.");
            return;
        }
        setConfirmOpen(true);
    };

    const doReset = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: pwd.next });
            if (error) throw error;

            setConfirmOpen(false);
            setPwd({ current: "", next: "", confirm: "" });
            setTouched({ current: false, next: false, confirm: false });

            toast.success("Password has been updated.");
        } catch (e) {
            setConfirmOpen(false);
            toast.error(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-[550px]">
            <div className="rounded-2xl bg-[#F4F3F1] p-6">
                <div className="space-y-5">
                    <div>
                        <label className="mb-1 block text-sm">Current password</label>
                        <div className="relative">
                            <input
                                autoComplete="current-password"
                                type={show.current ? "text" : "password"}
                                className="w-full rounded-md border px-3 py-2 pr-10"
                                value={pwd.current}
                                onChange={e => setField("current", e.target.value)}
                                onBlur={() => touchField("current")}
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500"
                                onClick={() => setShow(s => ({ ...s, current: !s.current }))}
                                aria-label={show.current ? "Hide current password" : "Show current password"}
                            >
                                {show.current ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm">New password</label>
                        <div className="relative">
                            <input
                                autoComplete="new-password"
                                type={show.next ? "text" : "password"}
                                className={`w-full rounded-md border px-3 py-2 pr-10 ${errors.next ? "border-red-400" : ""}`}
                                value={pwd.next}
                                onChange={e => setField("next", e.target.value)}
                                onBlur={() => touchField("next")}
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500"
                                onClick={() => setShow(s => ({ ...s, next: !s.next }))}
                                aria-label={show.next ? "Hide new password" : "Show new password"}
                            >
                                {show.next ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.next && <p className="mt-1 text-xs text-red-500">{errors.next}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm">Confirm new password</label>
                        <div className="relative">
                            <input
                                autoComplete="new-password"
                                type={show.confirm ? "text" : "password"}
                                className={`w-full rounded-md border px-3 py-2 pr-10 ${errors.confirm ? "border-red-400" : ""}`}
                                value={pwd.confirm}
                                onChange={e => setField("confirm", e.target.value)}
                                onBlur={() => touchField("confirm")}
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500"
                                onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                                aria-label={show.confirm ? "Hide confirm password" : "Show confirm password"}
                            >
                                {show.confirm ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
                    </div>

                    <div className="pt-2">
                        <button className="rounded-full bg-neutral-900 px-6 py-2 text-white" onClick={askConfirm}>
                            Reset password
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                title="Reset password"
                description="Do you want to reset your password?"
                confirmText="Reset"
                cancelText="Cancel"
                loading={loading}
                onConfirm={doReset}
            />
        </div>
    );
}
