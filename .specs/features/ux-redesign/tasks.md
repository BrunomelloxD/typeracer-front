# Redesign UX/UI — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/ux-redesign/design.md`
**Status**: Approved

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec. Guidelines found: none. The repo has no tests and the user chose not to add a test framework (AD-002), so every layer is gated by lint + build, and acceptance is checked by the Verifier through `file:line` reading.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Components (`src/components/*.tsx`) | none (AD-002) | build + lint; ACs checked by Verifier with `file:line` | - | gate only |
| Pages (`src/pages/*.tsx`) | none (AD-002) | build + lint; ACs checked by Verifier with `file:line` | - | gate only |
| UI hooks (`src/hooks/useConnectionStatus.ts`, `useRaceFocusMode.ts`) | none (AD-002) | build + lint | - | gate only |
| Styles / HTML / config | none | build gate only | - | gate only |

## Gate Check Commands

> Lint ratchet: pre-existing errors live in `TypingArea.tsx` (fixed in T7) and `SoloPage.tsx` (fixed in T19). Until a file is rewritten, the gate ignores only that file. From T19 on, the full lint runs.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| ratchet-A | T1–T6 | `npm run build && npx eslint . --ignore-pattern src/components/TypingArea.tsx --ignore-pattern src/pages/SoloPage.tsx` |
| ratchet-B | T7–T18 | `npm run build && npx eslint . --ignore-pattern src/pages/SoloPage.tsx` |
| build | T19–T24 | `npm run lint && npm run build` |

---

## Execution Plan

### Phase 1: Fundação

```
T1 → T2 → T3 → T4
```

### Phase 2: Componentes base

```
T5 → T6 → T7 → T8 → T9 → T10 → T11
```

### Phase 3: Conexão e shell

```
T12 → T13 → T14 → T15
```

### Phase 4: Home e Solo

```
T16 → T17 → T18 → T19
```

### Phase 5: Duel e limpeza

```
T20 → T21 → T22 → T23 → T24 → T25
```

---

## Task Breakdown

### T1: Override de lint para os hooks de jogo

**What**: Desligar `react-hooks/refs`, `react-hooks/purity` e `react-hooks/set-state-in-effect` só em `src/hooks/**`, com comentário citando AD-001.
**Where**: `eslint.config.js`
**Depends on**: None
**Requirement**: (suporte ao gate; AD-001)
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] `npx eslint src/hooks` sai com 0 erros
- [x] Gate ratchet-A passa

**Tests**: none (config)
**Gate**: ratchet-A
**Commit**: `build(lint): scope react-hooks compiler rules off for game hooks`

---

### T2: Versionar auditoria, direção, FigCraft e plano

**What**: Commitar `.specs/` (auditoria, direção, `index.figcraft`, previews, gerador, spec, design, tasks, STATE).
**Where**: `.specs/`
**Depends on**: T1
**Requirement**: (documentação)
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] `git ls-files .specs` lista os artefatos
- [x] Gate ratchet-A passa

**Tests**: none (docs)
**Gate**: ratchet-A
**Commit**: `docs(specs): add ux audit, visual direction, figcraft designs and plan`

---

### T3: Tokens de tema e CSS global

**What**: Reescrever `index.css`: `@theme` com tokens, remover CSS do template, foco visível latão, reduced-motion, caret, `.race-dim`, animação de countdown.
**Where**: `src/index.css`
**Depends on**: T2
**Requirement**: GLOB-01, GLOB-02, GLOB-04, GLOB-05, GLOB-06
**Tools**: MCP: NONE · Skill: high-end-visual-design

**Done when**:
- [x] Nenhuma regra `#root`, `h1`, `h2`, `--text-h` do template
- [x] Tokens com os hex da spec
- [x] Gate ratchet-A passa

**Tests**: none (styles)
**Gate**: ratchet-A
**Commit**: `feat(ui): add graphite and brass theme tokens and drop vite template css`

---

### T4: HTML base

