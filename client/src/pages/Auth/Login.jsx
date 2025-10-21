import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient.js";
import TextField from "@/components/ui/TextField.jsx";
import PasswordField from "@/components/ui/PasswordField.jsx";
import { validateEmail, friendlyAuthError } from "@/lib/validators.js";
import toast from "@/lib/toast";

export default function Login() {

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({ email: "", password: "" });

    const navigate = useNavigate();
    const location = useLocation();

    const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

    function validateAll() {
        const e = {};
        if (!validateEmail(form.email)) e.email = "รูปแบบอีเมลไม่ถูกต้อง";
        if (!form.password) e.password = "กรุณากรอกรหัสผ่าน";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function onSubmit(e) {
        e.preventDefault();
        if (!validateAll()) return;

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: form.email,
                password: form.password,
            });
            if (error) throw error;

            toast.success("Login successful.");

            const to = location.state?.from?.pathname || "/profile";
            navigate(to, { replace: true });

        } catch (err) {
            const msg = friendlyAuthError(err?.message);   //map ข้อความจาก supabase
            toast.error("Your password is incorrect or this email doesn’t exist.","Please try another password or email.");
            setErrors({});
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="grid place-items-center px-4">
            <form onSubmit={onSubmit}
                className="w-full max-w-[560px] rounded-2xl bg-[#F3F2EF] p-8 md:p-12 space-y-5">
                <h1 className="text-3xl md:text-4xl font-semibold text-center mb-4">Log in</h1>

                <TextField
                    label="Email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={v => set("email", v)}
                    error={errors.email}
                />

                <PasswordField
                    label="Password"
                    placeholder="Password"
                    value={form.password}
                    onChange={v => set("password", v)}
                    error={errors.password}
                />

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="mx-auto block rounded-full bg-[#171511] px-6 py-2 text-white hover:opacity-95 disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Log in"}
                    </button>
                </div>

                <p className="text-center text-sm text-gray-500">
                    Don’t have any account? <Link to="/register" className="underline">Sign up</Link>
                </p>
            </form>
        </div>
    );
}
