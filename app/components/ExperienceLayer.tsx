"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

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

const storageKey = "escalamed-attribution-v1";

function pushEvent(event: string, payload: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...payload });
}

export default function ExperienceLayer() {
  const [consentVisible, setConsentVisible] = useState(false);

  useEffect(() => {
    const cleanups: Array<() => void> = [];
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const savedConsent = document.cookie.match(
      /(?:^|; )x5med_consent=([^;]*)/,
    )?.[1];
    setConsentVisible(!savedConsent);

    const current = new URLSearchParams(window.location.search);
    let attribution: Record<string, string> = {};
    for (const key of attributionKeys) {
      const value = current.get(key);
      if (value) attribution[key] = value;
    }
    try {
      if (Object.keys(attribution).length) {
        sessionStorage.setItem(storageKey, JSON.stringify(attribution));
      } else {
        attribution = JSON.parse(sessionStorage.getItem(storageKey) ?? "{}");
      }
    } catch {
      attribution = {};
    }

    const ctas = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(
        'a[href^="https://formulario-escalamed.x5med.com.br"]',
      ),
    );
    for (const anchor of ctas) {
      const url = new URL(anchor.href);
      for (const [key, value] of Object.entries(attribution)) {
        if (!url.searchParams.has(key)) url.searchParams.set(key, value);
      }
      anchor.href = url.toString();
      const handleClick = () =>
        pushEvent("cta_click", {
          cta_position: anchor.dataset.trackCta ?? "unknown",
          cta_label: anchor.textContent?.trim() ?? "",
          destination_url: anchor.href,
        });
      anchor.addEventListener("click", handleClick);
      cleanups.push(() => anchor.removeEventListener("click", handleClick));
    }

    const mapLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>("[data-track-map]"),
    );
    for (const anchor of mapLinks) {
      const handleClick = () =>
        pushEvent("map_click", {
          location_name: anchor.dataset.trackMap ?? "unknown",
          destination_url: anchor.href,
        });
      anchor.addEventListener("click", handleClick);
      cleanups.push(() => anchor.removeEventListener("click", handleClick));
    }

    const selected = new Set<number>();
    const diagnosisButtons = Array.from(
      document.querySelectorAll<HTMLButtonElement>("[data-scene]"),
    );
    const renderDiagnosis = () => {
      for (const button of diagnosisButtons) {
        const index = Number(button.dataset.scene);
        const active = selected.has(index);
        button.setAttribute("aria-pressed", active ? "true" : "false");
        button.classList.toggle("em-selected", active);
        const check = button.querySelector<HTMLElement>(".em-check");
        if (check) check.style.display = active ? "inline" : "none";
      }
      const count = selected.size;
      const countNode = document.getElementById("em-count");
      if (countNode) countNode.textContent = String(count);
      const none = document.getElementById("em-res-none");
      const few = document.getElementById("em-res-few");
      const many = document.getElementById("em-res-many");
      if (none) none.hidden = count !== 0;
      if (few) few.hidden = !(count > 0 && count < 3);
      if (many) many.hidden = count < 3;
    };
    for (const button of diagnosisButtons) {
      const handleClick = () => {
        const index = Number(button.dataset.scene);
        if (selected.has(index)) selected.delete(index);
        else selected.add(index);
        renderDiagnosis();
      };
      button.addEventListener("click", handleClick);
      cleanups.push(() => button.removeEventListener("click", handleClick));
    }
    renderDiagnosis();

    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>(
        "section h1, section h2, section h3, section [data-scene], section details, section img, .em-hero-price, .em-results-disclaimer",
      ),
    );
    const cardTargets = Array.from(
      document.querySelectorAll<HTMLElement>(
        "[data-scene], details, #mentores [style*='border-radius: 24px'], #depoimentos [style*='border-radius: 24px'], #inscricao [style*='border-radius: 30px'], #localizacao [style*='border-radius: 28px']",
      ),
    );
    for (const card of cardTargets) card.classList.add("em-hover-card");

    if (reducedMotion || !("IntersectionObserver" in window)) {
      for (const element of revealTargets) element.classList.add("em-revealed");
    } else {
      for (const element of revealTargets) element.classList.add("em-reveal");
      const revealObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("em-revealed");
            revealObserver.unobserve(entry.target);
          }
        },
        { rootMargin: "0px 0px -8%", threshold: 0.12 },
      );
      for (const element of revealTargets) revealObserver.observe(element);
      cleanups.push(() => revealObserver.disconnect());
    }

    const viewed = new Set<string>();
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const section = entry.target as HTMLElement;
          if (!section.id || viewed.has(section.id)) continue;
          viewed.add(section.id);
          pushEvent("section_view", {
            section_id: section.id,
            section_title:
              section.querySelector("h1,h2,h3")?.textContent?.trim() ??
              section.id,
          });
          sectionObserver.unobserve(section);
        }
      },
      { threshold: 0.35 },
    );
    for (const section of document.querySelectorAll("section[id]")) {
      sectionObserver.observe(section);
    }
    cleanups.push(() => sectionObserver.disconnect());

    const thresholds = [25, 50, 75, 90];
    const reached = new Set<number>();
    let scrollFrame = 0;
    const handleScroll = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = 0;
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const percent = total > 0 ? Math.round((window.scrollY / total) * 100) : 100;
        for (const threshold of thresholds) {
          if (percent >= threshold && !reached.has(threshold)) {
            reached.add(threshold);
            pushEvent("scroll_depth", { percent_scrolled: threshold });
          }
        }
        if (!reducedMotion) {
          document.documentElement.style.setProperty(
            "--em-hero-shift",
            `${Math.min(window.scrollY * 0.045, 24)}px`,
          );
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    cleanups.push(() => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      document.documentElement.style.removeProperty("--em-hero-shift");
    });

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, []);

  const updateConsent = (choice: "accepted" | "rejected") => {
    const sharedDomain =
      window.location.hostname === "x5med.com.br" ||
      window.location.hostname.endsWith(".x5med.com.br");
    document.cookie = [
      `x5med_consent=${choice}`,
      "Path=/",
      "Max-Age=31536000",
      "SameSite=Lax",
      window.location.protocol === "https:" ? "Secure" : "",
      sharedDomain ? "Domain=.x5med.com.br" : "",
    ]
      .filter(Boolean)
      .join("; ");
    const value = choice === "accepted" ? "granted" : "denied";
    window.gtag?.("consent", "update", {
      ad_storage: value,
      analytics_storage: value,
      ad_user_data: value,
      ad_personalization: value,
    });
    pushEvent("consent_update", { consent_choice: choice });
    setConsentVisible(false);
  };

  return (
    <>
      <a
        className="em-whatsapp"
        href="https://wa.me/557999383447?text=Ol%C3%A1%2C%20quero%20saber%20mais%20sobre%20o%20EscalaMED"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp sobre o EscalaMED"
      >
        <span className="em-whatsapp-ring" aria-hidden="true" />
        <svg aria-hidden="true" viewBox="0 0 32 32">
          <path
            fill="currentColor"
            d="M16.04 3A12.88 12.88 0 0 0 5.02 22.55L3.3 28.84l6.44-1.69A12.9 12.9 0 1 0 16.04 3Zm0 23.61c-2.01 0-3.97-.54-5.68-1.56l-.41-.25-3.82 1 1.02-3.72-.27-.43a10.66 10.66 0 1 1 9.16 4.96Zm5.84-7.99c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59a9.64 9.64 0 0 1-1.78-2.22c-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.56 1.14 3.07 1.3 3.28.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.16-1.51.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z"
          />
        </svg>
        <span className="em-whatsapp-label">Fale conosco</span>
      </a>

      {consentVisible ? (
        <aside
          className="em-consent"
          role="dialog"
          aria-label="Preferências de privacidade"
          aria-live="polite"
        >
          <div>
            <strong>Privacidade e medição</strong>
            <p>
              Usamos cookies de análise e publicidade para medir a experiência e
              melhorar nossas campanhas. Consulte nossa{" "}
              <a
                href="https://metrics.x5med.com.br/politica-de-privacidade"
                target="_blank"
                rel="noopener noreferrer"
              >
                Política de Privacidade
              </a>
              .
            </p>
          </div>
          <div className="em-consent-actions">
            <button type="button" onClick={() => updateConsent("rejected")}>
              Recusar
            </button>
            <button
              className="em-consent-accept"
              type="button"
              onClick={() => updateConsent("accepted")}
            >
              Aceitar
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
