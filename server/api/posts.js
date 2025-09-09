import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const posts = require("../data/posts.json");

const norm = (s) => String(s ?? "").toLowerCase().trim();

export default function handler(req, res) {
    if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        return res.status(204).end();
    }
    res.setHeader("Access-Control-Allow-Origin", "*");

    const { category = "", page = "1", limit = "6", q = "" } = req.query || {};
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 6, 1);

    let list = posts.slice();
    if (category === "highlight") {
        list = list.filter(p => !!p.highlight);
    }
    else if (category && category !== "all") {
        list = list.filter(p => norm(p.category) === norm(category));
    }

    const totalItems = list.length;
    const start = (pageNum - 1) * pageSize;
    const data = list.slice(start, start + pageSize);

    res.status(200).json({
        posts: data,
        totalItems,
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / pageSize),
        pageSize,
    });
};
