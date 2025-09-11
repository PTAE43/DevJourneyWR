import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";

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
            const { data } = await api.post("/auth/login", { email, password });
            localStorage.setItem("token", data.token);
            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }
            navigate("/");

        } catch (error) {
            return setError(error?.response?.message || "Invalid username or password");
        } finally {
            return setLoading(false);
        }
    }

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

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "loading.." : "Login"}
                </button>

                <div>
                    <span>Don’t have any account?</span>
                    <span><Link to="/register" className="underline">Sign up</Link></span>
                </div>
            </form>
        </div>
    )

}

export default Login;