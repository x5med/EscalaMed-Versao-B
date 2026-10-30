import { NextResponse, type NextRequest } from "next/server";
import {
  LEAD_SOURCE,
  isValidEmail,
  isValidName,
  isValidPhone,
  phoneKey,
  revenueLabels,
  roleLabels,
  type LeadFormPayload,
  type RevenueValue,
  type RoleValue,
} from "../../../lib/lead-form";

export const runtime = "nodejs";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedAttributionKeys = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
  "wbraid",
  "gbraid",
]);

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

function cleanAttribution(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const output: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (!allowedAttributionKeys.has(key)) continue;
    const normalized = text(raw, 250);
    if (normalized) output[key] = normalized;
  }
  return output;
}

function validationError(field: string, message: string) {
  return NextResponse.json({ error: message, field }, { status: 400 });
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  }
  if (Number(request.headers.get("content-length") || 0) > 24_000) {
    return NextResponse.json({ error: "Dados muito grandes." }, { status: 413 });
  }

  const body = await request.json().catch(() => null) as Partial<LeadFormPayload> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const eventId = text(body.eventId, 80);
  const name = text(body.name, 160).replace(/\s+/g, " ");
  const phone = text(body.phone, 40);
  const email = text(body.email, 254).toLowerCase();
  const role = text(body.role, 40) as RoleValue;
  const revenueRange = text(body.revenueRange, 40) as RevenueValue;
  const companyWebsite = text(body.companyWebsite, 120);

  if (companyWebsite) return NextResponse.json({ success: true, eventId });
  if (!uuidPattern.test(eventId)) return validationError("form", "Atualize a página e tente novamente.");
  if (!isValidName(name)) return validationError("name", "Informe seu nome completo, sem números.");
  if (!isValidPhone(phone)) return validationError("phone", "Informe um WhatsApp válido com DDD.");
  if (!(role in roleLabels)) return validationError("role", "Selecione o seu cargo.");
  if (!(revenueRange in revenueLabels)) return validationError("revenueRange", "Selecione o faturamento mensal da clínica.");
  if (!isValidEmail(email)) return validationError("email", "Informe um e-mail válido ou deixe o campo vazio.");

  const diagnosisScore = Number.isInteger(body.diagnosisScore)
    ? Math.min(6, Math.max(0, Number(body.diagnosisScore)))
    : 0;
  const diagnosisScenes = Array.isArray(body.diagnosisScenes)
    ? body.diagnosisScenes
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim().slice(0, 280))
        .filter(Boolean)
        .slice(0, 6)
    : [];
  const attribution = cleanAttribution(body.attribution);
  const pageUrl = text(body.pageUrl, 500);
  const referrer = text(body.referrer, 500);
  const attributionSummary = Object.entries(attribution)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");
  const notes = [
    `Faturamento mensal: ${revenueLabels[revenueRange]}`,
    `Autodiagnóstico: ${diagnosisScore}/6 situações marcadas`,
    diagnosisScenes.length ? `Situações: ${diagnosisScenes.join(" | ")}` : "Situações: nenhuma marcada",
    "Consentimento: ao enviar, autorizou contato da X5 Med pelo WhatsApp.",
    pageUrl ? `Página: ${pageUrl}` : "",
    referrer ? `Referência: ${referrer}` : "",
    attributionSummary ? `Atribuição: ${attributionSummary}` : "",
  ].filter(Boolean).join("\n");

  const endpoint = process.env.METRICS_LP_NOVO_WEBHOOK_URL || "";
  const token = process.env.METRICS_LP_NOVO_WEBHOOK_TOKEN || "";
  if (!endpoint || !token) {
    console.error("[LP-NOVO] Metrics webhook is not configured");
    return NextResponse.json(
      { error: "O serviço de inscrições está temporariamente indisponível." },
      { status: 503 },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Idempotency-Key": eventId,
      },
      body: JSON.stringify({
        nome: name,
        telefone: phoneKey(phone),
        email,
        cargo: roleLabels[role],
        observacoes: notes,
        fonte: LEAD_SOURCE,
        event_id: eventId,
      }),
      cache: "no-store",
      signal: controller.signal,
    });
    const result = await response.json().catch(() => null) as {
      success?: boolean;
      receiptId?: string;
      outcome?: string;
    } | null;
    if (!response.ok || result?.success !== true) {
      console.error("[LP-NOVO] Metrics webhook rejected the lead", response.status);
      return NextResponse.json(
        { error: "Não foi possível enviar agora. Tente novamente em instantes." },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { success: true, eventId, receiptId: result.receiptId || null, outcome: result.outcome || "created" },
      { status: response.status === 201 ? 201 : 200 },
    );
  } catch (error) {
    console.error("[LP-NOVO] Metrics webhook failed", error instanceof Error ? error.name : "unknown");
    return NextResponse.json(
      { error: "Não foi possível enviar agora. Tente novamente em instantes." },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
