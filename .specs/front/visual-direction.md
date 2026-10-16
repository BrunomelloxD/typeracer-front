# Direção visual — propostas

Sem imagem de referência. As propostas saem da auditoria (`audit.md`) e de padrões consolidados em apps de digitação:
- **Monkeytype**: texto apagado → texto cheio ao digitar, caret fino que desliza, tela que "some" durante o teste, reinício com Tab+Enter.
- **TypeRacer**: pista com carros/faixas, comparação lado a lado, convite por link.
- **keybr**: tipografia mono grande, foco em legibilidade e ritmo, métricas discretas.

Princípio comum às duas direções: **durante a corrida só existem o texto, o caret, a pista e um número**. O resto recua.

Ajuste do high-end-visual-design para um produto de uso repetido (não landing page): macro-whitespace, double-bezel e motion ficam no "palco" do texto e no cartão de resultado. Não há scroll-reveal nem animação durante a digitação. As curvas são `cubic-bezier(.32,.72,0,1)` e tudo é desligado com `prefers-reduced-motion`.

---

## A — Graphite & Brass (escuro, foco)

Grafite quente-neutro com **um só destaque**: latão. O latão marca o caret, o CTA primário e "você". O oponente usa um azul-aço dessaturado, como cor de *dado*, não de destaque.

| Token | Hex | Uso | Contraste* |
|---|---|---|---|
| `bg` | `#0E0F12` | fundo | — |
| `surface` | `#16181D` | palco do texto, cartões | — |
| `surface-2` | `#1D2027` | inputs, hover | — |
| `line` | `#2A2D35` | hairlines | — |
| `text` | `#E8E6E1` | texto, caractere digitado correto | 15,4 |
| `muted` | `#8A8F98` | rótulos | 5,9 |
| `untyped` | `#80858F` | texto ainda não digitado | 5,2 / 4,8 |
| `accent` (brass) | `#E2B75A` | caret, CTA, "você" | 10,2 |
| `on-accent` | `#0E0F12` | texto sobre CTA | 10,2 |
| `rival` (steel) | `#7FA7C9` | oponente | 7,6 |
| `error` | `#F0716B` | caractere errado | 6,6 |
| `ok` | `#7BC89A` | conectado/sucesso (só em badges) | — |

*Contraste sobre `bg` / `surface`.

- **Tipografia**: UI em **Geist** (400/500/600, tracking −0,02em nos títulos). Texto de digitação em **JetBrains Mono** 400, com 28px no desktop e 20px no mobile, `line-height 1.7` e `ch` fixo (largura de linha previsível). Números com `tabular-nums`. Carregadas via `<link>` do Google Fonts no `index.html`, sem dependência npm e com fallback para `ui-monospace`.
- **Densidade**: confortável. Palco do texto com `max-width: 72ch`, `p-8` no desktop e `p-5` no mobile. Header compacto (56px).
- **Superfícies**: palco do texto e resultado em "double-bezel" sutil (moldura `surface` + núcleo `bg` com hairline `white/6`). Sem sombras pretas, só um ring de 1px.
- **Motion**: o caret desliza com `transform` (120ms) e pisca só depois de 500ms parado. Contagem com scale 1.15→1 + fade (300ms). Faixas da pista com `scaleX`. O resultado entra com fade-up de 8px (240ms). Com reduced-motion, tudo é instantâneo e o caret não pisca.
- **Erro**: o caractere fica `error` com fundo `error/12`, e o espaço errado aparece como `·` vermelho. Nada treme.

## B — Paper Ledger (claro, editorial)

Papel quente, tinta quase preta e **laranja-queimado** como destaque. Remete a caderno e máquina de escrever.

| Token | Hex | Uso | Contraste* |
|---|---|---|---|
| `bg` | `#F4F1EA` | fundo | — |
| `surface` | `#FBF9F4` | palco, cartões | — |
| `line` | `#DDD7CB` | hairlines | — |
| `text` | `#1C1B19` | texto, digitado | 15,3 |
| `muted` | `#5F5B53` | rótulos | 6,0 |
| `untyped` | `#6E6A62` | não digitado | 4,8 / 5,1 |
| `accent` | `#C2410C` | caret, CTA, você | 4,6 |
| `rival` | `#3D5A80` | oponente | 6,3 |
| `error` | `#B42318` | erro | 5,8 |

- **Tipografia**: títulos em **Fraunces** (serif variável, opsz alto), UI em **Geist**, texto de digitação em **IBM Plex Mono** com 26px e `line-height 1.75`.
- **Densidade**: mais arejada e editorial. Margens largas e resultado como "recibo" tipográfico.
- **Motion**: quase nenhum. Caret com transição de 80ms e sem animação de entrada. Grão de papel fixo a 3% de opacidade.
- **Risco**: em sessões longas e à noite cansa mais. O `accent` passa AA no limite (4,6), o que limita o uso em texto pequeno. Também rompe com a identidade escura atual (o `body` já é `bg-zinc-950`).

---

## Recomendação: **A — Graphite & Brass**

1. Mantém a identidade escura que já existe, então a mudança é evolutiva e não uma ruptura.
2. Apps de digitação são usados em rajadas longas. Um fundo escuro com texto `#E8E6E1` cansa menos, e o caret latão tem 10:1 de contraste, o que o torna impossível de perder.
3. Resolve G5: um único destaque (latão) e um azul-aço apenas como dado do oponente. Hoje são 4 cores saturadas competindo.
4. Todas as combinações de texto passam AA com folga, inclusive o texto não digitado (hoje em 3,8:1).
5. Motion contido e totalmente desligável, coerente com a meta de "zero distração durante a partida".

> **Decisão (2026-10-16): direção A — Graphite & Brass aprovada.** Fontes via `<link>` Google Fonts (Geist + JetBrains Mono), fallback de sistema.
