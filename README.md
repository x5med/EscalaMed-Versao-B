# EscalaMED - versão B

Landing page alternativa do EscalaMED, construída a partir da referência aprovada e publicada como um projeto Next.js independente.

## Desenvolvimento

```bash
npm install
npm run dev
```

O projeto usa o App Router do Next.js. A rota `/` é renderizada estaticamente pelo componente `app/page.tsx`, com a camada de interação em React, metadados, GTM, consentimento, atribuição, dados legais, preço parcelado e WhatsApp.

O arquivo `source/version-b.html` permanece apenas como referência visual aprovada. Durante o build, `lib/reference-page.ts` transforma essa referência em markup server-rendered; não há redirecionamento para HTML público nem dependência de uma página estática externa.

## Qualidade e movimento

- Hero em alta resolução com WebP otimizado.
- Microinterações em CTAs, navegação, cards, FAQ e WhatsApp.
- Entradas progressivas por rolagem e parallax leve na hero.
- Respeito automático à preferência `prefers-reduced-motion`.

## Produção

- Domínio: `https://escalamed-b.x5med.com.br`
- Formulário: `https://formulario-escalamed.x5med.com.br/`
- GTM: `GTM-M4GT66JQ`
