import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { NextRequest } from "next/server.js";

// Run the actual handlers using Node's native TypeScript support.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/server") return nextResolve("next/server.js", context);
    if (specifier.startsWith(".") && !/\.[a-z]+$/.test(specifier)) return nextResolve(`${specifier}.ts`, context);
    return nextResolve(specifier, context);
  },
});
const route = await import("../app/api/leads/route.ts");
const payload = {
  eventId: "00000000-0000-4000-8000-000000000001",
  name: "QA Lead Sintético", phone: "+55 (11) 91234-5678",
  role: "doctor-owner", revenueRange: "40k-70k", email: "",
  diagnosisScore: 3, diagnosisScenes: ["Agenda sem margem"],
  attribution: { utm_source: "meta", utm_medium: "paid", utm_campaign: "escala", utm_content: "criativo" },
};
async function send(t, changes = {}, upstream = { success: true, receiptId: "fixture-receipt" }) {
  const previous = { ...process.env };
  process.env.METRICS_LP_NOVO_WEBHOOK_URL = "https://crm.example.invalid/webhook";
  process.env.METRICS_LP_NOVO_WEBHOOK_TOKEN = "test-only-token";
  t.after(() => { process.env = previous; });
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, options, body: JSON.parse(options.body) });
    return Response.json(upstream, { status: upstream.success ? 201 : 409 });
  });
  const response = await route.POST(new NextRequest("http://localhost/api/leads", {
    method: "POST", headers: { host: "localhost", origin: "http://localhost", "content-type": "application/json" },
    body: JSON.stringify({ ...payload, ...changes }),
  }));
  return { response, body: await response.json(), calls };
}

test("WhatsApp alone is forwarded; empty or absent optional email is omitted", async (t) => {
  const { response, body, calls } = await send(t, { email: undefined });
  assert.equal(response.status, 201);
  assert.equal(body.success, true);
  assert.equal(calls[0].body.telefone, "11912345678");
  assert.equal(Object.hasOwn(calls[0].body, "email"), false);
  assert.equal(calls[0].options.headers["Idempotency-Key"], payload.eventId);
  assert.equal(calls[0].body.event_id, payload.eventId);
});

test("filled honeypot reaches CRM with review flag, attribution and qualification", async (t) => {
  const { body, calls } = await send(t, { companyWebsite: "autofilled.example", attribution: { ...payload.attribution, token: "drop-me" } });
  assert.equal(body.success, true);
  const lead = calls[0].body;
  assert.equal(lead.suspeito, true);
  assert.match(lead.observacoes, /possível preenchimento automático/);
  assert.equal(lead.companyWebsite, undefined);
  assert.equal(lead.token, undefined);
  for (const [key, value] of Object.entries(payload.attribution)) {
    assert.equal(lead[key], value);
    assert.ok(lead.observacoes.includes(`${key}: ${value}`));
  }
  assert.equal(lead.cargo, "Médico com clínica própria");
  assert.equal(lead.faixa_faturamento, "De R$ 40 mil a R$ 70 mil");
  assert.equal(lead.diagnostic_score, 3);
});

test("doctor without clinic is accepted and stale revenue is ignored", async (t) => {
  const { response, calls } = await send(t, { role: "doctor-no-clinic", revenueRange: "over-100k" });
  assert.equal(response.status, 201);
  assert.equal(calls[0].body.sem_clinica_propria, true);
  assert.equal(calls[0].body.faixa_faturamento, null);
  assert.match(calls[0].body.observacoes, /fora do público da imersão/);
  assert.doesNotMatch(calls[0].body.observacoes, /Acima de R\$ 100 mil/);
});

test("doctor without clinic does not need a revenue answer", async (t) => {
  const { response } = await send(t, { role: "doctor-no-clinic", revenueRange: "" });
  assert.equal(response.status, 201);
});

for (const [changes, field] of [
  [{ revenueRange: "" }, "revenueRange"], [{ email: "invalid" }, "email"],
  [{ role: "toString" }, "role"], [{ phone: "" }, "phone"],
]) {
  test(`invalid ${field} never reaches CRM`, async (t) => {
    const { response, body, calls } = await send(t, changes);
    assert.equal(response.status, 400);
    assert.equal(body.field, field);
    assert.equal(calls.length, 0);
  });
}

test("honeypot cannot turn CRM failure into a successful registration", async (t) => {
  const { response, body, calls } = await send(t, { companyWebsite: "autofilled" }, { success: false });
  assert.equal(calls.length, 1);
  assert.equal(response.status, 502);
  assert.equal(body.success, undefined);
});

test("tracking clears error and scroll values before later events", async () => {
  const previous = globalThis.window;
  globalThis.window = { dataLayer: [] };
  try {
    const { pushEvent } = await import("../lib/tracking.ts");
    pushEvent("form_error", { error_type: "submission", error_message: "try again", error_field: "form" });
    pushEvent("scroll_depth", { percent_scrolled: 50 });
    pushEvent("generate_lead", payload.attribution);
    const model = {};
    const events = [];
    for (const entry of window.dataLayer) {
      Object.assign(model, entry);
      if (entry.event) events.push({ ...model });
    }
    assert.equal(events[0].error_type, "submission");
    assert.equal(events[1].percent_scrolled, 50);
    for (const key of ["error_type", "error_message", "error_field", "percent_scrolled"]) {
      assert.equal(events[2][key], undefined);
      assert.equal(model[key], undefined);
    }
    assert.equal(events[2].utm_campaign, "escala");
  } finally { globalThis.window = previous; }
});
