import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api.js";
import { supabase } from "@/lib/supabaseClient.js";
import TextField from "@/components/ui/TextField.jsx";
import PasswordField from "@/components/ui/PasswordField.jsx";
import {
    validateEmail,
    validatePassword,
    validateUsername,
    friendlyAuthError,
} from "@/lib/validators.js";
import { useToaster, Message } from "rsuite";

export default function Register() {
    const [form, setForm] = useState({
        email: "",
        password: "",
        name: "",
        username: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const toaster = useToaster();
    const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

    function validateAll() {
        const e = {};
        if (!form.name.trim()) e.name = "กรุณากรอกชื่อ";
        if (!validateUsername(form.username))
            e.username = "ใช้ a-z, 0-9, . _ - (3–24 ตัว) ห้ามเว้นวรรค/ภาษาไทย";
        if (!validateEmail(form.email)) e.email = "รูปแบบอีเมลไม่ถูกต้อง";
        if (!validatePassword(form.password)) e.password = "รหัสผ่านอย่างน้อย 6 ตัวอักษร";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function onSubmit(e) {
        e.preventDefault();
        if (!validateAll()) return;

        setLoading(true);
        try {
            // สมัคร (ปิด email confirmation ไว้ จึงควรได้ session ทันที)
            const { data, error } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: { name: form.name, username: form.username },
                },
            });
            if (error) throw error;

            if (!data.session) {
                // ถ้าไม่ได้ session แปลว่ายังเปิด Email confirmations อยู่ใน Supabase
                throw new Error(
                    "ยังไม่ได้รับ session จาก Supabase — กรุณาปิด Email confirmations ใน Auth Settings"
                );
            }

            // /success อัปเดต/สร้างโปรไฟล์ในตาราง users
            await api.put("/profile", {
                body: { name: form.name, username: form.username, profile_pic: null },
            });

            // ไปหน้าโปรไฟล์/หน้าแรกตามต้องการ
            navigate("/success", { replace: true });
        } catch (err) {
            const msg = friendlyAuthError(err?.message);
            toaster.push(
                <Message type="error" closable>
                    {msg}
                </Message>,
                { placement: "bottomCenter" }
            );
            if (String(msg).includes("อีเมลนี้ถูกใช้แล้ว"))
                setErrors((s) => ({ ...s, email: msg }));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="grid place-items-center px-4">
            <form
                onSubmit={onSubmit}
                className="w-full max-w-[640px] rounded-2xl bg-[#F3F2EF] p-8 md:p-12 space-y-5"
            >
                <h1 className="text-3xl md:text-4xl font-semibold text-center mb-4">
                    Sign up
                </h1>

                <TextField
                    label="Name"
                    placeholder="Full name"
                    value={form.name}
                    onChange={(v) => set("name", v)}
                    error={errors.name}
                />

                <TextField
                    label="Username"
                    placeholder="Username"
                    value={form.username}
                    onChange={(v) => set("username", v)}
                    error={errors.username}
                />

                <TextField
                    label="Email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(v) => set("email", v)}
                    error={errors.email}
                />

                <PasswordField
                    label="Password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(v) => set("password", v)}
                    error={errors.password}
                />

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="mx-auto block rounded-full bg-[#171511] px-6 py-2 text-white hover:opacity-95 disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Sign up"}
                    </button>
                </div>

                <p className="text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link to="/login" className="underline">
                        Log in
                    </Link>
                </p>
            </form>
        </div>
    );
}
