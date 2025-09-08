import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useMemo } from "react";
import { Search as SearchIcon } from "lucide-react";
import { MOCK_BLOG_POST } from "@/constants/mockDataPost";
import BlogCard from "./BlogCard";


/*Dropdown*/
const categories = [
  { value: "highlight", label: "Highlight" },
  { value: "cat", label: "Cat" },
  { value: "inspiration", label: "Inspiration" },
  { value: "general", label: "General" },
  { value: "all", label: "All" },
];

const ArticleSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("highlight");
  const [query, setQuery] = useState("");

  const norm = (s) => `${s ?? ""}`.toLowerCase().trim(); //(s = "")

  const posts = useMemo(() => {
    const list = MOCK_BLOG_POST || [];
    return list
      .filter(p => {
        if (selectedCategory === "highlight") return !!p.highlight; //return true; เอาไว้สลับให้ all
        if (selectedCategory === "all") return true;
        return norm(p.category) === norm(selectedCategory);
      })
      .filter(p => !query.trim() || norm(p.title).includes(norm(query)))
      .slice(0, 6);
  }, [selectedCategory, query]);

  return (
    <>
      <div className="p-4 font-semibold text-[24px] text-[var(--color-title-latest)] md:mx-auto md:w-[1200px]">Latest articles</div>
      <div className="flex flex-col gap-4 p-4 bg-[var(--color-bg-icon)] rounded-xl md:flex-row md:items-center md:justify-between md:mx-auto md:w-[1200px] md:m-[20px] md:px-[24px] md:py-[16px] md:rounded-lg md:bg-[var(--color-bg-articles-desktop)]">

        {/* แสดงใน Desktop ซ่อนใน Mobile */}
        <div className="hidden md:flex md:bg-[var(--color-bg-articles)] gap-2">
          {categories.map((c) => (
            <button key={c.value} onClick={() => setSelectedCategory(c.value)} className={`w-[113px] h-[48px] px-4 py-2 rounded-md text-sm font-medium transition-all
              ${selectedCategory === c.value
                ? "bg-[var(--color-bg-selected)] text-[var(--color-text-selected)]"
                : "text-[var(--color-text-articles)] hover:bg-gray-100"
              }`}>
              {c.label}
            </button>
          ))}
        </div>

        {/* ช่อง Search */}
        <div className="relative w-full md:w-[360px] max-w-md">
          <input type="text" placeholder="Search" className="w-full h-[48px] px-4 pr-10 rounded-md text-base border focus:outline-none" />
          <SearchIcon className="absolute right-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-[var(--color-text-articles)]" />
        </div>

        {/* แสดงใน Mobile ซ่อนใน Desktop */}
        <div className="w-full md:hidden">
          <Select>
            <SelectTrigger className="w-full h-[48px] px-4 font-medium text-base rounded-md text-[var(--color-text-articles)] bg-[var(--color-bg-icon)]">
              <SelectValue placeholder="Highlight" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto shadow-md rounded-md">
              {categories.map(c => (
                <SelectItem key={c.value} value={c.value} className="font-medium px-4 py-2 text-base cursor-pointer text-[var(--color-text-articles)] hover:text-[var(--color-text-articles-hover)]">
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/*POST*/}
      <BlogCard posts={posts} />
    </>
  );
};

export default ArticleSection;
