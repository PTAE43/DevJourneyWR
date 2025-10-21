import React from "react";
import { Message, toaster } from "rsuite";

const BASE = { placement: "bottomEnd", duration: 4000 };
const SLOTS = new Map();
const SLOT_MAX_MS = 4000;
const ANIM_MS = 320;

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

function trackSlot(slot, key) {
    const prev = SLOTS.get(slot);
    if (prev?.timer) clearTimeout(prev.timer);
    const timer = setTimeout(() => { try { toaster.remove(key); } catch { }; SLOTS.delete(slot); }, SLOT_MAX_MS);
    SLOTS.set(slot, { key, timer });
}

function getSlot(slot) { return SLOTS.get(slot); }
function clearSlot(slot) {
    const e = SLOTS.get(slot);
    if (!e) return;
    try { toaster.remove(e.key); } catch { }
    if (e.timer) clearTimeout(e.timer);
    SLOTS.delete(slot);
}

export function showToast(type, title, description = "", opts = {}) {
    const node = (
        <Message type={type} closable className="rounded-xl shadow-lg min-w-[700px]">
            {title && <div className="font-semibold">{title}</div>}
            {description ? <div className="text-sm mt-0.5">{description}</div> : null}
        </Message>
    );
    return toaster.push(node, { ...BASE, ...opts });
}

const toast = {
    success: (t, d, o) => showToast("success", t, d, o),
    error: (t, d, o) => showToast("error", t, d, o),
    warning: (t, d, o) => showToast("warning", t, d, o),
    info: (t, d, o) => showToast("info", t, d, o),

    // เดิมคุณตั้ง duration=2000 ที่ loading; คงไว้ตามเดิม
    loading: (t = "Loading…", d, o) => showToast("info", t, d, { duration: 2000, ...(o || {}) }),

    remove: (k) => toaster.remove(k),
    clear: () => toaster.clear(),

    // เปิด loading ใน slot
    loadingIn(slot, title = "Loading…", description, opts) {
        if (!slot) return this.loading(title, description, opts);
        clearSlot(slot);
        const key = showToast("info", title, description, { duration: 2000, ...(opts || {}) });
        trackSlot(slot, key);
        return key;
    },

    async replaceIn(slot, type, title, description, opts) {
        const e = slot && getSlot(slot);
        const content = (
            <Message type={type} closable className="rounded-xl shadow-lg min-w-[700px]">
                {title && <div className="font-semibold">{title}</div>}
                {description ? <div className="text-sm mt-0.5">{description}</div> : null}
            </Message>
        );

        if (e && typeof toaster.update === "function") {
            toaster.update(e.key, { content, duration: (opts?.duration ?? BASE.duration), placement: (opts?.placement ?? BASE.placement) });
            if (e.timer) clearTimeout(e.timer);
            const dur = opts?.duration ?? BASE.duration;
            const timer = setTimeout(() => { try { toaster.remove(e.key); } catch { }; SLOTS.delete(slot); }, dur + 500);
            SLOTS.set(slot, { key: e.key, timer });
            return e.key;
        }

        if (e) { try { toaster.remove(e.key); } catch { }; SLOTS.delete(slot); await wait(ANIM_MS); }
        return showToast(type, title, description, opts);
    },

    // ใช้ตอนออกจากหน้า
    flushSlot(slot) { clearSlot(slot); },

    // ====== เพิ่ม helper ปิด loading แล้วแสดงผลลัพธ์ ======
    // keyOrSlot: จะส่งเป็น key จริง หรือชื่อ slot ก็ได้
    settleSuccess(keyOrSlot, title = "Done.", description = "", opts) {
        try {
            if (SLOTS.has(keyOrSlot)) {
                const e = SLOTS.get(keyOrSlot);
                if (e) { try { toaster.remove(e.key); } catch { } SLOTS.delete(keyOrSlot); }
            } else if (keyOrSlot != null) {
                try { toaster.remove(keyOrSlot); } catch { }
            }
        } catch { /* ignore */ }
        return showToast("success", title, description, opts);
    },

    settleError(keyOrSlot, err, title = "Error", opts) {
        try {
            if (SLOTS.has(keyOrSlot)) {
                const e = SLOTS.get(keyOrSlot);
                if (e) { try { toaster.remove(e.key); } catch { } SLOTS.delete(keyOrSlot); }
            } else if (keyOrSlot != null) {
                try { toaster.remove(keyOrSlot); } catch { }
            }
        } catch { /* ignore */ }
        const msg = typeof err === "string" ? err : err?.message || "Something went wrong";
        return showToast("error", title, msg, opts);
    },
};

export default toast;


//แก้ปัญหา loading ค้าง ไม่ยอดปิดอัตโนมัติ

// toast.success("Welcome, admin.");
// toast.error(String(e.message));
