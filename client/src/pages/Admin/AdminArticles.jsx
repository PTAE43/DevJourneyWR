// client/src/pages/Admin/AdminArticles.jsx
import { useState } from "react";
import ArticleList from "@/components/Admin/Article/ArticleList";
import ArticleEditor from "@/components/Admin/Article/ArticleEditor";

export default function AdminArticles() {
    const [mode, setMode] = useState("list"); // 'list' | 'edit'
    const [editingId, setEditingId] = useState(null); // null | 'new' | number

    return mode === "list" ? (
        <ArticleList
            onCreate={() => {
                setEditingId("new");
                setMode("edit");
            }}
            onEdit={(id) => {
                setEditingId(id);
                setMode("edit");
            }}
        />
    ) : (
        <ArticleEditor
            id={editingId}
            onBack={() => {
                setMode("list");
                setEditingId(null);
            }}
            onDeleted={() => {
                setMode("list");
                setEditingId(null);
            }}
        />
    );
}
