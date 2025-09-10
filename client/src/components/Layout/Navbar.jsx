import hhLogo from "../../assets/image-header/hh.png";
import menutoggle from "../../assets/image-header/menu-toggle.png";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="md:mx-auto bg-white shadow-md px-6 py-4 relative z-50">
            <div className="flex justify-between items-center md:mx-auto max-w-[1200px]">
                {/* Logo */}
                <div>
                    <img src={hhLogo} alt="Logo" className="w-[24px] md:w-[44px] h-auto" />
                </div>

                {/* Toggle Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden text-2xl focus:outline-none z-50">
                    <img src={menutoggle} alt="Menu" />
                </button>

                {/* Mobile Menu */}
                <ul
                    className={`fixed top-12 left-0 w-full h-[200px] z-40 transition-all duration-300 ease-in-out
                        bg-[var(--color-bg-menu-toggle-mb)] flex flex-col justify-center items-center gap-6 px-5
                        ${isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full"}
                        md:hidden`}>
                    <li className="border border-[var(--color-border-login)] rounded-full bg-[var(--color-bg-login)] hover:text-blue-500 py-3 w-full">
                        <Link to="/login" className="flex justify-center text-[var(--color-text-login)]">Log in</Link>
                    </li>
                    <li className="border border-[var(--color-border-Signup)] rounded-full bg-[var(--color-bg-Signup)] hover:text-blue-500 py-3 w-full">
                        <Link to="/register" className="flex justify-center text-[var(--color-text-Signup)]">Sign up</Link>
                    </li>
                </ul>

                {/* Desktop Menu */}
                <ul className="md:flex hidden gap-4">
                    <li className="justify-center items-center border border-[var(--color-border-login)] rounded-full bg-[var(--color-bg-login)] hover:text-blue-500 w-[127px] h-[48px] flex">
                        <Link to="/login" className="text-[var(--color-text-login)]">Log in</Link>
                    </li>
                    <li className="justify-center items-center border border-[var(--color-border-Signup)] rounded-full bg-[var(--color-bg-Signup)] hover:text-blue-500 w-[127px] h-[48px] flex">
                        <Link to="/register" className="text-[var(--color-text-Signup)]">Sign up</Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default NavBar;
