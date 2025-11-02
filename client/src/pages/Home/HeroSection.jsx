import imghero from "../../assets/image-header/ptae43.png";

const Herosection = () => (

    <div className="flex flex-col md:flex-row justify-center items-center md:mx-auto max-w-[1200px] h-auto py-8 px-5 gap-5">
        <div className="flex flex-col pt-5 md:w-1/3">
            <h1 className="font-semibold text-[40px] md:text-[52px] leading-[1.2] text-center md:text-right text-[var(--color-title-h1)]">
                Full-Stack Developer</h1>
            <span className="font-medium text-[16px] leading-[1.5] text-center md:text-right text-[var(--color-description-title)] py-5">
                Driven by passion for development and curiosity for new technology — growing stronger with every project and challenge.</span>
        </div>
        <div className="w-full h-[470px] overflow-hidden md:w-1/3">
            <img src={imghero} alt="imgage-Thompson P." className="w-full h-full rounded-2xl object-cover opacity-80" />
        </div>
        <div className="md:w-1/3">
            <div className="font-medium text-[12px] text-[var(--color-Author)]">-Author</div>
            <div className="font-semibold text-[40px] py-2">Worakorn R.</div>
            <div className="font-medium text-[16px] text-[var(--color-Author-Description)] pb-6">
                Passionate Full-Stack Developer with strong skills in React.js, Next.js, UX/UI, and cloud technologies. A fast learner with creative thinking, responsibility, </div>
            <div className="font-medium text-[16px] text-[var(--color-Author-Description)]">
                Always eager to improve and take on new challenges in web development and SEO.</div>
        </div>
    </div>

);

export default Herosection;
