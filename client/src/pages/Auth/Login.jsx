import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient.js";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const haddleOnSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            navigate("/");
        } catch (error) {
            setError(error.message || "Login failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <h1>Log in</h1>
            <form onSubmit={haddleOnSubmit} className="space-y-4">
                <label>Email</label>
                <div>
                    <input
                        type="email"
                        className="w-full rounded-md border px-3 py-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <label>Password</label>
                <div>
                    <input
                        type="password"
                        className="w-full rounded-md border px-3 py-2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? "loading.." : "Log in"}
                </button>

                <div>
                    <span>Don’t have any account?</span>
                    <span><Link to="/auth/register" className="underline">Sign up</Link></span>
                </div>
            </form>
        </div>
    )

}

export default Login;