**What**: `lang="pt-BR"`, `meta description`, `theme-color`, preconnect + `<link>` Google Fonts (Geist, JetBrains Mono).
**Where**: `index.html`
**Depends on**: T3
**Requirement**: GLOB-03, GLOB-04
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] `lang="pt-BR"` e description presentes
- [x] Gate ratchet-A passa

**Tests**: none (html)
**Gate**: ratchet-A
**Commit**: `feat(ui): set pt-br document metadata and load geist and jetbrains mono`

---

### T5: Classes compartilhadas de botão e superfície

**What**: Exportar `btnPrimary`, `btnSecondary`, `btnGhost`, `btnDanger`, `bezelOuter`, `bezelInner`.
**Where**: `src/lib/ui.ts`
**Depends on**: None
**Requirement**: GLOB-07
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Botões com `min-h-11` (44px) e `active:scale-[0.98]`
- [x] Gate ratchet-A passa

**Tests**: none (AD-002)
**Gate**: ratchet-A
**Commit**: `feat(ui): add shared button and bezel class tokens`

---

### T6: Componente Kbd

**What**: `<kbd>` estilizado, com variante sobre o latão.
**Where**: `src/components/Kbd.tsx`
**Depends on**: T5
**Requirement**: KEY-07
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Exporta `Kbd`
- [x] Gate ratchet-A passa

**Tests**: none (AD-002)
**Gate**: ratchet-A
**Commit**: `feat(ui): add kbd hint component`

---

### T7: TypingArea redesenhada

**What**: Cores digitado/não digitado/erro, sublinhado em espaço errado, caret deslizante que pisca só parado, overlay sem foco, foco por qualquer tecla, sem shake, tipografia 20/28px.
**Where**: `src/components/TypingArea.tsx`
**Depends on**: T6
**Requirement**: TYPE-01..TYPE-09
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Sem `setState` síncrono em efeito (erro de lint pré-existente some)
- [x] Gate ratchet-B passa

**Tests**: none (AD-002)
**Gate**: ratchet-B
**Commit**: `feat(typing): redesign typing stage with sliding caret and focus overlay`

---

### T8: RaceStats

**What**: Tempo (latão, `error` em ≤ 5 s), WPM e precisão com 1 casa pt-BR, sem `aria-live`.
**Where**: `src/components/RaceStats.tsx`
**Depends on**: T7
**Requirement**: MET-01, MET-02, MET-03, MET-04
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Nenhum `aria-live` no arquivo
- [x] Gate ratchet-B passa

**Tests**: none (AD-002)
**Gate**: ratchet-B
**Commit**: `feat(metrics): add race stats row without live announcements`

---

### T9: RaceTrack

**What**: Pista com faixas (nome, tag, trilho, marcador, %), `role="progressbar"` por faixa.
**Where**: `src/components/RaceTrack.tsx`
**Depends on**: T8
**Requirement**: DUEL-02
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Marcador e preenchimento animam só com `transform`
- [x] Gate ratchet-B passa

**Tests**: none (AD-002)
**Gate**: ratchet-B
**Commit**: `feat(duel): add race track with player and opponent lanes`

---

### T10: Countdown

**What**: Número latão com animação scale+fade, rótulo "prepare-se", "Já" no zero, `role="status"` `aria-live="polite"`.
**Where**: `src/components/Countdown.tsx`
**Depends on**: T9
**Requirement**: GLOB-06, DUEL-07
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Sem `role="timer"`/`assertive`
- [x] Gate ratchet-B passa

**Tests**: none (AD-002)
**Gate**: ratchet-B
**Commit**: `feat(duel): restyle countdown with polite live region`

---

### T11: CopyButton

**What**: `label`, `copiedLabel`, `variant`, estado de falha "Não foi possível copiar", anúncio em região viva separada.
**Where**: `src/components/CopyButton.tsx`
**Depends on**: T10
**Requirement**: DUEL-04, edge case de clipboard
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Chamada atual `<CopyButton value={code} />` continua compilando
- [x] Gate ratchet-B passa

**Tests**: none (AD-002)
**Gate**: ratchet-B
**Commit**: `feat(duel): support copied and failed states in copy button`

