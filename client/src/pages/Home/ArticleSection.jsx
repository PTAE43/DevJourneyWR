import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import BlogCard from "./BlogCard";
import { api } from "@/lib/api.js";
import { Dropdown } from "rsuite";
import { useNavigate } from "react-router-dom";

// เดิมมีอยู่แล้ว — เก็บไว้
const categories = [
  { value: "highlight", label: "Highlight" },
  { value: "cat", label: "Cat" },
  { value: "inspiration", label: "Inspiration" },
  { value: "general", label: "General" },
  { value: "all", label: "All" },
];

const PAGE_SIZE = 4;
const CARD_MIN_H = "min-h-[700px] md:min-h-[720px]";

function formatDateTimeTH(d) {
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch { return ""; }
}

function getPostLink(p) {
  if (!p) return "#";
  if (p.slug) return `/posts/${p.slug}`;
  if (p.id) return `/posts/${p.id}`;
  return "#";
}

function getCover(p) {
  return p?.images || p?.cover_url || p?.cover || p?.image_url || "";
}

const ArticleSection = () => {
  const [booted, setBooted] = useState(false);   // บูตเสร็จค่อยโหลดโพสต์
  const navigate = useNavigate();

  const [categoryList, setCategoryList] = useState([{ id: "all", name: "All" }]);
  const [selectedCatId, setSelectedCatId] = useState("all");

  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [countdown, setCountdown] = useState(0);

  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const searchBoxRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  //ดึงมาทั้งหมด
  useEffect(() => {
    (async () => {
      const catRes = await api.get("/categories");
      const raw = Array.isArray(catRes?.categories) ? catRes.categories : [];

      const highlight = raw.find(c => c.name.toLowerCase() === "highlight");
      const rest = raw
        .filter(c => c.name.toLowerCase() !== "highlight")
        .sort((a, b) => a.name.localeCompare(b.name));

      setCategoryList([{ id: "all", name: "All" }, ...rest, ...(highlight ? [highlight] : [])]); //[...(highlight ? [highlight] : []), ...rest, { id: "all", name: "All" }]
      setSelectedCatId("all"); //highlight ? String(highlight.id) : "all"
      setPosts([]); setPage(1); setHasMore(true);
      setBooted(true);
    })();
  }, []);

  //พิมพ์มารอ 2 วิ ค่อยค้นหา (ของ list หลัก)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 2000);
    return () => clearTimeout(t);
  }, [query]);

  //ไม่รอ 2 วิในครั้งแรก
  useEffect(() => { setDebouncedQ(""); }, []);
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
    if (!booted) return;
    setPage(1);
    setPosts([]);
    setHasMore(true);
  }, [selectedCatId, debouncedQ, booted]);

  //กดหมวดหมู่ซ้ำได้ ไม่ให้ดึงใหม่
  const handleChangeCategory = (v) => {
    const next = v === "all" ? "all" : String(v);
    if (String(selectedCatId) === next) return; //ถ้าเป็นอันเดิม ไม่ต้องดึงใหม่
    setSelectedCatId(next);
  };

  //ตัวดึงข้อมูลหลัก
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      try {
        const params = { page: String(page), limit: String(PAGE_SIZE) };
        if (selectedCatId !== "all") {
          const cid = Number(selectedCatId);
          if (!Number.isNaN(cid)) params.categoryId = cid;
        }
        if (debouncedQ) params.q = debouncedQ;

        const res = await api.get("/posts", { params, signal: controller.signal });

        if (cancelled) return;
        const list = Array.isArray(res?.posts) ? res.posts : [];
        setPosts(prev => (page === 1 ? list : [...prev, ...list]));
        setHasMore((res.currentPage ?? page) < (res.totalPages ?? page));

      } catch (e) {
        if (!cancelled && e.name !== "CanceledError") {
          console.error("fetch posts failed:", e?.response?.status, e?.response?.data || e?.message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    if (booted) load();
    return () => { cancelled = true; controller.abort(); };
  }, [page, selectedCatId, debouncedQ, booted]);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSuggest(false);
      return;
    }
    let cancelled = false;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const params = { q: query.trim(), limit: 5, page: 1 };
        const res = await api.get("/posts", { params, signal: ctrl.signal });
        if (cancelled) return;
        const list = Array.isArray(res?.posts) ? res.posts.slice(0, 5) : [];
        setSearchResults(list);
        setShowSuggest(true);
      } catch (e) {
        if (!cancelled && e.name !== "CanceledError") {
          console.error("typeahead failed:", e?.message);
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => { clearTimeout(t); cancelled = true; ctrl.abort(); };
  }, [query]);

  useEffect(() => {
    function onDocClick(e) {
      if (!searchBoxRef.current) return;
      if (!searchBoxRef.current.contains(e.target)) setShowSuggest(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const visibleCats = useMemo(() => categoryList.slice(0, 5), [categoryList]);
  const overflowCats = useMemo(() => categoryList.slice(5), [categoryList]);

  const selectedCatName = useMemo(() => {
    const found = categoryList.find(c => String(c.id) === String(selectedCatId));
    return found?.name ?? "All";
  }, [categoryList, selectedCatId]);

  return (
    <>
      <div className="md:mx-auto max-w-[1200px] p-4 font-semibold text-[24px] text-[var(--color-title-latest)] ">
        Latest articles
      </div>

      <div className="flex flex-col gap-4 p-4 bg-[var(--color-bg-icon)] rounded-xl md:flex-row md:items-center md:justify-between md:mx-auto max-w-[1200px] md:m-[20px] md:px-[24px] md:py-[16px] md:rounded-lg md:bg-[var(--color-bg-articles-desktop)]">
        {/* Desktop categories */}
        <div className="hidden md:flex items-center gap-2 md:bg-[var(--color-bg-articles)]">
          {visibleCats.map((c) => (
            <button
              key={c.id}
              onClick={() => handleChangeCategory(c.id)}
              className={`w-[113px] h-[48px] px-4 py-2 rounded-md text-sm font-medium transition-all
              ${String(selectedCatId) === String(c.id)
                  ? "bg-[var(--color-bg-selected)] text-[var(--color-text-selected)]"
                  : "text-[var(--color-text-articles)] hover:bg-[var(--color-text-articles-hover)]"
                }`}
            >
              {c.name}
            </button>
          ))}

          {overflowCats.length > 0 && (
            <Dropdown
              className="blog-dd"
              title="More"
              placement="bottomStart"
              trigger="click"
            >
              {overflowCats.map((c) => (
                <Dropdown.Item
                  key={c.id}
                  onClick={() => handleChangeCategory(c.id)}
                  active={String(selectedCatId) === String(c.id)}
                >
                  {c.name}
                </Dropdown.Item>
              ))}
            </Dropdown>
          )}
        </div>

        {/* Search + Typeahead */}
        <div className="relative w-full md:w-[360px] max-w-md" ref={searchBoxRef}>
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggest(true); }}
            onFocus={() => { if (searchResults.length) setShowSuggest(true); }}
            onKeyDown={(e) => { if (e.key === "Enter") setDebouncedQ(query.trim()); }} //ทำให้กด Enter ได้
            className="w-full h-[48px] px-4 pr-10 rounded-md text-base border focus:outline-none"
            aria-autocomplete="list"
            aria-expanded={showSuggest}
          />
          <SearchIcon className="absolute right-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-[var(--color-text-articles)]" />

          {showSuggest && (
            <div
              className="absolute z-20 mt-2 w-full rounded-md border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-lg max-h-[260px] overflow-y-auto"
              role="listbox"
            >
              {searching && (
                <div className="px-4 py-3 text-sm text-gray-500">Searching…</div>
              )}

              {!searching && searchResults.length === 0 && query.trim() && (
                <div className="px-4 py-3 text-sm text-gray-500">No results</div>
              )}

              {!searching && searchResults.map((p) => (
                <button
                  key={p.id ?? p.slug}
                  onClick={() => {
                    setShowSuggest(false);
                    navigate(getPostLink(p));
                  }}
                  className="w-full text-left px-3 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                  role="option"
                >
                  <div className="flex items-center gap-3">
                    {getCover(p) ? (
                      <img
                        src={getCover(p)}
                        alt={p?.title ?? "cover"}
                        className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-neutral-200 dark:bg-neutral-700 flex-shrink-0" />
                    )}

                    <div className="min-w-0">
                      <div className="truncate font-medium">{p.title ?? "Untitled"}</div>
                      <div className="text-xs text-neutral-500">
                        {formatDateTimeTH(p?.published_at || p?.created_at)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
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
      <div className={`flex flex-col items-center ${CARD_MIN_H} mb-5`}>
        {(isLoading && (posts?.length ?? 0) === 0) ? (
          <div className="w-full max-w-[1200px] mx-auto">
            <div
              className={`rounded-xl border border-black/5 dark:border-white/10
                    bg-[var(--color-bg-articles-desktop)]/60 ${CARD_MIN_H}
                    flex items-center justify-center`}
            >
              <p className="text-sm text-gray-500">Loading…</p>
            </div>
          </div>
        ) : (
          <>
            {(booted && !isLoading && (posts?.length ?? 0) === 0) ? (
              <div className="w-full max-w-[1200px] mx-auto">
                <div
                  className={`rounded-xl border border-black/5 dark:border-white/10
                        bg-[var(--color-bg-articles-desktop)]/60 ${CARD_MIN_H}
                        flex items-center justify-center`}
                >
                  <p className="text-sm text-gray-500" aria-live="polite">
                    {isWaiting ? `Searching in ${countdown}s…` : "No articles found"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-[1200px] mx-auto">
                <div className="rounded-xl border border-black/5 dark:border-white/10 bg-[var(--color-bg-articles-desktop)]/60 p-4 md:p-6">
                  <BlogCard posts={posts} />
                  <div className="mt-6 flex justify-center min-h-[44px]">
                    {booted && hasMore && (
                      <button
                        onClick={() => !isLoading && hasMore && setPage(p => p + 1)}
                        disabled={isLoading}
                        className="mx-auto block rounded-full border px-5 py-2 bg-white hover:bg-neutral-100 disabled:opacity-50"
                      >
                        {isLoading ? "Loading…" : "View more"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ArticleSection;
