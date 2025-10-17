import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; // <- correct default import
import api, { token, tryRefreshViaCookie } from "../lib/api"; // <- import tryRefreshViaCookie
// ... keep other imports if any

type Role = "ADMIN" | "AGENT" | "BUYER";
export type KycStatus = "INAPPLICABLE" | "PENDING" | "APPROVED" | "REJECTED" | null;

export interface AuthUser {
  userId: number;
  email: string;
  role: Role;
  kycVerified: KycStatus;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  state?: string;
  city?: string;
  profileImageUrl?: string;
}

type Geo = {
  stateIso?: string;
  stateName?: string;
  city?: string;
};

type AuthCtx = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean; // <-- expose loading so guards can wait
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    firstName: string; lastName: string; email: string; phoneNumber: string;
    state: string; city: string; password: string;
  }) => Promise<void>;
  logout: () => void;
  refreshKyc: () => Promise<KycStatus | null>;
  hasRole: (...roles: Role[]) => boolean;
  canEnterAgentPanel: boolean;
  geo: Geo;
  setGeo: (g: Geo) => void;
};

const Ctx = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(Ctx);

type JwtPayload = { sub: string; role?: string };

function parseRole(claim?: string): Role {
  if (!claim) return "BUYER";
  const clean = claim.startsWith("ROLE_") ? claim.slice(5) : claim;
  return (["ADMIN", "AGENT", "BUYER"].includes(clean) ? (clean as Role) : "BUYER");
}

function pickUser(data: any): AuthUser | null {
  if (!data) return null;
  if (data.user) return data.user as AuthUser;

  const possible: Partial<AuthUser> = {
    userId: data.userId,
    email: data.email,
    role: data.role,
    kycVerified: data.kycVerified,
    firstName: data.firstName,
    lastName: data.lastName,
    phoneNumber: data.phoneNumber,
    state: data.state,
    city: data.city,
    profileImageUrl: data.profileImageUrl,
  };
  if (!possible.email) return null;
  return {
    userId: Number(possible.userId ?? 0),
    email: String(possible.email),
    role: (possible.role as Role) ?? "BUYER",
    kycVerified: (possible.kycVerified as KycStatus) ?? null,
    firstName: possible.firstName,
    lastName: possible.lastName,
    phoneNumber: possible.phoneNumber,
    state: possible.state,
    city: possible.city,
    profileImageUrl: possible.profileImageUrl,
  };
}

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [geo, setGeo] = useState<Geo>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Rehydrate on mount:
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // try /auth/me first (works if access token present and valid)
        const meResp = await api.get("/auth/me");
        if (!mounted) return;
        const embedded = pickUser(meResp.data);
        if (embedded) {
          setUser(embedded);
          // if server returned a new access token, persist and set header
          if (meResp.data.accessToken) {
            token.set(meResp.data.accessToken, meResp.data.refreshToken);
            api.defaults.headers.common["Authorization"] = `Bearer ${meResp.data.accessToken}`;
          }
          setLoading(false);
          return;
        }
      } catch (err) {
        // /auth/me failed - try refresh via cookie
        try {
          const refreshResp = await tryRefreshViaCookie(); // must be exported from ../lib/api
          if (!mounted) return;
          const newAccess = refreshResp?.accessToken ?? refreshResp?.token ?? null;
          if (newAccess) {
            token.set(newAccess, refreshResp.refreshToken ?? token.refresh);
            api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
          }
          const embeddedFromRefresh = pickUser(refreshResp) || (refreshResp?.user ?? null);
          if (embeddedFromRefresh) {
            setUser(embeddedFromRefresh);
            setLoading(false);
            return;
          }
          // fallback: call /auth/me again now that we have an access token (if provided)
          try {
            const me2 = await api.get("/auth/me");
            if (!mounted) return;
            const emb2 = pickUser(me2.data);
            if (emb2) setUser(emb2);
          } catch {
            // final fallback: decode access token if available
            const at = token.access;
            if (at) {
              try {
                const decoded = jwtDecode<JwtPayload>(at);
                setUser({ userId: 0, email: decoded.sub!, role: parseRole(decoded.role), kycVerified: null });
              } catch {
                token.clear();
                setUser(null);
              }
            } else {
              setUser(null);
            }
          }
        } catch (refreshErr) {
          token.clear();
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const isAuthenticated = !!user;

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    token.set(data.accessToken, data.refreshToken);
    if (data.accessToken) api.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
    const embedded = pickUser(data);
    if (embedded) {
      setUser(embedded);
      return;
    }
    const decoded = jwtDecode<JwtPayload>(data.accessToken);
    setUser({
      userId: Number(data.userId ?? 0),
      email: decoded.sub!,
      role: parseRole(decoded.role) ?? (data.role as Role) ?? "BUYER",
      kycVerified: (data.kycVerified as KycStatus) ?? null,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      state: data.state,
      city: data.city,
      profileImageUrl: data.profileImageUrl,
    });
  }

  async function register(payload: {
    firstName: string; lastName: string; email: string; phoneNumber: string;
    state: string; city: string; password: string;
  }) {
    const { data } = await api.post("/auth/register", payload);
    token.set(data.accessToken, data.refreshToken);
    if (data.accessToken) api.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
    const embedded = pickUser(data);
    if (embedded) {
      setUser(embedded);
      return;
    }
    const decoded = jwtDecode<JwtPayload>(data.accessToken);
    setUser({
      userId: Number(data.userId ?? 0),
      email: decoded.sub!,
      role: parseRole(decoded.role) ?? (data.role as Role) ?? "BUYER",
      kycVerified: (data.kycVerified as KycStatus) ?? null,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      state: data.state,
      city: data.city,
      profileImageUrl: data.profileImageUrl,
    });
  }

  async function logout() {
    try {
      // read current access token BEFORE clearing it
      const currentAccess = token.access;

      // send logout request to backend; include Authorization explicitly as a fallback
      await api.post(
        "/auth/logout",
        {},
        {
          headers: {
            // include header only if token exists
            ...(currentAccess ? { Authorization: `Bearer ${currentAccess}` } : {}),
          },
          // withCredentials: true, // enable only if backend expects/uses httpOnly cookie
        }
      );
    } catch (err) {
      // Log but do not block local logout — server might reject but we still want to clear local auth
      console.warn("Logout request failed (server):", err);
    } finally {
      // Always clear tokens and user state locally
      token.clear();
      setUser(null);
    }
  }

  async function refreshKyc(): Promise<KycStatus | null> {
    if (!user) return null;
    try {
      const { data } = await api.get("/user/kycStatus");
      const k: KycStatus = data.kycStatus ?? data.kycVerified ?? null;
      setUser(prev => (prev ? { ...prev, kycVerified: k } : prev));
      return k;
    } catch {
      return null;
    }
  }

  const hasRole = (...roles: Role[]) => !!user && roles.includes(user.role);
  const canEnterAgentPanel = !!user && user.role === "AGENT" && user.kycVerified === "APPROVED";

  const value: AuthCtx = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    refreshKyc,
    hasRole,
    canEnterAgentPanel,
    geo,
    setGeo,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
