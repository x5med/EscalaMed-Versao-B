"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  FORM_ID,
  FORM_NAME,
  formatPhone,
  isValidEmail,
  isValidName,
  isValidPhone,
  phoneKey,
  revenueLabels,
  roleLabels,
} from "../../lib/lead-form";

type DiagnosisResult = { count: number; scenes: string[] };
type FormFields = {
  name: string;
  phone: string;
  role: string;
  email: string;
  revenueRange: string;
  companyWebsite: string;
};

const initialFields: FormFields = {
  name: "",
  phone: "",
  role: "",
  email: "",
  revenueRange: "",
  companyWebsite: "",
};

const attributionKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
  "wbraid",
  "gbraid",
] as const;

function pushEvent(event: string, payload: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...payload });
}

function readAttribution() {
  const parameters = new URLSearchParams(window.location.search);
  const output: Record<string, string> = {};
  for (const key of attributionKeys) {
    const value = parameters.get(key);
    if (value) output[key] = value;
  }
  if (Object.keys(output).length) return output;
  try {
    const stored = JSON.parse(sessionStorage.getItem("escalamed-attribution-v1") || "{}");
    return stored && typeof stored === "object" ? stored as Record<string, string> : {};
  } catch {
    return {};
  }
}

function fieldError(fields: FormFields) {
  if (!isValidName(fields.name)) return { field: "name", message: "Informe seu nome completo, sem números." };
  if (!isValidPhone(fields.phone)) return { field: "phone", message: "Informe um WhatsApp válido com DDD." };
  if (!(fields.role in roleLabels)) return { field: "role", message: "Selecione o seu cargo." };
  if (!(fields.revenueRange in revenueLabels)) return { field: "revenueRange", message: "Selecione o faturamento mensal da clínica." };
  if (!isValidEmail(fields.email)) return { field: "email", message: "Informe um e-mail válido ou deixe o campo vazio." };
  return null;
}

