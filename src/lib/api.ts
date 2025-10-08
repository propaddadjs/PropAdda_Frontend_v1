// src/lib/api.ts
import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
export const api = axios.create({ baseURL: API_BASE ?? "https://propadda-backend-v1-506455747754.asia-south2.run.app"});

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

api.interceptors.request.use(cfg => {
  const t = token.access;
  if (t) {
    cfg.headers = cfg.headers ?? {};
    cfg.headers.Authorization = `Bearer ${t}`;
  }
  return cfg;
});