---

### T12: useConnectionStatus

**What**: Hook que deriva `connected|connecting|reconnecting|offline` de eventos do socket, do Manager e da janela.
**Where**: `src/hooks/useConnectionStatus.ts`
**Depends on**: None
**Requirement**: CONN-02, CONN-03, edge case `navigator.onLine`
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] `setState` só em callbacks de evento
- [x] Gate ratchet-B passa

**Tests**: none (AD-002)
**Gate**: ratchet-B
**Commit**: `feat(connection): add connection status hook with reconnecting state`

---

### T13: ConnectionBadge com 4 estados

**What**: Prop `status: ConnectionStatus`; cores e textos da spec; ajustar as duas chamadas no DuelPage para `status={connected ? 'connected' : 'connecting'}` (o hook entra no T21).
**Where**: `src/components/ConnectionBadge.tsx`
**Depends on**: T12
**Requirement**: CONN-01
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] 4 estados com texto
- [x] Gate ratchet-B passa

**Tests**: none (AD-002)
**Gate**: ratchet-B
**Commit**: `feat(connection): show four connection states in badge`

---

### T14: useRaceFocusMode

**What**: Hook que marca `body[data-race="running"]` enquanto ativo.
**Where**: `src/hooks/useRaceFocusMode.ts`
**Depends on**: T13
**Requirement**: MET-06
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Cleanup remove o atributo
- [x] Gate ratchet-B passa

**Tests**: none (AD-002)
**Gate**: ratchet-B
**Commit**: `feat(ui): add race focus mode hook`

---

### T15: Header

**What**: Logo mono, nav em pílula com `aria-current`, chip com inicial do jogador, `.race-dim`.
**Where**: `src/components/Header.tsx`
**Depends on**: T14
**Requirement**: MET-06, GLOB-07
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Sem classes `zinc/emerald`
- [x] Gate ratchet-B passa

**Tests**: none (AD-002)
**Gate**: ratchet-B
**Commit**: `feat(ui): restyle header with focus-mode dimming`

---

### T16: HomePage

**What**: Hero com "Erre pouco." e caret, campo de nome em bezel, cards Solo e Duelo com chips, aviso de `redirectTo`, faixa de estatísticas do histórico.
**Where**: `src/pages/HomePage.tsx`
**Depends on**: None
**Requirement**: HOME-01..HOME-04, KEY-06, KEY-07
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Enter navega para `redirectTo` ou `/solo`
- [x] Gate ratchet-B passa

**Tests**: none (AD-002)
**Gate**: ratchet-B
**Commit**: `feat(home): redesign home with mode cards and history stats`

---

### T17: SoloResult

**What**: Cartão de resultado com WPM grande, delta vs. média, recorde, 4 métricas, barras das últimas 10, ações com `Kbd`.
**Where**: `src/components/SoloResult.tsx`
**Depends on**: T16
**Requirement**: RES-01, RES-02, RES-03, KEY-03
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Botão primário recebe `ref` para foco
- [x] Gate ratchet-B passa

**Tests**: none (AD-002)
**Gate**: ratchet-B
**Commit**: `feat(solo): add result card with history comparison`

---

### T18: SoloHistory

**What**: Lista das últimas partidas extraída do SoloPage, com empty state e limpeza em dois passos.
**Where**: `src/components/SoloHistory.tsx`
**Depends on**: T17
**Requirement**: STATE-01, STATE-04
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Sem `window.confirm`
- [x] Gate ratchet-B passa

**Tests**: none (AD-002)
**Gate**: ratchet-B
**Commit**: `feat(solo): add history list with empty state and inline clear confirm`

---

### T19: SoloPage

**What**: Layout novo (RaceStats, TypingArea, ProgressBar, "Reiniciar" após a área, Esc = novo texto), resultado no lugar do palco, foco no "Jogar novamente", modo foco, loading/erro novos, redirect com `redirectTo`, `finished` derivado.
**Where**: `src/pages/SoloPage.tsx`
**Depends on**: T18
**Requirement**: KEY-01, KEY-02, KEY-03, MET-05, MET-06, RES-01, RES-06, STATE-02, STATE-03, STATE-04, HOME-05
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Payload de `submitScore` e `pushEntry` idêntico ao anterior e enviado uma vez por partida
- [x] `npm run lint` completo passa (último erro pré-existente some)
- [x] Gate build passa

