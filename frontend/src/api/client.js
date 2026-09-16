// Thin wrapper around fetch for talking to the FastAPI backend.
// Extend this as new endpoints are added (pagination, rename, delete...).

const BASE = "/api";

function extractErrorMessage(data, status) {
  if (data && typeof data.detail === "string") {
    return data.detail;
  }
  if (data && Array.isArray(data.detail) && data.detail[0]?.msg) {
    return data.detail[0].msg;
  }
  return `Request failed with status ${status}`;
}

async function parseJsonResponse(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(extractErrorMessage(data, res.status));
  }
  return data;
}

export async function createConversation(title) {
  const res = await fetch(`${BASE}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return parseJsonResponse(res);
}

export async function listConversations({ limit, offset } = {}) {
  const params = new URLSearchParams();
  if (limit !== undefined) params.set("limit", limit);
  if (offset !== undefined) params.set("offset", offset);
  const query = params.toString();
  const res = await fetch(`${BASE}/conversations${query ? `?${query}` : ""}`);
  return parseJsonResponse(res);
}

export async function getConversation(id) {
  const res = await fetch(`${BASE}/conversations/${id}`);
  return parseJsonResponse(res);
}

export async function sendMessage(conversationId, content) {
  const res = await fetch(`${BASE}/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return parseJsonResponse(res);
}
