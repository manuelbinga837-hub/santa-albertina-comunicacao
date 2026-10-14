import { apiRequest } from "./api.js";

function prepareEventData(data) {
  if (data instanceof FormData) return data;
  return data;
}

export async function getEvents() {
  const response = await apiRequest("/events");
  return response?.data || [];
}

export async function createEvent(data) {
  const response = await apiRequest("/events", {
    method: "POST",
    body: prepareEventData(data)
  });

  return response?.data;
}

export async function deleteEvent(id) {
  const response = await apiRequest(`/events/${id}`, {
    method: "DELETE"
  });

  return response?.data;
}


export async function getEvent(id) {
  const response = await apiRequest(`/events/${id}`);
  return response?.data;
}

export async function updateEvent(id, data) {
  const response = await apiRequest(`/events/${id}`, {
    method: "PUT",
    body: prepareEventData(data)
  });

  return response?.data;
}
