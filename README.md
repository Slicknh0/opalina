# Opalina — landing page premium para odontologia estética

Demonstração de portfólio (pacote **Avançado / Premium**) de uma landing page para
uma clínica de odontologia estética. **Opalina é uma clínica fictícia**: endereço,
contatos, profissional, CRO e depoimento são dados fictícios, identificados como
tal no rodapé. Os botões de contato ficam em modo demo (sem `tel:` nem `wa.me`), e
a página não exibe estatísticas nem avaliações numéricas inventadas.

Conceito: **"Luz através do esmalte"** — superfícies de porcelana, reflexos
perolados e precisão silenciosa. Assinaturas visuais:

- **Cena do dente (hero):** um molar de vidro e porcelana, gerado com a Agnes AI,
  gira com o scroll, abre em camadas (esmalte, dentina, polpa) e vira um implante.
- **Escala de cor** interativa, inspirada na escala que dentistas usam para
  escolher o tom dos dentes.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS 4 — tokens em `src/app/globals.css` (`@theme`)
- Motion (`motion/react`) — interações, estados e transições de interface
- Anime.js 4 — linhas e rótulos das camadas do dente e arco do Método (SVG)
- ShaderGradient (`@shadergradient/react` + React Three Fiber) — halo de luz perolada
- Agnes AI (`agnes-image-2.1-flash`, `agnes-video-v2.0`) — renders 3D e o vídeo
  da rotação, gerados offline (ver "Assets 3D")
- Componentes adaptados: Cult UI (`texture-card` → `TextureFrame`) e
  Skiper UI (`skiper58` → `TextRoll`, agora em CSS)
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

## Assets 3D (Agnes AI)

Os renders do dente, do corte, do implante e dos tratamentos, e o vídeo da
rotação, foram gerados **uma vez, fora do site**. O site publicado é estático e
nunca chama a API.

- `scripts/agnes/assets.json` — manifesto versionado com todos os prompts e o
  sufixo de estilo compartilhado (material, luz, fundo porcelana).
- `pnpm assets:generate` — chama a Agnes e salva as saídas brutas em `art/raw/`
  (fora do git). Precisa de `AGNES_API_KEY` em `.env.local` (fora do git).
  Retoma de onde parou; `--only <id>` regenera um asset; `--dry-run` só lista.
  As URLs da Agnes são temporárias: gere edições e o vídeo na mesma sessão das
  imagens de entrada.
- **Checagem visual obrigatória** antes de processar: mesmo dente em todas as
  vistas, nenhuma raiz "derretendo" no trecho do vídeo que vai ao site.
- `pnpm assets:process` (com `FFMPEG_PATH` apontando para o `ffmpeg.exe`) —
  gera os WebP em `public/tooth/` e `public/treatments/`: frames nativos de
  640 px (24 no desktop, 12 no mobile) do trecho limpo do vídeo (0–1 s) e stills
  em 640/1024 px, com o fundo clareado para sumir sobre a página.

Os renders são **ilustrações**: não mostram pessoas, pacientes nem resultados.
A chave usada foi exposta em conversa; **revogue-a e gere outra** no painel da
Agnes antes de reutilizar o script.

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

- **Sem fotografia de banco de imagem.** Os visuais são renders 3D gerados com a
  Agnes AI, com legenda "Ilustração 3D". Nenhuma imagem sugere pacientes ou
  resultados.
- **Cena do dente:** a cena é renderizada no servidor. Uma ilha client mínima
  acompanha o scroll e escreve a etapa atual em `data-beat`, e o CSS troca os
  textos. A rotação é uma sequência de frames num canvas; corte e implante
  entram por máscaras ovais (Motion); os rótulos das camadas são desenhados pelo
  Anime.js.
- **Performance:** o poster do dente (12 KB) é o único asset da cena no primeiro
  carregamento. Frames, rótulos e o shader (three.js) só carregam após a primeira
  interação, e as seções abaixo da dobra usam `content-visibility: auto`.
  O título do hero anima só com CSS. Fontes com pesos únicos (~94 KB).
- **Movimento reduzido:** com `prefers-reduced-motion`, nada fica fixo: os três
  estágios do dente aparecem empilhados com seus textos, o arco aparece completo e
  o shader é trocado pelo gradiente estático.
- **Acessibilidade:** rádios nativos na escala de cor, acordeão de tratamentos
  navegável por setas, `<details>` no FAQ, contraste AA verificado.

Lighthouse (mobile simulado, build local): Performance 76–79 · Acessibilidade 100 ·
Boas práticas 100 · SEO 69 · CLS 0. A nota de SEO reflete o `noindex` proposital.
A performance varia bastante entre execuções nesta máquina; o LCP é o poster do
dente (~3,5 s simulado).

## Segurança

Cabeçalhos em `next.config.ts`: CSP, `X-Frame-Options: DENY`,
`frame-ancestors 'none'`, HSTS, `nosniff`, `Referrer-Policy` e
`Permissions-Policy`. O JSON-LD é serializado com `<` escapado. Links externos
vindos do conteúdo aceitam apenas `https:`. Builds nativos de dependências ficam
bloqueados em `pnpm-workspace.yaml`.

## Créditos

- [Agnes AI](https://agnes-ai.com) — renders 3D e vídeo da rotação do dente
- [Cult UI](https://www.cult-ui.com) (MIT) — base de `TextureFrame`
- [Skiper UI](https://skiper-ui.com) (componente gratuito `skiper58`) — base de `TextRoll`
- [ShaderGradient](https://shadergradient.co) — preset `cottonCandy` como ponto de partida
- Fontes: Newsreader, Hanken Grotesk e IBM Plex Mono (Google Fonts, self-hosted via `next/font`)