**Tests**: none (AD-002)
**Gate**: build
**Commit**: `feat(solo): redesign solo race with keyboard restart and inline result`

---

### T20: DuelResult

**What**: Ranking com manchete ("Você venceu" / "Você ficou em nº"), diferença de WPM, barras, ações com `Kbd`.
**Where**: `src/components/DuelResult.tsx`
**Depends on**: None
**Requirement**: RES-04, RES-05, KEY-04
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Botão primário recebe `ref`
- [x] Gate build passa

**Tests**: none (AD-002)
**Gate**: build
**Commit**: `feat(duel): add final ranking card`

---

### T21: DuelPage

**What**: Lobby em cards, `?code=` preenchido, espera com dígitos/link/presença, countdown com texto e caret, pista + texto único, banner de conexão, saída do oponente com ação, Esc cancela, resultado com foco, live region de resultado, redirect com `redirectTo`, modo foco.
**Where**: `src/pages/DuelPage.tsx`
**Depends on**: T20
**Requirement**: DUEL-01..DUEL-09, CONN-04, CONN-05, KEY-04, KEY-05, RES-06, HOME-05
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Mesmos eventos e payloads de socket (diff dos `socket.emit`/`socket.on` sem mudança de nome ou campo)
- [x] Gate build passa

**Tests**: none (AD-002)
**Gate**: build
**Commit**: `feat(duel): redesign duel flow with race track, invite link and connection states`

---

### T22: ProgressBar

**What**: `tone: 'accent'|'rival'`, preenchimento com `scaleX`, trilho `line`.
**Where**: `src/components/ProgressBar.tsx`
**Depends on**: T21
**Requirement**: GLOB-01 (tokens), GLOB-06
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Sem `transition-all` em `width`
- [x] Gate build passa

**Tests**: none (AD-002)
**Gate**: build
**Commit**: `perf(ui): animate progress bar with transform and theme tones`

---

### T23: NotFoundPage

**What**: 404 no estilo A.
**Where**: `src/pages/NotFoundPage.tsx`
**Depends on**: T22
**Requirement**: STATE-05
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Gate build passa

**Tests**: none (AD-002)
**Gate**: build
**Commit**: `feat(ui): restyle not found page`

---

### T24: Remover StatPill órfão

**What**: Apagar o componente que ficou sem uso após T19/T21.
**Where**: `src/components/StatPill.tsx`
**Depends on**: T23
**Requirement**: (limpeza de órfão)
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] `grep -r StatPill src` vazio
- [x] Gate build passa

**Tests**: none (AD-002)
**Gate**: build
**Commit**: `refactor(ui): remove unused stat pill component`

---

### T25: App shell nos tokens (gap encontrado no Lote 4)

**What**: Trocar `bg-zinc-950 text-zinc-100` e o skip link `emerald/zinc` do `App.tsx` pelos tokens (AD-003).
**Where**: `src/App.tsx`
**Depends on**: T24
**Requirement**: GLOB-01, GLOB-05
**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] `grep -rnE "zinc-|emerald-|sky-|amber-|rose-" src` vazio
- [x] Gate build passa

**Tests**: none (AD-002)
**Gate**: build
**Commit**: `fix(ui): move app shell and skip link to theme tokens`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
```

## Validation Tables

**Granularity:** todas as tasks têm 1 arquivo, exceto T2 (pasta de docs) e T13 (badge + 2 linhas de chamada no DuelPage, necessárias para o build continuar verde).

**Diagram-Definition Cross-Check:** cada fase é uma cadeia; cada task depende da anterior na mesma fase; a primeira de cada fase não tem dependência dentro da fase. ✅

**Test Co-location:** toda camada está como `none` na matriz (AD-002); todas as tasks dizem `none`. ✅
