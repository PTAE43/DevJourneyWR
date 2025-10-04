export function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
}

export function validatePassword(v, min = 6) {
    return String(v).length >= min;
}

export function validateUsername(v) {
    const s = String(v).trim();
    const hasThai = /[\u0E00-\u0E7F]/.test(s);
    const allowed = /^[a-zA-Z0-9._-]{3,24}$/.test(s);
    return !hasThai && allowed;
}

export function friendlyAuthError(msg = "") {
    const m = msg.toLowerCase();
    if (m.includes("already registered")) return "อีเมลนี้ถูกใช้แล้ว กรุณาใช้อีเมลอื่น";
    if (m.includes("invalid login credentials")) return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
    if (m.includes("password should be at least")) return "รหัสผ่านสั้นเกินไป (อย่างน้อย 6 ตัวอักษร)";
    if (m.includes("invalid email")) return "รูปแบบอีเมลไม่ถูกต้อง";
    return msg || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
}