import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import BlogCard from "./BlogCard";
import { api } from "../../lib/api.js";

const categories = [
  { value: "highlight", label: "Highlight" },
  { value: "cat", label: "Cat" },
  { value: "inspiration", label: "Inspiration" },
  { value: "general", label: "General" },
  { value: "all", label: "All" },
];

const PAGE_SIZE = 4;
const CARD_MIN_H = "min-h-[300px] md:min-h-[320px]";

const ArticleSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("highlight");
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosts = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const params = { page, limit: PAGE_SIZE, q: query };
      if (selectedCategory !== "all") params.category = selectedCategory;

      const { data } = await api.get("/posts", { params });

      setPosts((prev) => (page === 1 ? data.posts : [...prev, ...data.posts]));
      setHasMore(data.currentPage < data.totalPages);
    } catch (e) {
      console.error("fetchPosts error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, selectedCategory, query]);

  const handleChangeCategory = (v) => {
    setSelectedCategory(v);
    setPosts([]);
    setPage(1);
    setHasMore(true);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) setPage((p) => p + 1);
  };

  return (
    <>
      <div className="p-4 font-semibold text-[24px] text-[var(--color-title-latest)] md:mx-auto md:w-[1200px]">
        Latest articles
      </div>

      <div className="flex flex-col gap-4 p-4 bg-[var(--color-bg-icon)] rounded-xl md:flex-row md:items-center md:justify-between md:mx-auto md:w-[1200px] md:m-[20px] md:px-[24px] md:py-[16px] md:rounded-lg md:bg-[var(--color-bg-articles-desktop)]">
        {/* Desktop categories */}
        <div className="hidden md:flex md:bg-[var(--color-bg-articles)] gap-2">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => handleChangeCategory(c.value)}
              className={`w-[113px] h-[48px] px-4 py-2 rounded-md text-sm font-medium transition-all
                ${selectedCategory === c.value
                  ? "bg-[var(--color-bg-selected)] text-[var(--color-text-selected)]"
                  : "text-[var(--color-text-articles)] hover:bg-gray-100"
                }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-[360px] max-w-md">
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPosts([]);
              setPage(1);
              setHasMore(true);
            }}
            className="w-full h-[48px] px-4 pr-10 rounded-md text-base border focus:outline-none"
          />
          <SearchIcon className="absolute right-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-[var(--color-text-articles)]" />
        </div>

        {/* Mobile select */}
        <div className="w-full md:hidden">
          <Select value={selectedCategory} onValueChange={handleChangeCategory}>
            <SelectTrigger className="w-full h-[48px] px-4 font-medium text-base rounded-md text-[var(--color-text-articles)] bg-[var(--color-bg-icon)]">
              <SelectValue placeholder="Highlight" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto shadow-md rounded-md">
              {categories.map((c) => (
                <SelectItem key={c.value} value={c.value} className="font-medium px-4 py-2 text-base cursor-pointer">
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Posts */}
      {isLoading && posts.length === 0 ? (
        // โหลดครั้งแรก → กล่องสูงตาม CARD_MIN_H
        <div className="md:mx-auto md:w-[1200px] p-4">
          <div className={`rounded-xl border border-black/5 dark:border-white/10 bg-[var(--color-bg-articles-desktop)]/60 ${CARD_MIN_H} grid place-items-center`}>
            <p className="text-sm text-[var(--color-text-articles)]/70">Loading...</p>
          </div>
        </div>
      ) : posts.length > 0 ? (
        <>
          <BlogCard posts={posts} />

          {/* View more */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="hover:text-muted-foreground font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Loading..." : "View more"}
              </button>
            </div>
          )}
        </>
      ) : (
        // ไม่มีผลลัพธ์ → กล่องสูงเท่าการ์ดเหมือนกัน
        <div className="md:mx-auto md:w-[1200px] p-4">
          <div className={`rounded-xl border border-black/5 dark:border-white/10 bg-[var(--color-bg-articles-desktop)]/60 ${CARD_MIN_H} grid place-items-center`}>
            <p className="text-sm text-gray-500">No articles found</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ArticleSection;
