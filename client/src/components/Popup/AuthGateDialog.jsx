import { Link } from "react-router-dom";
import Modal from "./Modal";

export default function AuthGateDialog({ open, onClose }) {
    return (
        <Modal open={open} onClose={onClose}>
            <div className="text-center space-y-6">
                <div className="text-2xl font-semibold">Create an account to continue</div>

                <div className="flex justify-center">
                    <Link
                        to="/register"
                        className="rounded-full bg-neutral-900 px-6 py-2 text-white hover:opacity-90"
                        onClick={onClose}
                    >
                        Create account
                    </Link>
                </div>

                <div className="text-sm text-neutral-600">
                    Already have an account?{" "}
                    <Link to="/login" className="underline" onClick={onClose}>
                        Log in
                    </Link>
                </div>
            </div>
        </Modal>
    );
}
