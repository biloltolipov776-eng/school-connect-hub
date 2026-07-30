import { supabase } from "@/integrations/supabase/client";

// All AI calls now go through Lovable AI Gateway via edge functions.
// No client-side API keys are needed anymore.

// ─── Legacy key helpers (kept as no-ops for backwards compatibility) ─────────
export async function saveGeminiKeyToCloud(key: string): Promise<void> {
  // Kept for Settings UI compatibility; no longer used at runtime.
  try {
    localStorage.setItem("app-gemini-key", key);
  } catch {
    // ignore
  }
}

// ─── In-memory completion cache ───────────────────────────────────────────────
const completionCache = new Map<string, { text: string; time: number }>();
const CACHE_TTL = 30_000;

function cleanCode(text: string): string {
  return text.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/g, "").trim();
}

async function invoke<T = any>(fn: string, body: any, timeoutMs = 30000): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const { data, error } = await supabase.functions.invoke(fn, { body });
    if (error) {
      console.error(`[${fn}] invoke error:`, error);
      return null;
    }
    return data as T;
  } catch (e) {
    console.error(`[${fn}] exception:`, e);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Exported functions ───────────────────────────────────────────────────────

export async function getCodeCompletion(
  codeBefore: string,
  language: string,
  codeAfter: string = "",
  _externalSignal?: AbortSignal
): Promise<string> {
  if (codeBefore.length < 3) return "";

  const cacheKey = language + ":" + codeBefore.slice(-200);
  const cached = completionCache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL) return cached.text;

  const data = await invoke<{ completion: string }>("code-completion", {
    codeBefore, codeAfter, language,
  }, 8000);

  const text = cleanCode(data?.completion || "");
  if (text) {
    completionCache.set(cacheKey, { text, time: Date.now() });
    if (completionCache.size > 100) {
      const oldest = completionCache.keys().next().value;
      if (oldest) completionCache.delete(oldest);
    }
  }
  return text;
}

export async function getCodeFix(code: string, errorText: string, language: string): Promise<string> {
  const data = await invoke<{ fixedCode: string; error?: string }>("code-fix", {
    code, errorText, language,
  });
  if (data?.error) {
    try {
      const { toast } = await import("sonner");
      toast.error(data.error);
    } catch {}
  }
  return cleanCode(data?.fixedCode || "");
}

export async function getAiEdit(
  code: string,
  command: string,
  language: string,
  selection: string = "",
  fileName: string = ""
): Promise<string> {
  const instruction = `${fileName ? `File: ${fileName}\n` : ""}${command}${selection ? `\n\nFocus on this selected snippet:\n${selection}` : ""}`;
  const data = await invoke<{ fixedCode: string; error?: string }>("code-fix", {
    code: selection || code,
    errorText: instruction,
    language,
  });
  if (data?.error) {
    try {
      const { toast } = await import("sonner");
      toast.error(data.error);
    } catch {}
  }
  return cleanCode(data?.fixedCode || "");
}

export type CodeUpdate = {
  html?: string;
  css?: string;
  js?: string;
  python?: string;
  explanation?: string;
};

export async function getOrchestratorResponse(
  files: { html?: string; css?: string; js?: string; python?: string },
  command: string,
  _language: string
): Promise<CodeUpdate | null> {
  const data = await invoke<CodeUpdate>("ai-orchestrator", { files, command }, 60000);
  if (!data || (data as any).error) return null;
  return data;
}
