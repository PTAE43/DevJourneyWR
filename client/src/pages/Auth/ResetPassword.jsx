import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Modal, Button, toaster, Message } from "rsuite";

export default function ResetPassword() {

    const [open, setOpen] = useState(false);
    const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
    const [loading, setLoading] = useState(false);

    //กำหนดเพิ่ม
    const tooShort = pwd.next.length < 6;
    const notMatch = pwd.next !== pwd.confirm;

    async function doReset() {
        if (tooShort || notMatch) {
            toaster.push(<Message type="warning">กรุณากรอกให้ถูกต้อง</Message>, { placement: "bottomEnd" });
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: pwd.next });
            if (error) throw error;
            toaster.push(<Message type="success">Password has been updated</Message>, { placement: "bottomEnd" });
            setOpen(false);
            setPwd({ current: "", next: "", confirm: "" });
        } catch (e) {
            toaster.push(<Message type="error">{e.message}</Message>, { placement: "bottomEnd" });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto max-w-[720px] p-6">
            <div className="rounded-2xl bg-[#F4F3F1] p-6">
                <div className="space-y-5">
                    <div>
                        <label className="mb-1 block text-sm">Current password</label>
                        <input type="password" className="w-full rounded-md border px-3 py-2"
                            value={pwd.current} onChange={e => setPwd({ ...pwd, current: e.target.value })} />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm">New password</label>
                        <input type="password" className={`w-full rounded-md border px-3 py-2 ${tooShort ? "border-red-400" : ""}`}
                            value={pwd.next} onChange={e => setPwd({ ...pwd, next: e.target.value })} />
                        {tooShort && <p className="mt-1 text-xs text-red-500">Password must be at least 6 characters</p>}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm">Confirm new password</label>
                        <input type="password" className={`w-full rounded-md border px-3 py-2 ${notMatch ? "border-red-400" : ""}`}
                            value={pwd.confirm} onChange={e => setPwd({ ...pwd, confirm: e.target.value })} />
                        {notMatch && <p className="mt-1 text-xs text-red-500">Confirm password does not match</p>}
                    </div>
                    <div className="pt-2">
                        <button className="rounded-full bg-neutral-900 px-6 py-2 text-white" onClick={() => setOpen(true)}>
                            Reset password
                        </button>
                    </div>
                </div>
            </div>

            <Modal open={open} onClose={() => setOpen(false)} size="sm">
                <Modal.Header><Modal.Title>Reset password</Modal.Title></Modal.Header>
                <Modal.Body>Do you want to reset your password?</Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setOpen(false)} appearance="subtle">Cancel</Button>
                    <Button onClick={doReset} loading={loading} appearance="primary">Reset</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
