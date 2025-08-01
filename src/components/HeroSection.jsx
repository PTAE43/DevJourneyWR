const Herosection = () => (

    <div className="p10_Hero items-center h-auto gap-5">
        <div className="flex flex-col pt-5">
            <h1 className="font-semibold text-[40px] leading-[1.2] text-center text-[var(--color-title-h1)]">
                Stay Informed, Stay Inspired</h1>
            <span className="font-medium text-[16px] leading-[1.5] text-center text-[var(--color-description-title)] py-5">
                Discover a World of Knowledge at Your Fingertips. Your Daily Dose of Inspiration and Information.</span>
        </div>
        <div className="w-full h-[470px] overflow-hidden">
            <img src="src/assets/image-header/img-hero.jpg" alt="imgage-Thompson P." className="w-full h-full rounded-2xl object-cover opacity-80" />
        </div>
        <div className="">
            <div className="font-medium text-[12px] text-[var(--color-Author)]">-Author</div>
            <div className="font-semibold text-[24px] py-2">Thompson P.</div>
            <div className="font-medium text-[16px] text-[var(--color-Author-Description)] pb-6">I am a pet enthusiast and freelance writer who specializes in animal behavior and care. With a deep love for cats, I enjoy sharing insights on feline companionship and wellness. </div>
            <div className="font-medium text-[16px] text-[var(--color-Author-Description)]">When i'm not writing, I spends time volunteering at my local animal shelter, helping cats find loving homes.</div>
        </div>
    </div>

);

export default Herosection;
