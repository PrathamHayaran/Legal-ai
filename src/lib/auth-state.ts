export type UserRole = "User" | "Lawyer" | "Admin";
export type VerificationStatus = "pending" | "approved" | "rejected";

export type SessionState = {
  id: string | null;
  role: UserRole;
  lawyerVerified: boolean;
  verificationStatus: VerificationStatus;
  email: string | null;
};

export type LawyerProfile = {
  id: string;
  name: string;
  email: string;
  role: "Lawyer";
  status: VerificationStatus;
  practiceArea: string;
  location: string;
  rating: number;
  experience: string;
  fee: string;
};

const SESSION_KEY = "legalos-session";
const LAWYER_PROFILES_KEY = "legalos-lawyer-profiles";

const defaultProfiles: LawyerProfile[] = [
  {
    id: "maya-patel",
    name: "Maya Patel",
    email: "maya@legalos.com",
    role: "Lawyer",
    status: "approved",
    practiceArea: "Commercial Contracts",
    location: "London, UK",
    rating: 4.9,
    experience: "12 years",
    fee: "$280/hr",
  },
  {
    id: "jorge-alvarez",
    name: "Jorge Alvarez",
    email: "jorge@legalos.com",
    role: "Lawyer",
    status: "pending",
    practiceArea: "IP & Licensing",
    location: "Austin, TX",
    rating: 4.8,
    experience: "9 years",
    fee: "$320/hr",
  },
  {
    id: "sofia-nguyen",
    name: "Sofia Nguyen",
    email: "sofia@legalos.com",
    role: "Lawyer",
    status: "rejected",
    practiceArea: "Employment",
    location: "Singapore",
    rating: 4.9,
    experience: "11 years",
    fee: "$260/hr",
  },
];

function getStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredValue<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getSession(): SessionState {
  if (typeof window === "undefined") {
    return { id: null, role: "User", lawyerVerified: true, verificationStatus: "approved", email: null };
  }

  try {
    const stored = window.localStorage.getItem(SESSION_KEY);
    if (!stored) {
      return { id: null, role: "User", lawyerVerified: true, verificationStatus: "approved", email: null };
    }

    const parsed = JSON.parse(stored) as Partial<SessionState>;
    const role = parsed.role ?? "User";
    const verificationStatus = parsed.verificationStatus ?? (role === "Lawyer" ? "pending" : "approved");

    return {
      id: parsed.id ?? null,
      role,
      lawyerVerified: role !== "Lawyer" ? true : verificationStatus === "approved",
      verificationStatus,
      email: parsed.email ?? null,
    };
  } catch {
    return { id: null, role: "User", lawyerVerified: true, verificationStatus: "approved", email: null };
  }
}

export function setSession(session: SessionState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
}

export async function refreshSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const response = await fetch("/api/auth/me");
    if (!response.ok) {
      clearSession();
      return null;
    }

    const data = await response.json();
    const user = data.user;
    if (!user) {
      clearSession();
      return null;
    }

    const verificationStatus = user.role === "LAWYER" ? (user.lawyerProfile?.verificationStatus ?? "PENDING") : "APPROVED";
    const session = {
      id: user.id,
      role: user.role === "LAWYER" ? "Lawyer" : user.role === "ADMIN" ? "Admin" : "User",
      lawyerVerified: user.role !== "LAWYER" || verificationStatus === "APPROVED",
      verificationStatus:
        verificationStatus === "APPROVED"
          ? "approved"
          : verificationStatus === "REJECTED"
          ? "rejected"
          : "pending",
      email: user.email ?? null,
    } as SessionState;

    setSession(session);
    return session;
  } catch {
    clearSession();
    return null;
  }
}

export async function logout() {
  if (typeof window === "undefined") {
    return;
  }

  clearSession();
  await fetch("/api/auth/signout", { method: "POST" });
}

export function getLawyerProfiles(): LawyerProfile[] {
  return getStoredValue(LAWYER_PROFILES_KEY, defaultProfiles);
}

export function updateLawyerProfile(email: string, updates: Partial<LawyerProfile>) {
  const profiles = getLawyerProfiles();
  const existing = profiles.find((profile) => profile.email === email);
  const nextProfile = existing
    ? { ...existing, ...updates }
    : {
        id: email,
        name: email,
        email,
        role: "Lawyer" as const,
        status: "pending" as VerificationStatus,
        practiceArea: "General",
        location: "Remote",
        rating: 4.8,
        experience: "New",
        fee: "$250/hr",
        ...updates,
      };

  const nextProfiles = existing
    ? profiles.map((profile) => (profile.email === email ? nextProfile : profile))
    : [...profiles, nextProfile];

  setStoredValue(LAWYER_PROFILES_KEY, nextProfiles);
  return nextProfiles;
}

export function setLawyerVerificationStatus(email: string, status: VerificationStatus) {
  const profiles = updateLawyerProfile(email, { status });

  const session = getSession();
  if (session.email === email && session.role === "Lawyer") {
    setSession({
      ...session,
      verificationStatus: status,
      lawyerVerified: status === "approved",
    });
  }

  return profiles;
}

export function isProtectedPath(pathname: string) {
  return ["/dashboard", "/generate", "/analyze", "/lawyers", "/admin", "/verify"].includes(pathname);
}
