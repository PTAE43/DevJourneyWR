// src/components/PostsGrid.jsx
import React from "react";
import { FileSearch as FileSearchIcon} from "lucide-react";
import CardPost from "./Card/cardPost"; // ถ้าเป็น named export ให้เปลี่ยนเป็น { CardPost }

const CARD_MIN_H = "min-h-[300px] md:min-h-[320px]"; //เอาไว้มาปรับความสูง

export default function BlogCard({ posts = []}) {
  const items = posts.slice(0, 6);

  return (
    <div className="md:mx-auto md:w-[1200px] p-4">
      {items.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((p) => (
            <CardPost key={p.id} data={p} />
          ))}
        </div>
      ) : (
        <div className={`rounded-xl border border-black/5 dark:border-white/10 bg-[var(--color-bg-articles-desktop)]/60 ${CARD_MIN_H} grid place-items-center`}>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="p-2 rounded-lg bg-[var(--color-bg-icon)]">
              <FileSearchIcon className="w-5 h-5 text-[var(--color-text-articles)]/70" />
            </div>
            <p className="text-[var(--color-title-latest)] font-medium">
              No articles found
            </p>
            <p className="text-sm text-[var(--color-text-articles)]/70">
              ลองเปลี่ยนหมวดหมู่หรือเคลียร์คำค้นหา
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
