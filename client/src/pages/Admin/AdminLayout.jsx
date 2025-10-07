import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import hhLogo from "@/assets/image-header/hh.png";
import article from "@/assets/images/profile/Admin/icon_article.png";
import file from "@/assets/images/profile/Admin/icon_file.png";
import profile from "@/assets/images/profile/Admin/icon_profile.png";
import bell from "@/assets/images/profile/Admin/icon_bell.png";
import reset_password from "@/assets/images/profile/Admin/icon_reset_password.png";
import outside from "@/assets/images/profile/Admin/icon_outside.png";
import signout from "@/assets/images/profile/Admin/icon_logout.png";

export default function AdminLayout() {
    const nav = useNavigate();

    const logout = async () => {
        await supabase.auth.signOut().catch(() => { });
        nav("/admin/login", { replace: true });
    };

    return (
        <div className="grid grid-cols-[300px_1fr] h-full gap-0 bg-[var(--color-bg-adminpanel)]">
            <aside className="flex flex-col justify-between border-r">
                <div className="px-2">
                    <div className="flex flex-col justify-center h-[212px] pl-6 gap-3">
                        <img src={hhLogo} alt="logo" width={56.67} height={29.88} />
                        <div className="font-semibold text-xl text-[var(--color-h1-adminpanel)]">Admin panel</div>
                    </div>

                    <nav className="flex flex-col justify-center mt-[30px] gap-1">
                        <Item to="/admin/articles" label="Article management" icon={article} />
                        <Item to="/admin/categories" label="Category management" icon={file} />
                        <Item to="/admin/profile" label="Profile" end icon={profile} />
                        <Item to="/admin/notifications" label="Notification" icon={bell} />
                        <Item to="/admin/reset" label="Reset password" icon={reset_password} />
                    </nav>
                </div>

                <div>
                    <div className="mt-auto p-3">
                        <NavLink to="/" className="flex px-3 py-4 rounded-md hover:bg-neutral-50 gap-2">
                            <img src={outside} alt="home page" width={24} height={24} />
                            hh. website
                        </NavLink>
                        <button onClick={logout} className="flex w-full text-left px-3 py-4 rounded-md hover:bg-neutral-50 gap-2">
                            <img src={signout} alt="home page" width={24} height={24} />
                            Log out
                        </button>
                    </div>
                </div>

            </aside>

            <main className="bg-[var(--color-bg-layout)]">
                <header className="flex items-center">

                </header>
                <section>
                    <Outlet />
                </section>
            </main>
        </div>
    );
}

function Item({ to, label, icon, end = false }) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                [
                    "relative mx-2 rounded-lg px-4 py-3 transition flex items-center gap-3",
                    isActive
                        ? "bg-white text-black shadow-sm before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-1.5 before:rounded-full before:bg-[var(--color-h1-adminpanel)]"
                        : "text-gray-700 hover:bg-white/70"
                ].join(" ")
            }
        >
            {icon ? (
                <img
                    src={icon}
                    alt=""
                    className="h-6 w-6 object-contain opacity-70"
                    aria-hidden="true"
                />
            ) : null}
            <span>{label}</span>
        </NavLink>
    );
}
