import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { api, token } from "../lib/api";

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
  state?: string;      // human-readable state name
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
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    firstName: string; lastName: string; email: string; phoneNumber: string;
    state: string; city: string; password: string;   // 'state' should be the NAME (not iso)
  }) => Promise<void>;
  logout: () => void;
  refreshKyc: () => Promise<KycStatus | null>;
  hasRole: (...roles: Role[]) => boolean;
  canEnterAgentPanel: boolean;

  // global state/city for header/hero/search
  geo: Geo;
  setGeo: (g: Geo) => void;
};

const Ctx = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(Ctx);

type JwtPayload = { sub: string; role?: string };

// normalize "ROLE_ADMIN" → "ADMIN"
function parseRole(claim?: string): Role {
  if (!claim) return "BUYER";
  const clean = claim.startsWith("ROLE_") ? claim.slice(5) : claim;
  return (["ADMIN", "AGENT", "BUYER"].includes(clean) ? (clean as Role) : "BUYER");
}

// Try to build an AuthUser from login/register response
function pickUser(data: any): AuthUser | null {
  if (!data) return null;
  // backend might return { accessToken, refreshToken, user: {...} }
  if (data.user) return data.user as AuthUser;

  // or { accessToken, refreshToken, ...flat }
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

  // On mount, if we already have an access token, derive minimal user from JWT.
  // (If your backend exposes /auth/me you can call it here to hydrate full profile.)
  // useEffect(() => {
  //   const at = token.access;
  //   if (!at) return;
  //   try {
  //     const decoded = jwtDecode<JwtPayload>(at);
  //     setUser((prev) => ({
  //       userId: prev?.userId ?? 0,
  //       email: decoded.sub!,
  //       role: parseRole(decoded.role),
  //       kycVerified: prev?.kycVerified ?? null,
  //       firstName: prev?.firstName,
  //       lastName: prev?.lastName,
  //       phoneNumber: prev?.phoneNumber,
  //       state: prev?.state,
  //       city: prev?.city,
  //       profileImageUrl: prev?.profileImageUrl,
  //     }));
  //   } catch {
  //     token.clear();
  //     setUser(null);
  //   }
  // }, []);

  useEffect(() => {
    const at = token.access;
    if (!at) return;
    (async () => {
      try {
        const { data } = await api.get("/auth/me");     // carries Bearer from interceptor
        const embedded = pickUser(data);
        if (embedded) setUser(embedded);
      } catch {
        // fallback to decoded
        try {
          const decoded = jwtDecode<JwtPayload>(at);
          setUser({ userId: 0, email: decoded.sub!, role: parseRole(decoded.role), kycVerified: null });
        } catch { token.clear(); setUser(null); }
      }
    })();
  }, []);

  const isAuthenticated = !!user;

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    token.set(data.accessToken, data.refreshToken);

    // Prefer full user payload if present, else combine JWT + flat fields
    const embedded = pickUser(data);
    if (embedded) {
      setUser(embedded);
      return;
    }

    // fallback: decode role/email from token and use flat fields if they exist
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
    state: string; city: string; password: string;   // IMPORTANT: state is NAME
  }) {
    const { data } = await api.post("/auth/register", payload);
    token.set(data.accessToken, data.refreshToken);

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
      state: data.state, // save NAME (your signup already sends name)
      city: data.city,
      profileImageUrl: data.profileImageUrl,
    });
  }

  function logout() {
    token.clear();
    setUser(null);
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
