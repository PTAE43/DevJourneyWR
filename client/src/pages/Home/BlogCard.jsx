import React from "react";
import CardPost from "../../components/Card/cardPost"; // ถ้าเป็น named export ให้เปลี่ยนเป็น { CardPost }
import { useNavigate } from "react-router-dom";
// import LikeButton from "@/components/Likes/LikeButton";

const CARD_MIN_H = "min-h-[300px] md:min-h-[320px]"; //เอาไว้มาปรับความสูง

export default function BlogCard({ posts = [] }) {
  const navigate = useNavigate();
  return (
    <div className="md:mx-auto max-w-[1200px] p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((p) => (
          <div
            key={p.id}
            role="link"
            tabIndex={0}
            onClick={() => navigate(`/posts/${p.id}`)}
            onKeyDown={(e) => e.key === "Enter" && navigate(`/posts/${p.id}`)}
            className="cursor-pointer"
          >
            <CardPost data={p} />
            {/* <LikeButton postId={post.id} initialCount={p.likes_count ?? 0} className="mt-2" /> */}
          </div>
        ))}
      </div>
    </div>
  );
}
