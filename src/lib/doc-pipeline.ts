import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";
import { spawnSync } from "child_process";
import { tmpdir } from "os";
import { writeFileSync, mkdtempSync, readdirSync, readFileSync, unlinkSync, rmdirSync } from "fs";
import path from "path";

export type ProcessResult = {
  text: string;
  clauses: string[];
  riskAnalysis: any;
  summaries: any;
};

function cleanText(raw: string) {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/[\t\u0000\u0001\u0002\u0003]/g, " ")
    .replace(/\n{2,}/g, "\n\n")
    .trim();
}

function segmentClauses(text: string) {
  // Naive segmentation: split by double newlines or section headings
  const parts = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  // If very short segments, fallback to sentence chunks
  if (parts.length === 1) {
    return text.match(/[^.!?\n]+[.!?]?/g)?.map(s => s.trim()) ?? [text];
  }
  return parts;
}

async function extractTextFromImageBuffer(buffer: Buffer) {
  // Use tesseract.js to extract text from image buffer
  const { createWorker } = Tesseract;
  const worker = createWorker();
  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  const { data } = await worker.recognize(buffer);
  await worker.terminate();
  return data.text || "";
}

async function tryPdftoppmConvert(pdfBuffer: Buffer) {
  // Attempt to convert PDF to PNG images using pdftoppm (part of poppler)
  // This is best-effort and requires pdftoppm available on the host.
  const tmp = mkdtempSync(path.join(tmpdir(), "legalos-pdf-"));
  const inputPath = path.join(tmp, "input.pdf");
  writeFileSync(inputPath, pdfBuffer);
  const outPrefix = path.join(tmp, "page");

  const res = spawnSync("pdftoppm", ["-png", inputPath, outPrefix], { encoding: "utf8" });
  if (res.error) {
    // cleanup
    try { unlinkSync(inputPath); } catch {}
    try { rmdirSync(tmp); } catch {}
    return [];
  }

  // collect generated images
  const files = readdirSync(tmp).filter((f) => f.endsWith(".png")).map((f) => path.join(tmp, f));
  const images = files.map((f) => readFileSync(f));

  // cleanup input and generated files
  try { unlinkSync(inputPath); } catch {}
  for (const f of files) try { unlinkSync(f); } catch {}
  try { rmdirSync(tmp); } catch {}

  return images;
}

export async function extractText(buffer: Buffer, filename: string, mimeType?: string) {
  const ext = path.extname(filename || "").toLowerCase();

  try {
    if (mimeType?.startsWith("image/") || [".png", ".jpg", ".jpeg"].includes(ext)) {
      return await extractTextFromImageBuffer(buffer);
    }

    if (ext === ".txt") {
      return buffer.toString("utf8");
    }

    if (ext === ".docx") {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    }

    if (ext === ".pdf") {
      const pdf = await pdfParse(buffer as any);
      const text = (pdf?.text || "").trim();
      if (text.length > 120) {
        return text;
      }

      // Likely scanned PDF — try pdftoppm -> tesseract
      const images = await tryPdftoppmConvert(buffer);
      if (images.length) {
        let agg = "";
        for (const img of images) {
          const pageText = await extractTextFromImageBuffer(img as Buffer);
          agg += "\n\n" + pageText;
        }
        return agg.trim();
      }

      // Fallback: run OCR on entire PDF buffer as an image (may not work)
      try {
        const fallbackText = await extractTextFromImageBuffer(buffer);
        return fallbackText;
      } catch (e) {
        return text; // return whatever pdf-parse got
      }
    }

    // Unknown type: try to decode as text first
    const asText = buffer.toString("utf8");
    if (asText && asText.length > 120) return asText;

    // final fallback: OCR
    return await extractTextFromImageBuffer(buffer);
  } catch (err) {
    console.error("extractText error:", err);
    return "";
  }
}

async function analyzeRisksWithAI(text: string, clauses: string[]) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // simple heuristic fallback
    const keywords = ["liability", "indemnity", "warranty", "termination", "governing law", "jurisdiction"];
    const risks: any = {};
    for (const kw of keywords) {
      risks[kw] = text.toLowerCase().includes(kw) ? "present" : "absent";
    }
    return { heuristics: risks };
  }

  // call OpenAI Chat Completions
  try {
    const prompt = `Perform a concise risk analysis for the following contract text. Highlight top 5 risks and associate clause excerpts.\n\nText:\n${text.slice(0, 3000)}`;
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], max_tokens: 800 }),
    });
    const json = await res.json();
    const ans = json?.choices?.[0]?.message?.content ?? "";
    return { ai: ans };
  } catch (err) {
    console.error("AI risk analysis failed:", err);
    return { error: String(err) };
  }
}

async function generateSummariesWithAI(clauses: string[]) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return clauses.map((c) => ({ clause: c.slice(0, 200), explanation: "No AI key provided; enable OPENAI_API_KEY for explanations." }));
  }

  const prompt = `For each clause text provided, produce a short plain-language explanation and a suggested redline change if needed. Return JSON array of {explanation, suggestion}.\n`;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt + JSON.stringify(clauses.slice(0, 50)) }], max_tokens: 1500 }),
    });
    const json = await res.json();
    const ans = json?.choices?.[0]?.message?.content ?? "";
    // Attempt to parse JSON, but fallback to raw text
    try {
      return JSON.parse(ans);
    } catch {
      return { raw: ans };
    }
  } catch (err) {
    console.error("AI summary failed:", err);
    return { error: String(err) };
  }
}

export async function processDocument(buffer: Buffer, filename: string, mimeType?: string): Promise<ProcessResult> {
  const raw = await extractText(buffer, filename, mimeType);
  const cleaned = cleanText(raw || "");
  const clauses = segmentClauses(cleaned);
  const riskAnalysis = await analyzeRisksWithAI(cleaned, clauses);
  const summaries = await generateSummariesWithAI(clauses.slice(0, 50));
  return { text: cleaned, clauses, riskAnalysis, summaries };
}
