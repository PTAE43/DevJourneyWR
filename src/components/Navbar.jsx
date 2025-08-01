import React, { useState } from "react";

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className=" bg-white shadow-md px-6 py-4 relative z-50">
            <div className="flex justify-between items-center mx-auto w-[1200px]">
                <div>
                    <img src="/src/assets/image-header/hh..png" alt="Logo" className="w-[24px] md:w-[44px] h-auto" />
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-2xl focus:outline-none">
                    {isOpen ? <img src="/src/assets/image-header/menu-toggle.png" /> : <img src="/src/assets/image-header/menu-toggle.png" />}</button>
                <ul className={`transition-all duration-300 ease-in-out transform md:flex md:space-x-6 md:static md:translate-x-0 md:opacity-100 
                    ${isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
                    md:hidden absolute top-full left-0 w-full h-[200px] bg-[var(--color-bg-menu-toggle-mb)] md:bg-transparent md:flex-row flex flex-col justify-center items-center shadow-md px-5 gap-6`}>
                    <li className="border border-[var(--color-border-login)] rounded-full bg-[var(--color-bg-login)] hover:text-blue-500 py-3 w-full">
                        <a href="#" className="flex justify-center text-[var(--color-text-login)]">Log in</a></li>
                    <li className="border border-[var(--color-border-Signup)] rounded-full bg-[var(--color-bg-Signup)] hover:text-blue-500 py-3 w-full">
                        <a href="#" className="flex justify-center text-[var(--color-text-Signup)]">Sign up</a></li>
                </ul>
                <ul className="flex sr-only md:not-sr-only gap-4">
                    <li className="flex justify-center items-center border border-[var(--color-border-login)] rounded-full bg-[var(--color-bg-login)] hover:text-blue-500 w-[127px] h-[48px]">
                        <a href="#" className="flex justify-center text-[var(--color-text-login)]">Log in</a></li>
                    <li className="flex justify-center items-center border border-[var(--color-border-Signup)] rounded-full bg-[var(--color-bg-Signup)] hover:text-blue-500 w-[127px] h-[48px]">
                        <a href="#" className="flex justify-center text-[var(--color-text-Signup)]">Sign up</a></li>
                </ul>
            </div>

        </nav>
    );
};

export default NavBar;