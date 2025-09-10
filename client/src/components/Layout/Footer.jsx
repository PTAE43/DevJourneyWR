// import { Linkedin } from 'lucide-react';
// import { Github } from 'lucide-react';
// import { Facebook } from 'lucide-react';
import iconGithub_black from "../../assets/icon/footer/Github_black.png";
import iconGoogle_black from "../../assets/icon/footer/Google_black.png";
import iconLinkedIN_black from "../../assets/icon/footer/LinkedIN_black.png";

const Footer = () => (
    <div className="flex justify-center items-center md:mx-auto bg-[var(--color-bg-footer)] h-[132px] lg:h-[124px] bottom-0">
        <div className="lg:flex lg:justify-between lg:mx-auto lg:w-[1200px] max-w-[1200px] lg:px-5">
            <div className="flex py-5 gap-4">
                <div className="font-medium text-[var(--color-text-footer)]">Get in touch</div>
                <div className="flex justify-center items-center rounded-full">
                    <img src={iconLinkedIN_black} alt="iconGithub_black" /></div>
                <div className="flex justify-center items-center rounded-full">
                    <img src={iconGithub_black} alt="iconGithub_black" /></div>
                <div className="flex justify-center items-center rounded-full">
                    <img src={iconGoogle_black} alt="iconGithub_black" /></div>
            </div>
            <div className="flex justify-center items-center underline py-2">
                <a className="font-medium text-[16px]" href="/">Home page</a>
            </div>
        </div>
    </div>
);

export default Footer;