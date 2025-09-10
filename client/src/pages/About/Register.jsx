import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";

function Register() {

    const [fullname, setFullname] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const haddleOnSubmit = async (event) => {
        event.preventDefault();
        if (password !== confirm) {
            return setError("The password is incorrect.");
        }
        setError("");
        setLoading(true);

        try {
            const { data } = await api.post("/auth/register", { fullname, username, email, password });
            localStorage.setItem("token", data.token);
            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }
            navigate("/");

        } catch (error) {
            return setError(error?.response?.message || "Incorrect information.");
        } finally {
            return setLoading(false);
        }
    }

    return (
        <div>
            <h1>Sign up</h1>
            <form onSubmit={haddleOnSubmit} className="space-y-4">
                <label>Name</label>
                <div>
                    <input
                        type="name"
                        className="w-full rounded-md border px-3 py-2"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        required
                    />
                </div>

                <label>Username</label>
                <div>
                    <input
                        type="username"
                        className="w-full rounded-md border px-3 py-2"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

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
                    {loading ? "loading.." : "Sign up"}
                </button>

                <div>
                    <span>Already have an account?</span>
                    <span><Link to="/login" className="underline">Log in</Link></span>
                </div>
            </form>
        </div>
    )

}

export default Register;