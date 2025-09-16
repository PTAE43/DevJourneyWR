export function applyCors(req, res) {
    const origin = req.headers.origin;
    const whitelist = (process.env.ALLOW_ORIGIN || "")
        .split(",").map(s => s.trim()).filter(Boolean);

    const allowed =
        whitelist.length === 0 || (origin && whitelist.includes(origin));

    res.setHeader("Access-Control-Allow-Origin", allowed ? (origin || "*") : whitelist[0] || "*");
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400");

    if (req.method === "OPTIONS") { res.status(204).end(); return true; }
    return false;
}
