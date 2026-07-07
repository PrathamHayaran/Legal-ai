export type ContractClause = {
  id: string;
  number: number;
  text: string;
  category?: string;
  severity?: "Low" | "Medium" | "High";
  confidence?: number;
};

export type ContractRiskCategory = {
  category: string;
  severity: "Low" | "Medium" | "High";
  score: number;
  description: string;
};

export type ContractRiskAnalysis = {
  overallRiskScore: number;
  confidence: number;
  businessImpact: string;
  legalImpact: string;
  categories: ContractRiskCategory[];
  clauseRisks: Array<ContractClause>;
  summary: string;
};

export type ContractDraftResponse = {
  ok: boolean;
  draft?: string;
  clauses?: ContractClause[];
  versionId?: string;
  error?: string;
};

export type ContractAnalysisResponse = {
  ok: boolean;
  text?: string;
  clauses?: ContractClause[];
  riskAnalysis?: ContractRiskAnalysis;
  summaries?: Array<{ clauseId: string; explanation: string; suggestion: string }>;
  error?: string;
};

export type ContractChatResponse = {
  ok: boolean;
  answer?: string;
  confidence?: number;
  references?: string[];
  highlight?: string;
  reasoning?: string;
  error?: string;
};

export async function generateContractDraft(template: string, prompt: string, metadata: Record<string, string>) {
  const res = await fetch("/api/contract/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ template, prompt, metadata }),
  });
  return res.ok ? (await res.json()) : { ok: false, error: await res.text() };
}

export async function analyzeContractFile(file: File) {
  const formData = new FormData();
  formData.append("document", file);

  const res = await fetch("/api/contract/analyze", {
    method: "POST",
    body: formData,
  });

  return res.ok ? (await res.json()) : { ok: false, error: await res.text() };
}

export async function chatContractDocument(documentText: string, question: string) {
  const res = await fetch("/api/contract/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documentText, question }),
  });

  return res.ok ? (await res.json()) : { ok: false, error: await res.text() };
}
