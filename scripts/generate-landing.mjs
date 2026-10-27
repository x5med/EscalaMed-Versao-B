import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "source", "version-b.html");
const outputPath = path.join(root, "public", "version-b.html");
const source = await readFile(sourcePath, "utf8");

const consentBootstrap = `<script id="x5med-consent-bootstrap">(function(w,d){
w.dataLayer=w.dataLayer||[];
w.gtag=w.gtag||function(){w.dataLayer.push(arguments);};
var match=d.cookie.match(/(?:^|; )x5med_consent=([^;]*)/);
var choice=match?decodeURIComponent(match[1]):'unknown';
var granted=choice==='accepted';
w.gtag('consent','default',{
ad_storage:granted?'granted':'denied',analytics_storage:granted?'granted':'denied',
ad_user_data:granted?'granted':'denied',ad_personalization:granted?'granted':'denied',
functionality_storage:'granted',security_storage:'granted',wait_for_update:500
});
w.dataLayer.push({event:'consent_default',consent_choice:choice});
})(window,document);</script>`;

const gtm = `<script id="google-tag-manager">(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-M4GT66JQ');</script>`;

const enhancements = `<link rel="canonical" href="https://escalamed-b.x5med.com.br/">
<meta property="og:url" content="https://escalamed-b.x5med.com.br/">
<meta property="og:image" content="https://escalamed-b.x5med.com.br/hero-escalamed-b.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://escalamed-b.x5med.com.br/hero-escalamed-b.jpg">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style id="x5med-production-enhancements">
section[id]{scroll-margin-top:92px}
.em-hero-price{padding:14px 18px;border:1px solid rgba(244,181,64,.38);border-radius:18px;background:rgba(2,8,23,.58);color:#f7f9fc}
.em-hero-price strong{display:block;color:#f4b540;font-family:Sora,system-ui,sans-serif;font-size:26px;line-height:1.1}
.em-hero-price span{display:block;margin-top:6px;font-size:14px;font-weight:700}.em-hero-price small{display:block;margin-top:5px;color:#91a7b7;font-size:11px}
.em-investment-installment{margin:12px 0 0;text-align:right;color:#d7e3e9;font-size:15px;font-weight:700}.em-investment-installment small{display:block;margin-top:4px;color:#91a7b7;font-size:11px;font-weight:500}
.em-results-disclaimer{max-width:760px;margin:28px auto 0;color:#7894a4;font-size:12px;line-height:1.6;text-align:center}
.em-whatsapp{position:fixed;right:22px;bottom:22px;z-index:90;display:inline-flex;align-items:center;gap:10px;min-height:54px;padding:12px 18px;border:1px solid rgba(255,255,255,.28);border-radius:999px;background:#1f9d55;color:#fff;text-decoration:none;box-shadow:0 16px 44px rgba(0,0,0,.32);font:800 12px/1.2 Inter,system-ui,sans-serif}
.em-whatsapp svg{width:25px;height:25px}.em-consent{position:fixed;right:22px;bottom:22px;z-index:1000;display:grid;width:min(560px,calc(100% - 32px));padding:22px;border:1px solid rgba(255,255,255,.14);border-radius:22px;background:rgba(4,18,36,.97);box-shadow:0 22px 70px rgba(0,0,0,.38);color:#fff;backdrop-filter:blur(18px)}
.em-consent[hidden]{display:none}.em-consent strong{font-size:15px}.em-consent p{margin:8px 0 0;color:rgba(232,240,248,.78);font-size:13px;line-height:1.55}.em-consent a{color:#f4b540}.em-consent-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:18px}.em-consent button{min-height:42px;padding:0 18px;border:1px solid rgba(255,255,255,.18);border-radius:999px;font:700 12px/1 Inter,system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase;cursor:pointer}.em-consent-reject{background:transparent;color:rgba(255,255,255,.84)}.em-consent-accept{border-color:#f4b540!important;background:#f4b540;color:#020817}
.em-footer-legal{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:6px 14px;margin:0;color:#91a7b7;font-size:12px}.em-footer-legal a{color:#f7f9fc;text-underline-offset:4px}
@media(max-width:600px){header>div{padding-left:16px !important;padding-right:16px !important;gap:12px !important;min-height:68px !important}header>a{flex-shrink:0}header img{height:18px !important}header .em-btn{min-height:42px !important;padding:0 13px !important;font-size:10px !important;letter-spacing:.035em !important}.em-whatsapp{right:16px;bottom:16px;width:50px;height:50px;min-height:50px;padding:11px;justify-content:center}.em-whatsapp span{display:none}.em-consent{right:16px;bottom:16px;padding:20px 18px;border-radius:20px}.em-consent-actions{display:grid;grid-template-columns:1fr 1fr}.em-consent button{padding-inline:12px}.em-footer-legal{justify-content:flex-start}.em-hero-price{width:100%;box-sizing:border-box}.em-hero-price strong{font-size:23px}.em-investment-installment{text-align:left}}
</style>`;

