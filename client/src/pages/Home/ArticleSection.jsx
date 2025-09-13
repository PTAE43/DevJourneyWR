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
const CARD_MIN_H = "min-h-[700px] md:min-h-[720px]";

const ArticleSection = () => {

  const [categoryList, setCategoryList] = useState([{ id: "all", name: "All" }]);
  const [selectedCatId, setSelectedCatId] = useState("all");

  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [countdown, setCountdown] = useState(0);

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  //ดึงมาทั้งหมด
  useEffect(() => {
    (async () => {

      const res = await api.get("/categories");
      const raw = Array.isArray(res.categories) ? res.categories : [];

      const highlight = raw.find(c => c.name.toLowerCase() === "highlight");
      const rest = raw
        .filter(c => c.name.toLowerCase() !== "highlight")
        .sort((a, b) => a.name.localeCompare(b.name));

      setCategoryList([{ id: "all", name: "All" }, ...rest, ...(highlight ? [highlight] : [])]); //[...(highlight ? [highlight] : []), ...rest, { id: "all", name: "All" }]
      setSelectedCatId("all"); //highlight ? String(highlight.id) : "all"
      setPosts([]); setPage(1); setHasMore(true);

    })();
  }, []);

  //พิมพ์มารอ 2 วิ ค่อยค้นหา
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 2000);
    return () => clearTimeout(t);
  }, [query]);

  const isWaiting = query.trim() !== debouncedQ;

  //ใช้นับถอยหลัง
  useEffect(() => {
    if (!isWaiting) { setCountdown(0); return; }
    setCountdown(2);
    const t1 = setTimeout(() => setCountdown(1), 1000);
    const t2 = setTimeout(() => setCountdown(0), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isWaiting, query, debouncedQ]);

  //ทำทีหลังเลยอันนี้
  useEffect(() => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
  }, [selectedCatId, debouncedQ]);

  //กดหมวดหมู่ซ้ำได้ ไม่ให้ดึงใหม่
  const handleChangeCategory = (v) => {
    const next = v === "all" ? "all" : String(v);
    if (String(selectedCatId) === next) return; //ถ้าเป็นอันเดิม ไม่ต้องดึงใหม่
    setSelectedCatId(next);
  };

  //ตัวดึงข้อมูลหลัก
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const params = { page: String(page), limit: String(PAGE_SIZE) };
        if (selectedCatId !== "all") {
          const cid = Number(selectedCatId);
          if (!Number.isNaN(cid)) params.categoryId = cid;
        }
        if (debouncedQ) params.q = debouncedQ;

        const res = await api.get("/posts", { params });
        if (cancelled) return;

        const list = Array.isArray(res.posts) ? res.posts : [];
        setPosts(prev => (page === 1 ? list : [...prev, ...list]));
        setHasMore((res.currentPage ?? page) < (res.totalPages ?? page));
      } catch (e) {
        if (!cancelled) {
          console.error("fetch posts failed:", e?.response?.status, e?.response?.data || e?.message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [page, selectedCatId, debouncedQ]);

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
            onChange={(e) => { setQuery(e.target.value); }}
            onKeyDown={(e) => { if (e.key === "Enter") setDebouncedQ(query.trim()); }} //ทำให้กด Enter ได้
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
      {(posts?.length ?? 0) === 0 ? (
        <div className="md:mx-auto max-w-[1200px] p-4">
          <div className={`rounded-xl border border-black/5 dark:border-white/10 bg-[var(--color-bg-articles-desktop)]/60 ${CARD_MIN_H} grid place-items-center`}>
            <p className="text-sm text-gray-500" aria-live="polite">
              {isWaiting
                ? `Searching in ${countdown}s…`          
                : isLoading
                  ? "Loading..."                       
                  : "No articles found"}
            </p>
          </div>
        </div>
      ) : (
        <>
          <BlogCard posts={posts} />
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
      )}
    </>
  );
};

export default ArticleSection;
