import { readFileSync } from "node:fs";
import path from "node:path";

const source = readFileSync(
  path.join(process.cwd(), "source", "version-b.html"),
  "utf8",
);

const rawSourceStyles = Array.from(
  source.matchAll(/<style>([\s\S]*?)<\/style>/g),
  (match) => match[1],
).join("\n");

let fontIndex = 0;
const sourceStyles = rawSourceStyles.replace(
  /data:font\/woff2;base64,[^)]+/g,
  () => `/fonts/reference-${String(++fontIndex).padStart(2, "0")}.woff2`,
);

function transformReferenceMarkup() {
  const body = source.match(/<body>([\s\S]*?)<\/body>/)?.[1] ?? "";
  let html = body.replace(/<script[\s\S]*?<\/script>/g, "");

  let jpegIndex = 0;
  html = html.replace(/src="data:image\/jpeg;base64,[^"]+"/g, () => {
    jpegIndex += 1;
    if (jpegIndex === 1) {
      return 'src="/hero-escalamed-b-hq.webp" width="2041" height="771" fetchpriority="high" decoding="async" class="em-hero-image"';
    }
    const name = `reference-${String(jpegIndex).padStart(2, "0")}.jpg`;
    return `src="/media/${name}" loading="lazy" decoding="async"`;
  });

  html = html.replace(
    /src="data:image\/svg\+xml;base64,[^"]+"/g,
    'src="/favicon.svg"',
  );
  html = html.replaceAll(
    "27, 28 e 29 de novembro",
    "27, 28 e 29 de novembro de 2026",
  );

  let ctaIndex = 0;
  html = html.replace(
    /<a class="em-btn" /g,
    () =>
      `<a class="em-btn" data-track-cta="version-b-${String(++ctaIndex).padStart(2, "0")}" `,
  );
  html = html.replace(
    'href="https://www.google.com/maps/search/?api=1&amp;query=Star+Eventos+Alphaville+Alameda+Madeira+222+Barueri"',
    'data-track-map="star-eventos-alphaville" href="https://www.google.com/maps/search/?api=1&amp;query=Star+Eventos+Alphaville+Alameda+Madeira+222+Barueri"',
  );

  const heroOffer = `<div class="em-hero-price" aria-label="Investimento: R$ 2.497 à vista ou 12 parcelas de R$ 258,25 com juros"><strong>R$ 2.497 à vista</strong><span>ou 12x de R$ 258,25*</span><small>* Parcelamento com juros</small></div>\n`;
  html = html.replace(
    /(<section id="inicio"[\s\S]*?)(<a class="em-btn" data-track-cta="version-b-\d+" href="https:\/\/formulario-escalamed\.x5med\.com\.br\/"[^>]*>Garantir minha vaga<\/a>)/,
    `$1${heroOffer}$2`,
  );
  html = html.replace(
    /(<span style="font-family: Sora, 'Avenir Next', system-ui, sans-serif; font-weight: 500; font-size: clamp\(34px, 3\.4vw, 44px\); line-height: 1; letter-spacing: -0\.04em; color: #f4b540;">R\$ 2\.497<\/span><\/div>)/,
    `$1<p class="em-investment-installment">ou 12x de R$ 258,25*<small>* Parcelamento com juros</small></p>`,
  );
  html = html.replace(
    /(<section id="depoimentos"[\s\S]*?)(<\/section>)/,
    `$1<p class="em-results-disclaimer">Os resultados apresentados são individuais e podem variar conforme o contexto, a execução e as condições de cada clínica.</p>\n$2`,
  );
  html = html.replace(
    /<p style="margin: 0; font-size: 13px; color: #91a7b7;">EscalaMED por X5 MED · © 2026 X5 MED<\/p>/,
    `<p class="em-footer-legal"><span>© 2026 X5 MED LTDA</span><span>CNPJ 20.754.312/0001-06</span><a href="https://metrics.x5med.com.br/politica-de-privacidade" target="_blank" rel="noopener noreferrer">Política de Privacidade</a></p>`,
  );

  return html;
}

export const referencePage = {
  markup: transformReferenceMarkup(),
  styles: sourceStyles,
};
