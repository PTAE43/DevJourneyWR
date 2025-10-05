import { api } from "./api";

export async function getLikeStatus(postId) {
    return api.get("/likes", { params: { postId } }); // { liked, count }
}

export async function likePost(postId) {
    return api.post("/likes", { body: { postId } });  // { liked:true, count }
}

export async function unlikePost(postId) {
    return api.delete("/likes", { params: { postId } }); // { liked:false, count }
}
