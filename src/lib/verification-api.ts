export type VerificationStage =
  | "PENDING"
  | "PARTIALLY_VERIFIED"
  | "IDENTITY_VERIFIED"
  | "BAR_VERIFIED"
  | "FULLY_VERIFIED"
  | "REJECTED";

export type VerificationResult = {
  id: string;
  userId: string;
  status: VerificationStage;
  confidence: number;
  extractedData: {
    agg?: Record<string, any>;
    extractedAll?: Array<{ docId: string; parsed: Record<string, any>; textSnippet: string }>;
  };
  mismatches?: string | null;
  providerResponses?: Record<string, any>;
  documents?: Array<{ id: string; title: string; fileName: string; mimeType: string; createdAt: string }>;
  history?: Array<{ id: string; action: string; details?: string | null; performedByUserId?: string | null; createdAt: string }>;
  createdAt: string;
  updatedAt: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  channel: string;
  readAt?: string | null;
  createdAt: string;
};

export type AdminStats = {
  pendingVerifications: number;
  approvedToday: number;
  rejected: number;
  averageConfidence: number;
  averageReviewTimeHours: number;
};

export async function fetchVerificationStatus() {
  const res = await fetch("/api/verify/status", { cache: "no-store" });
  return res.ok ? (await res.json()) : null;
}

export async function uploadVerificationDocument(file: File, storageKey: string) {
  const formData = new FormData();
  formData.append("title", file.name);
  formData.append("storageKey", storageKey);
  formData.append("file", file);

  const res = await fetch("/api/verify/uploads", {
    method: "POST",
    body: formData,
  });

  return res.ok ? (await res.json()) : { error: await res.text() };
}

export async function verifyFace(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/verify/face", {
    method: "POST",
    body: formData,
  });

  return res.ok ? (await res.json()) : { error: await res.text() };
}

export async function runVerification() {
  const res = await fetch("/api/verify/run", {
    method: "POST",
  });
  return res.ok ? (await res.json()) : { error: await res.text() };
}

export async function fetchAdminStats(): Promise<{ ok: boolean; stats?: AdminStats }> {
  const res = await fetch("/api/admin/verify/stats", { cache: "no-store" });
  return res.ok ? (await res.json()) : { ok: false };
}

export async function fetchAdminRequests() {
  const res = await fetch("/api/admin/verify/requests", { cache: "no-store" });
  return res.ok ? (await res.json()) : { ok: false };
}

export async function fetchAdminVerificationDetails(userId: string) {
  const res = await fetch(`/api/admin/verify/${userId}`, { cache: "no-store" });
  return res.ok ? (await res.json()) : { ok: false };
}

export async function fetchNotifications() {
  const res = await fetch("/api/notifications", { cache: "no-store" });
  return res.ok ? (await res.json()) : { ok: false };
}

export async function submitVerificationProfile(payload: Record<string, any>) {
  const res = await fetch("/api/lawyers/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.ok ? (await res.json()) : { error: await res.text() };
}

export async function performAdminAction(payload: { verificationId: string; action: string; reason?: string }) {
  const res = await fetch("/api/admin/verify/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.ok ? (await res.json()) : { error: await res.text() };
}
