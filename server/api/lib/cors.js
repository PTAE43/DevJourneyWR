const DEFAULT_ALLOW = [
    'http://localhost:5173',            // dev
    'https://dev-journey-wr.vercel.app', // prod
];

export function applyCors(req, res, allowList = DEFAULT_ALLOW) {
    const origin = req.headers.origin;
    const allow = Array.isArray(allowList) && allowList.length ? allowList : DEFAULT_ALLOW;

    // เลือก origin ที่อนุญาต
    const allowedOrigin = origin && allow.includes(origin) ? origin : allow[0];

    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');

    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With');

    // cache ผล preflight เพื่อลด OPTIONS ซ้ำ ๆ
    res.setHeader('Access-Control-Max-Age', '600');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204; // No Content
        res.end();
        return true;
    }
    return false;
}