let html = source.replace("<head>", `<head>\n${consentBootstrap}\n${gtm}\n${enhancements}`);
html = html.replace("<body>", `<body>\n<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-M4GT66JQ" height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>`);
html = html.replaceAll("27, 28 e 29 de novembro", "27, 28 e 29 de novembro de 2026");

let ctaIndex = 0;
html = html.replace(/<a class="em-btn" /g, () => `<a class="em-btn" data-track-cta="version-b-${String(++ctaIndex).padStart(2, "0")}" `);
html = html.replace('href="https://www.google.com/maps/search/?api=1&amp;query=Star+Eventos+Alphaville+Alameda+Madeira+222+Barueri"', 'data-track-map="star-eventos-alphaville" href="https://www.google.com/maps/search/?api=1&amp;query=Star+Eventos+Alphaville+Alameda+Madeira+222+Barueri"');

const heroOffer = `<div class="em-hero-price" aria-label="Investimento: R$ 2.497 à vista ou 12 parcelas de R$ 258,25 com juros"><strong>R$ 2.497 à vista</strong><span>ou 12x de R$ 258,25*</span><small>* Parcelamento com juros</small></div>\n`;
html = html.replace(/(<section id="inicio"[\s\S]*?)(<a class="em-btn" data-track-cta="version-b-\d+" href="https:\/\/formulario-escalamed\.x5med\.com\.br\/"[^>]*>Garantir minha vaga<\/a>)/, `$1${heroOffer}$2`);
html = html.replace(/(<span style="font-family: Sora, 'Avenir Next', system-ui, sans-serif; font-weight: 500; font-size: clamp\(34px, 3\.4vw, 44px\); line-height: 1; letter-spacing: -0\.04em; color: #f4b540;">R\$ 2\.497<\/span><\/div>)/, `$1<p class="em-investment-installment">ou 12x de R$ 258,25*<small>* Parcelamento com juros</small></p>`);

html = html.replace(/(<section id="depoimentos"[\s\S]*?)(<\/section>)/, `$1<p class="em-results-disclaimer">Os resultados apresentados são individuais e podem variar conforme o contexto, a execução e as condições de cada clínica.</p>\n$2`);

html = html.replace(/<p style="margin: 0; font-size: 13px; color: #91a7b7;">EscalaMED por X5 MED · © 2026 X5 MED<\/p>/, `<p class="em-footer-legal"><span>© 2026 X5 MED LTDA</span><span>CNPJ 20.754.312/0001-06</span><a href="https://metrics.x5med.com.br/politica-de-privacidade" target="_blank" rel="noopener noreferrer">Política de Privacidade</a></p>`);

