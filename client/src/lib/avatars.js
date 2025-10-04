import { supabase } from "./supabaseClient";
import { v4 as uuid } from "uuid";

//bucket เป็น Public
export async function uploadAvatar(file, userId) {
    const ext = file.name.split(".").pop().toLowerCase();
    const path = `${userId}/${uuid()}.${ext}`;

    const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: false, cacheControl: "3600" });
    if (upErr) throw upErr;

    // public
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return { path, publicUrl: data.publicUrl };
}

// ลบรูปเดิม
export async function removeAvatar(oldPath) {
    if (!oldPath) return;
    await supabase.storage.from("avatars").remove([oldPath]).catch(() => { });
}
