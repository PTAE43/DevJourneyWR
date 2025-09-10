import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../lib/api";

function Login() {

    const [fullname, setFullname] = useState("");
    const [username, setUsername] = useState("");
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
            const { data } = await api.post("/auth/login", { fullname, username, email, password });
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
        <div>
            <h1>Sign up</h1>
            <div>Name</div>
            <div></div>

            <div>Username</div>
            <div></div>

            <div>Email</div>
            <div></div>

            <div>Password</div>
            <div></div>

            <div></div>

            <div>
                <span>Already have an account?</span>
                <span>Log in</span>
            </div>
        </div>
    )

}

export default Login;