export function formatBKK24(iso, { locale = 'en-GB' } = {}) {
    const d = new Date(iso);

    const date = new Intl.DateTimeFormat(locale, {
        timeZone: 'Asia/Bangkok',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(d);

    const time = new Intl.DateTimeFormat(locale, {
        timeZone: 'Asia/Bangkok',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(d);

    return `${date} at ${time}`; 
}