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

const testimonialVideos = [
  { id: "9cqVBgDa4Ts", poster: "reference-08.jpg", number: "01" },
  { id: "kzQYiqI-Mgk", poster: "reference-09.jpg", number: "02" },
  { id: "AkDm_335A-k", poster: "reference-10.jpg", number: "03" },
  { id: "EfMUFEvG6HI", poster: "reference-11.jpg", number: "04" },
  { id: "Jg8fEQ_QVjg", poster: "reference-12.jpg", number: "05" },
  { id: "CX1jZ8qTgp4", poster: "reference-13.jpg", number: "06" },
  { id: "TqBVrGRPStc", poster: "reference-14.jpg", number: "07" },
] as const;

function createTestimonialMedia() {
  const slides = testimonialVideos
    .map(
      ({ id, poster, number }) => `
        <article class="em-video-slide" role="listitem">
          <button class="em-video-poster" type="button" data-youtube-id="${id}" aria-label="Reproduzir depoimento em vídeo ${number}">
            <img src="/media/${poster}" alt="" loading="lazy" decoding="async">
            <span>${number}</span>
            <i aria-hidden="true"></i>
          </button>
        </article>`,
    )
    .join("");

  return `
    <article class="em-featured-testimonial">
      <div class="em-featured-testimonial-media">
        <button class="em-video-poster em-featured-video-poster" type="button" data-youtube-id="Czgzqz6gcAE" data-player-title="Depoimento de Meuze" aria-label="Reproduzir depoimento de Meuze">
          <img src="/media/reference-07.jpg" alt="" loading="lazy" decoding="async">
          <i aria-hidden="true"></i>
        </button>
      </div>
      <div class="em-featured-testimonial-copy">
        <p>Meuze faturava R$ 100 mil e, há pouco menos de 1 ano, já fatura</p>
        <strong>R$ meio milhão</strong>
      </div>
    </article>
    <div class="em-video-carousel">
      <div class="em-video-carousel-heading">
        <p>Mais histórias reais <span>Arraste para navegar</span></p>
        <div class="em-video-controls" aria-label="Controles do carrossel de depoimentos">
          <button type="button" data-video-prev aria-label="Ver depoimento anterior" disabled><span aria-hidden="true">←</span></button>
          <button type="button" data-video-next aria-label="Ver próximo depoimento"><span aria-hidden="true">→</span></button>
        </div>
      </div>
      <div class="em-video-viewport" data-video-viewport aria-label="Depoimentos em vídeo">
        <div class="em-video-track" role="list">${slides}
        </div>
      </div>
    </div>`;
}

function replaceTestimonialMedia(html: string) {
  const sectionStart = html.indexOf('<section id="depoimentos"');
  const sectionEnd = html.indexOf("</section>", sectionStart);
  if (sectionStart < 0 || sectionEnd < 0) return html;

  const mediaStart = html.indexOf(
    '<div style="margin-top: 40px; padding: 20px;',
    sectionStart,
  );
  const listStart = html.indexOf('<div role="list"', mediaStart);
  const mediaEnd = html.indexOf("</div>", listStart);
  if (mediaStart < 0 || listStart < 0 || mediaEnd < 0 || mediaEnd > sectionEnd) {
    return html;
  }

  return `${html.slice(0, mediaStart)}${createTestimonialMedia()}${html.slice(mediaEnd + 6)}`;
}

function removeSectionById(html: string, id: string) {
  const start = html.indexOf(`<section id="${id}"`);
  if (start < 0) return html;
  const end = html.indexOf("</section>", start);
  if (end < 0) return html;
  return `${html.slice(0, start)}${html.slice(end + 10)}`;
}

function mountLeadFormAfterDiagnosis(html: string) {
  const start = html.indexOf('<section id="teste"');
  const end = html.indexOf("</section>", start);
  if (start < 0 || end < 0) return html;
  const section = html.slice(start, end + 10);
  const withMount = section.replace(
    /<a class="em-btn" data-track-cta="[^"]+" href="#formulario"[^>]*>Quero minha vaga<\/a>/,
    '<div id="formulario" class="em-form-mount" aria-label="Formulário de interesse no EscalaMED"></div>',
  );
  return `${html.slice(0, start)}${withMount}${html.slice(end + 10)}`;
}

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
  html = html.replaceAll(
    '<span style="white-space: nowrap;">Mais faturamento.</span>',
    '<span style="white-space: nowrap;">Mais estrutura.</span>',
  );
  html = html.replaceAll("Mais faturamento", "Mais estrutura");
  html = html.replaceAll("MAIS FATURAMENTO", "MAIS ESTRUTURA");
  html = html.replace(
    /(<p style="margin: 0; font-family: Sora,[^>]+>)\+2(<\/p><p style="margin: 10px 0 0;[^>]+>Anos de mercado<\/p>)/,
    "$1+20$2",
  );
  html = html.replaceAll(
    "Onde é e quanto custa?",
    "Onde será e como recebo os detalhes?",
  );
  html = html.replaceAll(
    "um mapa de como fazer sua clínica aumentar os lucros sem depender de você para funcionar, te dando  mais liberdade e mais resultado.",
    "um mapa de como estruturar o crescimento da clínica sem depender de você para funcionar, com mais liberdade e decisões melhores.",
  );
  html = html.replaceAll(
    'href="https://formulario-escalamed.x5med.com.br/" target="_blank" rel="noopener"',
    'href="#formulario"',
  );
  html = html.replaceAll("Garantir minha vaga", "Quero minha vaga");
  html = html.replaceAll(
    "Antes de garantir a sua vaga.",
    "Antes de pedir a sua vaga.",
  );
  html = html.replaceAll(
    "No Star Eventos Alphaville, na Alameda Madeira, 222, em Barueri, SP. O investimento é de R$ 2.497.",
    "No Star Eventos Alphaville, na Alameda Madeira, 222, em Barueri, SP. Nossa equipe explica os detalhes e as condições pelo WhatsApp.",
  );
  html = replaceTestimonialMedia(html);

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

  html = mountLeadFormAfterDiagnosis(html);
  html = removeSectionById(html, "inscricao");
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
