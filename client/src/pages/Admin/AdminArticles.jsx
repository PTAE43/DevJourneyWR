import { useState } from "react";
import ArticleList from "@/components/Admin/Article/List";
import ArticleEditor from "@/components/Admin/Article/Editor";

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
