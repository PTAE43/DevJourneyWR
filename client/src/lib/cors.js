export function applyCors(req, res) {
    const origin = req.headers.origin || '*';

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With'
    );

    res.setHeader('Access-Control-Max-Age', '86400'); // cache preflight 1 วัน

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return true;
    }
    return false;
}