import iconGithub_black from "../../assets/icon/footer/Github_black.png";
import iconGoogle_black from "../../assets/icon/footer/Google_black.png";
import iconLinkedIN_black from "../../assets/icon/footer/LinkedIN_black.png";

const Footer = () => (
    <footer className="bg-[var(--color-bg-footer)]">
        <div className="container mx-auto max-w-[1200px] px-4 py-8 lg:px-5">
            <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <div className="font-medium text-[var(--color-text-footer)]">Get in touch</div>
                    <a className="inline-flex items-center justify-center rounded-full" href="https://www.linkedin.com/in/ptae43" aria-label="LinkedIn">
                        <img src={iconLinkedIN_black} alt="LinkedIn" />
                    </a>
                    <a className="inline-flex items-center justify-center rounded-full" href="https://github.com/PTAE43" aria-label="GitHub">
                        <img src={iconGithub_black} alt="GitHub" />
                    </a>
                    <a className="inline-flex items-center justify-center rounded-full" href="#" aria-label="Google">
                        <img src={iconGoogle_black} alt="Google" />
                    </a>
                </div>

                <div className="flex items-center">
                    <a className="font-medium text-[20px] md:text-[16px] underline" href="/">Home page</a>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;