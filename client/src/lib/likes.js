import { api } from "./api.js";

export const getLikeStatus = async (postId) => {
    const { data } = await api.get("likes", { params: { postId } });
    return data; //เก็บ liked,count
}

export const likePost = async (postId) => {
    const { data } = await api.post("/likes", { postId });
    return data; //เก็บ liked = true , count
}

export const unlikePost = async (postId) => {
    const { data } = await api.delete("/likes", { params: { postId } });
    return data; //เก็บ liked = false , count
}