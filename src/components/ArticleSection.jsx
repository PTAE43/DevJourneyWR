import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { Search } from "lucide-react";

/*Dropdown*/
const categories = [
  { value: "highlight", label: "Highlight" },
  { value: "cat", label: "Cat" },
  { value: "inspiration", label: "Inspiration" },
  { value: "general", label: "General" },
];

const ArticleSection = () => {
  const [_selectedCategory, _setSelectedCategory] = useState("highlight");

  return (
    <>
      <div className="p-4 font-semibold text-[24px] text-[var(--color-title-latest)]">Latest articles</div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 bg-[var(--color-bg-icon)] rounded-xl">
        {/* แสดงใน Desktop ซ่อนใน Mobile */}
        <div className="hidden md:bg-[--color-bg-articles] md:flex gap-2">
          {categories.map(articles => (
            <button key={articles.value} onClick={() => _setSelectedCategory(articles.value)}
              className={`w-[113px] h-[48px] px-4 py-2 rounded-md text-sm font-medium transition-all
              ${_selectedCategory === articles.value
                  ? "bg-[var(--color-bg-selected)] text-[var(--color-text-selected)]"
                  : "text-[var(--color-text-articles)] hover:bg-gray-100"
                }
            `}
            >
              {articles.label}
            </button>
          ))}
        </div>

        {/* ช่อง Search */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search"
            className="w-full h-[48px] px-4 pr-10 rounded-md text-[base] border text-sm focus:outline-none"
          />
          <Search className="absolute right-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-[var(--color-text-articles)]" />
        </div>

        {/* แสดงใน Mobile ซ่อนใน Desktop */}
        <div className="w-full md:hidden">
          <Select>
            <SelectTrigger className="w-full h-[48px] px-4 font-medium text-base rounded-md text-[var(--color-text-articles)] bg-[var(--color-bg-icon)]">
              <SelectValue placeholder="Highlight" />
            </SelectTrigger>
            <SelectContent
              className="max-h-[200px] overflow-y-auto shadow-md rounded-md"
            >
              {categories.map(articles => (
                <SelectItem key={articles.value} value={articles.value}
                  className="font-medium px-4 py-2 text-base cursor-pointer text-[var(--color-text-articles)] hover:text-[var(--color-text-articles-hover)]"
                >
                  {articles.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default ArticleSection;
