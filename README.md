# EscalaMED - versão B

Landing page alternativa do EscalaMED, construída a partir da referência aprovada e publicada como um projeto Next.js independente.

## Desenvolvimento

```bash
npm install
npm run dev
```

O projeto usa o App Router do Next.js. A rota `/` é renderizada estaticamente pelo componente `app/page.tsx`, com a camada de interação em React, metadados, GTM, consentimento, atribuição, dados legais, formulário de contato comercial e WhatsApp.

O arquivo `source/version-b.html` permanece apenas como referência visual aprovada. Durante o build, `lib/reference-page.ts` transforma essa referência em markup server-rendered; não há redirecionamento para HTML público nem dependência de uma página estática externa.

## Qualidade e movimento

- Hero em alta resolução com WebP otimizado.
- Microinterações em CTAs, navegação, cards, FAQ e WhatsApp.
- Entradas progressivas por rolagem e parallax leve na hero.
- Respeito automático à preferência `prefers-reduced-motion`.

## Produção

- Domínio: `https://escalamed-b.x5med.com.br`
- Formulário embutido: `/#formulario` → `POST /api/leads` → webhook protegido do Metrics.
- GTM: `GTM-M4GT66JQ`

## Captação LP-NOVO

- WhatsApp é o contato obrigatório; e-mail vazio/ausente não é enviado ao CRM. Nunca inventar um e-mail para contornar uma recusa.
- `METRICS_LP_NOVO_WEBHOOK_URL` e `METRICS_LP_NOVO_WEBHOOK_TOKEN` são configurações somente do servidor, obrigatórias no ambiente de publicação.
- `companyWebsite` preenchido não descarta mais o cadastro: envia `suspeito: true` e uma observação para revisão, sem transmitir o conteúdo desse campo.
- Cargo, faturamento, `diagnostic_score` e UTMs seguem no JSON e nas observações do CRM. O webhook genérico persiste os campos mapeados e as observações; os campos extras não substituem esse registro.
- “Médico sem clínica própria” oculta e limpa faturamento, mostra aviso, permite envio e registra o perfil nas observações e em `sem_clinica_propria`.
- `generate_lead` só ocorre após confirmação de sucesso da API. Campos transitórios de erro/rolagem são limpos em cada evento e logo após o push.
- WhatsApp comercial `(79) 99938-3447` e retorno “ainda hoje” confirmados pelo responsável em 06/11/2026.
- O Metrics recusava alguns testes por `identity_conflict`, uma ambiguidade entre identidades existentes, não por obrigatoriedade de e-mail. Correção correspondente no repositório do Metrics: `20261106102541_lp_novo_phone_identity_review.sql`, restrita ao endpoint LP-NOVO. A migração preserva uma nova identidade para revisão quando o telefone sem e-mail é compartilhado, sem fundir ou alterar cadastros anteriores.

## Validação

```bash
npm test          # Node 22.18+ / 24: regressões da API e tracking, CRM simulado
npm run check    # tipos e build
```

Testes locais usam um CRM simulado; sucesso neles não comprova persistência em produção. Conferir também o recibo do webhook e a participação no funil `EscalaMED · LP-NOVO`. Publicação e migração são operações distintas.
