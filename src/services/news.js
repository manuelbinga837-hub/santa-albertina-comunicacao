import { apiRequest } from "./api.js";

export async function getNews() {
  const response = await apiRequest("/news");

  return response?.data || [];
}

export async function createNews(data) {
  const response = await apiRequest("/news", {
    method: "POST",
    body: data
  });

  return response?.data;
}
