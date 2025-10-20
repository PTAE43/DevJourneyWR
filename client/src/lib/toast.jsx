import React from "react";
import { toaster } from "rsuite";
import AppToast from "@/components/Toast/AppToast";

export function showToast(status, title, description = "", opts = {}) {
    const { duration = 4000, placement = "bottomCenter" } = opts;
    return toaster.push(
        <AppToast status={status} title={title} description={description} />,
        { duration, placement }
    );
}

const toast = {
    success: (title, description, opts) => showToast("success", title, description, opts),
    error: (title, description, opts) => showToast("error", title, description, opts),
    warning: (title, description, opts) => showToast("warning", title, description, opts),
    info: (title, description, opts) => showToast("info", title, description, opts),
    remove: (key) => toaster.remove(key),
    clear: () => toaster.clear(),
};

export default toast;
