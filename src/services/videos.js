import { apiRequest } from "./api.js";

function unwrap(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  return [];
}

export async function getVideos() {
  return unwrap(await apiRequest("/videos"));
}

export async function createVideo(data, file = null) {
  const body = new FormData();

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null && value !== "") {
      body.append(key, value);
    }
  }

  if (file) body.append("videoFile", file);

  return apiRequest("/videos", { method: "POST", body });
}

export async function deleteVideo(id) {
  return apiRequest(`/videos/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}
