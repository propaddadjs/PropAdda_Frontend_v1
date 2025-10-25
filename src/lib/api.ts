// Author-Hemant Arora
import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
export const api = axios.create({
  baseURL: API_BASE ?? "https://api.propadda.in",
  withCredentials: true, // <= CRITICAL: send cookies (httpOnly refresh cookie)
});

// helpers for token storage (local/session)
function read(key: string) {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}
function write(key: string, val: string, persist: "local" | "session" = "local") {
  (persist === "local" ? localStorage : sessionStorage).setItem(key, val);
}
function remove(key: string) {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

export const token = {
  get access() { return read("accessToken"); },
  get refresh() { return read("refreshToken"); },
  set(access?: string, refresh?: string, persist: "local" | "session" = "local") {
    if (access) write("accessToken", access, persist);
    if (refresh) write("refreshToken", refresh, persist);
  },
  clear() {
    remove("accessToken"); remove("refreshToken");
  }
};

// Attach Authorization header if access token present
api.interceptors.request.use(cfg => {
  const t = token.access;
  if (t) {
    cfg.headers = cfg.headers ?? {};
    cfg.headers.Authorization = `Bearer ${t}`;
  }
  return cfg;
});

/**
 * Try refresh using httpOnly cookie (server must set cookie on login).
 * Returns { accessToken?, user? } or throws.
 */
export async function tryRefreshViaCookie() {
  // Make a direct axios call (not using api instance defaults) with credentials to refresh
  // Note: api already sets withCredentials; using it here is fine.
  const resp = await api.get("/auth/refresh"); // server should read refresh cookie and return accessToken + user
  return resp.data;
}

export type UploadSessionFileRequest = {
  name: string;
  contentType: string;
  size: number;
};

export type UploadSessionFileResponse = {
  fileIndex: number;
  objectName: string;
  sessionUrl: string;
  contentType: string;
};

export type UploadSessionResponse = {
  uploadId: string;
  files: UploadSessionFileResponse[];
};

/**
 * Create a resumable upload session for the given files.
 * - files: array of { name, contentType, size }
 * - userId: optional (owner id)
 *
 * Returns UploadSessionResponse
 */
export async function createUploadSession(files: UploadSessionFileRequest[], userId?: number) {
  const resp = await api.post<UploadSessionResponse>("/api/uploads/sessions", { files, userId });
  return resp.data;
}

export default api;
