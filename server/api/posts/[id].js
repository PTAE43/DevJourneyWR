import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const posts = require("../../data/posts.json");

export default function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const { id } = req.query || {};
    const found = posts.find((p) => String(p.id) === String(id));
    if (!found) return res.status(404).json({ message: "Not found" });
    res.status(200).json(found);
};