export default function LeadForm({ diagnosis }: { diagnosis: DiagnosisResult }) {
  const [fields, setFields] = useState(initialFields);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const started = useRef(false);
  const [eventId] = useState(() => crypto.randomUUID());

  const trackStart = () => {
    if (started.current) return;
    started.current = true;
    pushEvent("form_start", {
      form_id: FORM_ID,
      form_name: FORM_NAME,
      lead_id: eventId,
      diagnostic_score: diagnosis.count,
    });
  };

  const update = (field: keyof FormFields, value: string) => {
    trackStart();
    setError("");
    setFields((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    trackStart();
    const invalid = fieldError(fields);
    if (invalid) {
      setError(invalid.message);
      pushEvent("form_error", {
        form_id: FORM_ID,
        form_name: FORM_NAME,
        error_field: invalid.field,
        error_message: invalid.message,
        error_type: "validation",
      });
      document.getElementById(`lead-${invalid.field}`)?.focus();
      return;
    }

    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          ...fields,
          diagnosisScore: diagnosis.count,
          diagnosisScenes: diagnosis.scenes,
          pageUrl: window.location.href,
          referrer: document.referrer,
          attribution: readAttribution(),
        }),
      });
      const result = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(result?.error || "Não foi possível enviar agora.");

      pushEvent("generate_lead", {
        event_id: eventId,
        form_id: FORM_ID,
        form_name: FORM_NAME,
        lead_type: "commercial_contact",
        cargo: roleLabels[fields.role as keyof typeof roleLabels],
        faixa_faturamento: revenueLabels[fields.revenueRange as keyof typeof revenueLabels],
        diagnostic_score: diagnosis.count,
        source_identifier: "LP-NOVO",
        user_data: {
          ...(fields.email.trim() ? { email_address: fields.email.trim().toLowerCase() } : {}),
          phone_number: `+55${phoneKey(fields.phone)}`,
        },
      });
      setSuccess(true);
    } catch (submissionError) {
      const message = submissionError instanceof Error
        ? submissionError.message
        : "Não foi possível enviar agora. Tente novamente.";
      setError(message);
      pushEvent("form_error", {
        form_id: FORM_ID,
        form_name: FORM_NAME,
        error_field: "form",
        error_message: message,
        error_type: "submission",
      });
    } finally {
      setSending(false);
    }
  };

  if (success) {
    return (
      <div className="em-lead-success" role="status" aria-live="polite">
        <span aria-hidden="true">✓</span>
        <p>Dados recebidos</p>
        <h3>Agora é com a nossa equipe.</h3>
        <p>
          Em até 1 dia útil, o time da X5 Med vai chamar você no WhatsApp informado
          para explicar os próximos passos, os detalhes e as condições do EscalaMED.
        </p>
        <small>Não é necessário realizar nenhum pagamento nesta página.</small>
      </div>
    );
  }

  return (
    <div className="em-lead-card">
      <div className="em-lead-copy">
        <p>Próximo passo</p>
        <h3>Quero participar do EscalaMED</h3>
        <p>
          O EscalaMED é um evento pago para apenas 100 vagas. Deixe seus dados e
          nossa equipe entra em contato pelo WhatsApp com os detalhes e as condições.
        </p>
        <div className="em-diagnosis-summary" aria-live="polite">
          <strong>{diagnosis.count} de 6</strong>
          <span>
            {diagnosis.count === 0
              ? "situações marcadas no diagnóstico"
              : diagnosis.count === 1
                ? "situação marcada no seu diagnóstico"
                : "situações marcadas no seu diagnóstico"}
          </span>
        </div>
      </div>

      <form className="em-lead-form" onSubmit={submit} noValidate>
        <label htmlFor="lead-name">
          <span className="em-label-text">Nome completo <b>*</b></span>
          <input
            id="lead-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={fields.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </label>

        <label htmlFor="lead-phone">
          <span className="em-label-text">WhatsApp com DDD <b>*</b></span>
          <input
            id="lead-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(11) 99999-9999"
            required
            value={fields.phone}
            onChange={(event) => update("phone", formatPhone(event.target.value))}
          />
        </label>

        <label htmlFor="lead-role">
          <span className="em-label-text">Cargo <b>*</b></span>
          <select
            id="lead-role"
            name="role"
            required
            value={fields.role}
            onChange={(event) => update("role", event.target.value)}
          >
            <option value="">Selecione</option>
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <label htmlFor="lead-revenueRange">
          <span className="em-label-text">Faturamento mensal da clínica <b>*</b></span>
          <select
            id="lead-revenueRange"
            name="revenueRange"
            required
            value={fields.revenueRange}
            onChange={(event) => update("revenueRange", event.target.value)}
          >
            <option value="">Selecione</option>
            {Object.entries(revenueLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <label className="em-lead-email" htmlFor="lead-email">
          <span className="em-label-text">E-mail <em>opcional</em></span>
          <input
            id="lead-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={fields.email}
            onChange={(event) => update("email", event.target.value)}
          />
        </label>

        <label className="em-lead-honeypot" aria-hidden="true">
          Site da empresa
          <input
            name="companyWebsite"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={fields.companyWebsite}
            onChange={(event) => setFields((current) => ({ ...current, companyWebsite: event.target.value }))}
          />
        </label>

        {error ? <p className="em-lead-error" role="alert">{error}</p> : null}
        <button className="em-btn em-lead-submit" type="submit" disabled={sending}>
          {sending ? "Enviando..." : "Quero minha vaga"}
        </button>
        <p className="em-lead-consent">
          Ao enviar, você autoriza nosso contato pelo WhatsApp. Seus dados são
          tratados conforme a nossa{" "}
          <a
            href="https://metrics.x5med.com.br/politica-de-privacidade"
            target="_blank"
            rel="noopener noreferrer"
          >
            Política de Privacidade
          </a>
          .
        </p>
      </form>
    </div>
  );
}
