# Opalina — landing page premium para odontologia estética

Demonstração de portfólio (pacote **Avançado / Premium**) de uma landing page para
uma clínica de odontologia estética. **Opalina é uma clínica fictícia**: todo dado
que uma clínica real precisaria comprovar aparece como espaço reservado visível,
nunca como fato.

Conceito: **"Luz através do esmalte"** — superfícies de porcelana, reflexos
perolados e precisão silenciosa. Assinaturas visuais: a janela oval com luz
perolada (ShaderGradient) e a **escala de cor** interativa, inspirada na escala
que dentistas usam para escolher o tom dos dentes.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS 4 — tokens em `src/app/globals.css` (`@theme`)
- Motion (`motion/react`) — interações, estados e transições de interface
- Anime.js 4 — desenho do arco do Método sincronizado ao scroll (SVG)
- ShaderGradient (`@shadergradient/react` + React Three Fiber) — luz perolada
- Componentes adaptados: Cult UI (`text-animate` → `LightSweepText`,
  `texture-card` → `TextureFrame`) e Skiper UI (`skiper58` → `TextRoll`)
- Biome · Vitest · Playwright · pnpm

## Rodar

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm build && pnpm start
```

Qualidade:

```bash
pnpm typecheck      # TypeScript
pnpm check          # Biome (lint + format)
pnpm test           # testes unitários (Vitest)
pnpm e2e            # testes end-to-end (Playwright; sobe o build na porta 3100)
```

## Transformar em site de uma clínica real

1. Edite **`src/content/clinic.ts`**. Todo o texto e os dados da página estão ali.
   Troque cada `placeholder("…")` por informação real e verificada: endereço,
   telefone, WhatsApp (dígitos E.164, ex.: `5511900000000`), horário, links,
   profissional, CRO, responsável técnico, avaliações e convênios.
2. Revise a copy dos tratamentos e do FAQ com a profissional. Os textos atuais
   são cautelosos e genéricos de propósito.
3. Substitua a moldura do retrato (`src/components/sections/doctor.tsx`) por uma
   fotografia real da profissional.
4. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SITE_URL` — domínio público (canonical, Open Graph, sitemap);
   - `NEXT_PUBLIC_ALLOW_INDEXING=true` — libera a indexação. Por padrão a demo
     envia `noindex` e `robots.txt` bloqueia tudo, para uma clínica fictícia
     não aparecer em buscas.
5. Remova o aviso de demonstração do rodapé (`src/components/layout/footer.tsx`).

Com o WhatsApp preenchido, o formulário abre uma conversa já com a mensagem
montada (`wa.me`). Enquanto o número for um placeholder, o envio mostra
"Demonstração: configure o número…" em vez de simular sucesso.

Antes de publicar, confira as regras de publicidade odontológica do CFO/CRO
(por exemplo, identificação do responsável técnico e restrições a antes/depois)
e a LGPD. Este projeto não declara conformidade jurídica.

## Decisões

- **Sem fotografia de banco de imagem.** As superfícies são o shader e
  "espécimes" em SVG que mostram o que cada tratamento faz. Nenhuma imagem
  sugere pacientes ou resultados.
- **Performance:** o three.js do shader só carrega após a primeira interação
  (ponteiro, toque, scroll ou teclado) e desmonta fora da tela. O título do hero
  anima só com CSS e pinta no primeiro frame. As fontes são subconjuntos de pesos
  únicos (~94 KB).
- **Movimento reduzido:** com `prefers-reduced-motion`, tudo fica visível e
  estático, o arco aparece completo e o shader é trocado pelo gradiente estático.
- **Acessibilidade:** rádios nativos na escala de cor, acordeão de tratamentos
  navegável por setas, `<details>` no FAQ, contraste AA verificado.

Lighthouse (mobile, build local): Performance 82 · Acessibilidade 100 ·
Boas práticas 100 · SEO 66 (a nota de SEO reflete o `noindex` proposital).

## Segurança

Cabeçalhos em `next.config.ts`: CSP, `X-Frame-Options: DENY`,
`frame-ancestors 'none'`, HSTS, `nosniff`, `Referrer-Policy` e
`Permissions-Policy`. O JSON-LD é serializado com `<` escapado. Links externos
vindos do conteúdo aceitam apenas `https:`. Builds nativos de dependências ficam
bloqueados em `pnpm-workspace.yaml`.

## Créditos

- [Cult UI](https://www.cult-ui.com) (MIT) — base de `LightSweepText` e `TextureFrame`
- [Skiper UI](https://skiper-ui.com) (componente gratuito `skiper58`) — base de `TextRoll`
- [ShaderGradient](https://shadergradient.co) — preset `cottonCandy` como ponto de partida
- Fontes: Newsreader, Hanken Grotesk e IBM Plex Mono (Google Fonts, self-hosted via `next/font`)
