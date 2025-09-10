import React from "react";

function CardPost({ data }) {
    return (
        <div className="flex flex-col gap-4">
            <a href="#" className="relative h-[212px] sm:h-[360px]">
                <img className="w-full h-full object-cover rounded-md"
                    src={data.images} alt={data.title} />
            </a>
            <div className="flex flex-col">
                <div className="flex">
                    <span className="category_posts">
                        {data.category}
                    </span>
                </div>
                <a href="#" >
                    <h2 className="text-start font-bold text-xl mb-2 line-clamp-2 hover:underline">
                        {data.title}
                    </h2>
                </a>
                <p className="text-muted-foreground text-sm mb-4 flex-grow line-clamp-3">
                    {data.description}</p>
                <div className="flex items-center text-sm">
                    <img className="w-8 h-8 rounded-full mr-2"
                        src={data.profile} alt={data.author} />
                    <span>{data.author}</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span>{data.date}</span>
                </div>
            </div>
        </div>
    );
}

export default CardPost;
