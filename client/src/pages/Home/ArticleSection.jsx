import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import BlogCard from "./BlogCard";
import { api } from "@/lib/api.js";

const categories = [
  { value: "highlight", label: "Highlight" },
  { value: "cat", label: "Cat" },
  { value: "inspiration", label: "Inspiration" },
  { value: "general", label: "General" },
  { value: "all", label: "All" },
];

const PAGE_SIZE = 4;
const CARD_MIN_H = "min-h-[800px] md:min-h-[820px]";

const ArticleSection = () => {

  const [categoryList, setCategoryList] = useState([{ id: "all", name: "All" }]);
  const [selectedCatId, setSelectedCatId] = useState("all");
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {

      const res = await api.get("/categories");
      const raw = Array.isArray(res.categories) ? res.categories : [];

      const highlight = raw
        .find(c => c.name.toLowerCase() === "highlight");
      const rest = raw
        .filter(c => c.name.toLowerCase() !== "highlight")
        .sort((a, b) => a.name.localeCompare(b.name));

      setCategoryList([{ id: "all", name: "All" }, ...rest, ...(highlight ? [highlight] : [])]); //[...(highlight ? [highlight] : []), ...rest, { id: "all", name: "All" }]
      setSelectedCatId("all"); //highlight ? String(highlight.id) : "all"
      setPosts([]); setPage(1); setHasMore(true);

    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (selectedCatId == null) return;
    setPage(1);
    setPosts([]);
    setHasMore(true);
  }, [selectedCatId, debouncedQ]);

  const handleChangeCategory = (v) => {
    const next = v === "all" ? "all" : String(v);
    console.log("handleChangeCategory =>", v, "->", next);
    if (String(selectedCatId) === next) return;
    setSelectedCatId(next);
    setPosts([]);
    setPage(1);
    setHasMore(true);
  };

  const fetchPosts = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const params = { page: String(page), limit: String(PAGE_SIZE) };

      if (selectedCatId !== "all") {
        const cid = Number(selectedCatId);
        if (!Number.isNaN(cid)) params.categoryId = cid;
      }
      if (debouncedQ) params.q = debouncedQ;
      if (query.trim()) params.q = query.trim();

      console.log("GET /posts params =>", params, "selectedCatId =", selectedCatId);

      const res = await api.get("/posts", { params });
      const list = Array.isArray(res.posts) ? res.posts : [];
      setPosts(prev => (page === 1 ? list : [...prev, ...list]));
      setHasMore((res.currentPage ?? page) < (res.totalPages ?? page));

    } catch (e) {
      console.error("fetch posts failed:", e.response?.status, e.response?.data || e.message);

    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [page, selectedCatId, query]);

  return (
    <>
      <div className="md:mx-auto max-w-[1200px] p-4 font-semibold text-[24px] text-[var(--color-title-latest)] ">
        Latest articles
      </div>

      <div className="flex flex-col gap-4 p-4 bg-[var(--color-bg-icon)] rounded-xl md:flex-row md:items-center md:justify-between md:mx-auto max-w-[1200px] md:m-[20px] md:px-[24px] md:py-[16px] md:rounded-lg md:bg-[var(--color-bg-articles-desktop)]">
        {/* Desktop categories */}
        <div className="hidden md:flex md:bg-[var(--color-bg-articles)] gap-2">
          {categoryList.map((c) => (
            <button
              key={c.id}
              onClick={() => handleChangeCategory(c.id)}
              className={`w-[113px] h-[48px] px-4 py-2 rounded-md text-sm font-medium transition-all
                ${String(selectedCatId) === String(c.id)
                  ? "bg-[var(--color-bg-selected)] text-[var(--color-text-selected)]"
                  : "text-[var(--color-text-articles)] hover:bg-gray-100"
                }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-[360px] max-w-md">
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => { setQuery(e.target.value) }}
            className="w-full h-[48px] px-4 pr-10 rounded-md text-base border focus:outline-none"
          />
          <SearchIcon className="absolute right-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-[var(--color-text-articles)]" />
        </div>

        {/* Mobile select */}
        <div className="w-full md:hidden">
          <Select value={String(selectedCatId)} onValueChange={(v) => handleChangeCategory(v)}>
            <SelectTrigger className="w-full h-[48px] px-4 font-medium text-base rounded-md text-[var(--color-text-articles)] bg-[var(--color-bg-icon)]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto shadow-md rounded-md">
              {categoryList.map((c) => (
                <SelectItem key={c.id} value={String(c.id)} className="font-medium px-4 py-2 text-base cursor-pointer">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Posts */}
      {isLoading && posts?.length === 0 ? (
        <div className="md:mx-auto max-w-[1200px] p-4">
          <div className={`rounded-xl border border-black/5 dark:border-white/10 bg-[var(--color-bg-articles-desktop)]/60 ${CARD_MIN_H} grid place-items-center`}>
            <p className="text-sm text-[var(--color-text-articles)]/70">Loading...</p>
          </div>
        </div>
      ) : posts?.length > 0 ? (
        <>
          <BlogCard posts={posts} />

          {/* View more */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={() => !isLoading && hasMore && setPage(p => p + 1)}
                disabled={isLoading}
                className="hover:text-muted-foreground font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Loading..." : "View more"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="md:mx-auto max-w-[1200px] p-4">
          <div className={`rounded-xl border border-black/5 dark:border-white/10 bg-[var(--color-bg-articles-desktop)]/60 ${CARD_MIN_H} grid place-items-center`}>
            <p className="text-sm text-gray-500">No articles found</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ArticleSection;
