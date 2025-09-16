import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api.js";
import { supabase } from "../../lib/supabaseClient.js";

function Register() {

    const [form, setForm] = useState({ email: "", password: "", name: "", username: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const haddleOnSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                name: form.name,
                username: form.username,
                email: form.email,
                password: form.password,
            });

            if (error) throw error;
            if (!data.session) throw new Error("ไม่ส่ง session กลับมาเลย.");

            await api.post("/success", { name: form.name, username: form.username });
            navigate("/");

        } catch (error) {
            setError(error.message || "Sign up failed.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen">
            <h1>Sign up</h1>
            <form onSubmit={haddleOnSubmit} className="space-y-4">
                <label>Name</label>
                <div>
                    <input
                        type="name"
                        className="w-full rounded-md border px-3 py-2"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                </div>

                <label>Username</label>
                <div>
                    <input
                        type="username"
                        className="w-full rounded-md border px-3 py-2"
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        required
                    />
                </div>

                <label>Email</label>
                <div>
                    <input
                        type="email"
                        className="w-full rounded-md border px-3 py-2"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                    />
                </div>

                <label>Password</label>
                <div>
                    <input
                        type="password"
                        className="w-full rounded-md border px-3 py-2"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                    />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "loading.." : "Sign up"}
                </button>

                <div>
                    <span>Already have an account?</span>
                    <span><Link to="/auth/login" className="underline">Log in</Link></span>
                </div>
            </form>
        </div>
    )

}

export default Register;