const productionUi = `<a class="em-whatsapp" href="https://wa.me/557999383447?text=Ol%C3%A1%2C%20quero%20saber%20mais%20sobre%20o%20EscalaMED" target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp sobre o EscalaMED"><svg aria-hidden="true" viewBox="0 0 32 32"><path fill="currentColor" d="M16.04 3A12.88 12.88 0 0 0 5.02 22.55L3.3 28.84l6.44-1.69A12.9 12.9 0 1 0 16.04 3Zm0 23.61c-2.01 0-3.97-.54-5.68-1.56l-.41-.25-3.82 1 1.02-3.72-.27-.43a10.66 10.66 0 1 1 9.16 4.96Zm5.84-7.99c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59a9.64 9.64 0 0 1-1.78-2.22c-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.56 1.14 3.07 1.3 3.28.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.16-1.51.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z"/></svg><span>Fale conosco</span></a>
<aside class="em-consent" id="em-consent" hidden role="dialog" aria-label="Preferências de privacidade" aria-live="polite"><div><strong>Privacidade e medição</strong><p>Usamos cookies de análise e publicidade para medir a experiência e melhorar nossas campanhas. Consulte nossa <a href="https://metrics.x5med.com.br/politica-de-privacidade" target="_blank" rel="noopener noreferrer">Política de Privacidade</a>.</p></div><div class="em-consent-actions"><button class="em-consent-reject" type="button" data-consent="rejected">Recusar</button><button class="em-consent-accept" type="button" data-consent="accepted">Aceitar</button></div></aside>
<script id="x5med-production-runtime">(function(){
var w=window,d=document,keys=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid','wbraid','gbraid'],storage='escalamed-attribution-v1',attribution={};
try{var current=new URLSearchParams(location.search);keys.forEach(function(k){var v=current.get(k);if(v)attribution[k]=v;});if(Object.keys(attribution).length)sessionStorage.setItem(storage,JSON.stringify(attribution));else attribution=JSON.parse(sessionStorage.getItem(storage)||'{}');}catch(e){}
d.querySelectorAll('a[href^="https://formulario-escalamed.x5med.com.br"]').forEach(function(a){try{var u=new URL(a.href);Object.keys(attribution).forEach(function(k){if(!u.searchParams.has(k))u.searchParams.set(k,attribution[k]);});a.href=u.toString();}catch(e){}});
function push(event,payload){w.dataLayer=w.dataLayer||[];w.dataLayer.push(Object.assign({event:event},payload||{}));}
d.querySelectorAll('[data-track-cta]').forEach(function(a){a.addEventListener('click',function(){push('cta_click',{cta_position:a.getAttribute('data-track-cta')||'unknown',cta_label:(a.textContent||'').trim(),destination_url:a.href});});});
d.querySelectorAll('[data-track-map]').forEach(function(a){a.addEventListener('click',function(){push('map_click',{location_name:a.getAttribute('data-track-map')||'unknown',destination_url:a.href});});});
var thresholds=[25,50,75,90],reached={};function trackScroll(){var total=d.documentElement.scrollHeight-innerHeight,p=total>0?Math.round(scrollY/total*100):100;thresholds.forEach(function(t){if(p>=t&&!reached[t]){reached[t]=true;push('scroll_depth',{percent_scrolled:t});}});}addEventListener('scroll',trackScroll,{passive:true});trackScroll();
if('IntersectionObserver'in w){var viewed={};var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(!entry.isIntersecting)return;var s=entry.target,id=s.id;if(!id||viewed[id])return;viewed[id]=true;push('section_view',{section_id:id,section_title:((s.querySelector('h1,h2,h3')||{}).textContent||id).trim()});observer.unobserve(s);});},{threshold:.35});d.querySelectorAll('section[id]').forEach(function(s){observer.observe(s);});}
var banner=d.getElementById('em-consent');var match=d.cookie.match(/(?:^|; )x5med_consent=([^;]*)/);var choice=match?decodeURIComponent(match[1]):'unknown';if(choice==='unknown')banner.hidden=false;
d.querySelectorAll('[data-consent]').forEach(function(btn){btn.addEventListener('click',function(){var next=btn.getAttribute('data-consent'),shared=location.hostname==='x5med.com.br'||location.hostname.endsWith('.x5med.com.br');d.cookie='x5med_consent='+next+'; Path=/; Max-Age=31536000; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'')+(shared?'; Domain=.x5med.com.br':'');var granted=next==='accepted'?'granted':'denied';w.gtag('consent','update',{ad_storage:granted,analytics_storage:granted,ad_user_data:granted,ad_personalization:granted});push('consent_update',{consent_choice:next});banner.hidden=true;});});
})();</script>`;

html = html.replace("</body>", `${productionUi}\n</body>`);

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, html, "utf8");
console.log(`Generated ${path.relative(root, outputPath)} (${html.length} characters, ${ctaIndex} CTAs).`);
