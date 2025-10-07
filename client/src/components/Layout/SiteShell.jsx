import NavBar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function SiteShell() {
    return (
        <div className="min-h-screen flex flex-col">
            <NavBar />
            <main className="flex-1 md:mt-[35px]">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
