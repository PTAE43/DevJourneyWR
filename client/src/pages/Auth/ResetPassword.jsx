import { useState, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Message, useToaster } from "rsuite";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {

    const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
    const [show, setShow] = useState({ current: false, next: false, confirm: false });
    const [touched, setTouched] = useState({ current: false, next: false, confirm: false });
    const [loading, setLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const toaster = useToaster();

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
            toaster.push(
                <Message type="warning" closable>
                    Please fix the highlighted fields.
                </Message>,
                { placement: "bottomCenter" }
            );
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

            toaster.push(<Message type="success" closable>Password has been updated</Message>, {
                placement: "bottomCenter",
            });
        } catch (e) {
            toaster.push(<Message type="error" closable>{e.message}</Message>, {
                placement: "bottomCenter",
            });
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
                                {show.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                                {show.next ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                                {show.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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

            {confirmOpen && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
                    <div className="w-[520px] max-w-[92vw] rounded-2xl bg-white p-6 shadow-xl">
                        <div className="text-lg font-semibold mb-2 text-center">Reset password</div>
                        <p className="text-center text-sm text-neutral-600">
                            Do you want to reset your password?
                        </p>

                        <div className="mt-6 flex items-center justify-center gap-3">
                            <button className="rounded-full border px-5 py-2" onClick={() => setConfirmOpen(false)} disabled={loading}>
                                Cancel
                            </button>
                            <button
                                className="rounded-full bg-neutral-900 px-6 py-2 text-white disabled:opacity-50"
                                onClick={doReset}
                                disabled={loading}
                            >
                                {loading ? "Resetting..." : "Reset"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
