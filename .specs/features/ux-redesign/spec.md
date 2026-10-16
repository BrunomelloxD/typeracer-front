# Redesign UX/UI — Graphite & Brass — Specification

## Problem Statement

A auditoria (`.specs/front/audit.md`) encontrou problemas que atrapalham o núcleo do app, que é digitar. O CSS do template Vite sobrescreve o Tailwind. O texto não digitado falha em contraste (3,8:1). O leitor de tela anuncia o timer a cada segundo. O Duel mostra o texto duas vezes. O resultado aparece fora da tela e não existe caminho pelo teclado para jogar de novo. A direção visual A (Graphite & Brass) e as telas do FigCraft (`.specs/front/index.figcraft`) definem o alvo.

## Goals

- [ ] Todas as telas seguem a direção A: tokens de `visual-direction.md` e telas de `.specs/front/previews/`.
- [ ] Toda combinação de texto e fundo usada passa WCAG AA (≥ 4,5:1 em texto normal).
- [ ] Iniciar, reiniciar, trocar texto, jogar de novo e sair funcionam só com o teclado.
- [ ] `npm run lint` e `npm run build` terminam com código 0 ao fim da feature.
- [ ] Zero mudança de comportamento em `useTyping`, `useTimer`, `useSocket`, `store/playerStore.ts` e `lib/socket.ts`.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Mudar regras de jogo (WPM, precisão, duração, eventos de socket) | Restrição do pedido: lógica intocada |
| Framework de testes (Vitest/RTL) | Decisão do usuário (AD-002): gate = lint + build |
| Novas dependências npm de UI (ícones, animação, componentes) | Restrição do pedido |
| Tema claro / alternância de tema | Direção A é só escura |
| WPM ao vivo do oponente | Servidor não envia; só `progress_update` com progresso |
| Revanche com o mesmo oponente | Exige mudança no protocolo do socket |
| Rolagem por linha em textos longos | Textos atuais cabem em ≤ 6 linhas; sem evidência de necessidade |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Fonte de UI | Geist via Google Fonts `<link>`, fallback `ui-sans-serif, system-ui` | Aprovado na direção A; não adiciona pacote npm | y |
| Fonte de digitação | JetBrains Mono via Google Fonts, fallback `ui-monospace` | Aprovado na direção A | y |
| Lint pré-existente nos hooks | Override em `eslint.config.js` desligando `react-hooks/refs`, `react-hooks/purity` e `react-hooks/set-state-in-effect` só para `src/hooks/**` (AD-001) | Escolha do usuário; hooks ficam intocados | y |
| Testes automatizados | Nenhum; gate por task = lint + build; verificação por leitura de código com `file:line` (AD-002) | Escolha do usuário | y |
| Erros de lint em `TypingArea` e `SoloPage` | Corrigidos nas tasks que reescrevem esses arquivos | Os arquivos são reescritos de qualquer forma | y |
| "Jogar novamente" no Solo | Repete o mesmo texto (reseta typing e timer); "Novo texto" busca outro | O design separa as duas ações; antes as duas buscavam texto novo | n |
| Trocar dificuldade com partida em andamento | Troca e carrega texto novo sem `window.confirm`; os controles ficam esmaecidos durante a corrida | Auditoria E3 pede remover modal nativo; a ação é explícita | n |
| Limpar histórico | Confirmação inline em dois passos ("Limpar" → "Confirmar") que expira em 4 s | Substitui `window.confirm` | n |
| Estado "Reconectando" | Hook novo `useConnectionStatus` ouve `socket.io` (manager) e eventos `online`/`offline` da janela; `useSocket` não muda | Aprovado no FigCraft | y |
| Link de convite | `${location.origin}/duel?code=NNNNNN`; o lobby preenche o campo e foca "Entrar na sala"; não entra sozinho | Aprovado no FigCraft; entrar continua sendo ação explícita | y |
| Acesso a `/solo` ou `/duel` sem nome | Redireciona para `/` com `state.redirectTo`; a Home avisa e, ao confirmar o nome, volta para o destino (incluindo `?code=`) | Auditoria H4; preserva o código do convite | n |
| Lógica de fim de partida no Solo | `finished` passa a ser derivado (sem `setState` em efeito); o registro de score continua acontecendo uma única vez | Necessário para o lint passar; mesmo payload e mesma regra de uma vez | n |
| Timer em tom de alerta | Latão normalmente; `error` quando faltam ≤ 5 s | Um destaque só; alerta apenas no fim | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Fundação visual e acessível ⭐ MVP

**User Story**: Como jogador, quero uma interface coerente e legível para ler o texto sem esforço.

**Why P1**: O CSS do template quebra layout e tipografia em todas as telas.

**Acceptance Criteria**:

1. **GLOB-01** The app SHALL define color, font and easing tokens in a Tailwind 4 `@theme` block in `src/index.css` with the hex values of `visual-direction.md` (bg `#0E0F12`, surface `#16181D`, surface-2 `#1D2027`, core `#121419`, line `#2A2D35`, ink `#E8E6E1`, muted `#8A8F98`, untyped `#80858F`, accent `#E2B75A`, rival `#7FA7C9`, error `#F0716B`, ok `#7BC89A`).
2. **GLOB-02** The app SHALL NOT contain the Vite template rules (`#root` width/text-align/border, global `h1`/`h2` sizes, light `:root` variables) in `src/index.css`.
3. **GLOB-03** The document SHALL declare `lang="pt-BR"` and a `meta name="description"` in `index.html`.
4. **GLOB-04** The app SHALL render UI text in Geist and the typing text and numbers in JetBrains Mono, with system fallbacks.
5. **GLOB-05** The app SHALL show a 2px `accent` focus outline with 2px offset on every focusable element when focused by keyboard (`:focus-visible`).
6. **GLOB-06** WHERE the user prefers reduced motion the app SHALL disable animations and transitions, including caret blink and countdown animation.
7. **GLOB-07** Every interactive control SHALL have a touch target of at least 44×44 px.

**Independent Test**: Abrir qualquer rota; inspecionar `index.css` e o DOM; tabular pela página e ver o contorno latão.

---

### P1: Digitação focada ⭐ MVP

**User Story**: Como jogador, quero ver claramente o que digitei, onde errei e onde estou, sem distrações.

**Why P1**: É o núcleo do produto.

**Acceptance Criteria**:

1. **TYPE-01** The typing area SHALL render correctly typed characters in `ink`, not-yet-typed characters in `untyped`, and wrong characters in `error` over an `error` background at 15% opacity.
2. **TYPE-02** IF a typed character is wrong and the expected character is a space THEN the typing area SHALL render a visible 2px `error` underline in that position.
3. **TYPE-03** The typing area SHALL show a caret 2–3px wide in `accent` before the next character to type.
4. **TYPE-04** WHILE the user typed a key in the last 500 ms the caret SHALL stay solid, and after 500 ms without input it SHALL blink.
5. **TYPE-05** WHEN the typing area mounts enabled THEN it SHALL focus its input automatically.
6. **TYPE-06** WHILE the typing area is enabled and its input is not focused it SHALL dim the text and show the message "Clique ou pressione qualquer tecla para focar".
7. **TYPE-07** WHILE the typing input is not focused, WHEN the user presses a printable key with no Ctrl/Alt/Meta outside another text field THEN the typing area SHALL focus its input.
8. **TYPE-08** The typing area SHALL NOT shake or change its border color on errors.
9. **TYPE-09** The typing text SHALL use 20px with line-height 1.7 below 640px and 28px with line-height 1.7 from 640px up.

**Independent Test**: No Solo, digitar com um erro de letra e um de espaço; clicar fora e apertar uma letra.

---

### P1: Métricas sem ruído ⭐ MVP

**User Story**: Como jogador, quero ver tempo, WPM e precisão sem que eles disputem atenção com o texto.

**Why P1**: Métricas são o feedback central e hoje geram spam no leitor de tela.

**Acceptance Criteria**:

1. **MET-01** The race stats SHALL show remaining seconds in `accent` and larger than WPM and accuracy.
2. **MET-02** WHILE remaining time is ≤ 5 s the remaining-time value SHALL use the `error` color.
3. **MET-03** The race stats SHALL show accuracy with exactly one decimal place in pt-BR format (e.g. `97,3%`).
4. **MET-04** The race stats SHALL NOT carry `aria-live` on time, WPM or accuracy.
5. **MET-05** The difficulty selector SHALL label options "Fácil", "Médio" and "Difícil".
6. **MET-06** WHILE a race is running the header, difficulty selector and "Novo texto" SHALL render at 35% opacity, returning to 100% on hover or keyboard focus.

**Independent Test**: Iniciar Solo; ver os três números; ligar leitor de tela e confirmar silêncio durante a digitação.

---

### P1: Teclado de ponta a ponta ⭐ MVP

**User Story**: Como jogador, quero jogar sem tirar as mãos do teclado.

**Why P1**: Requisito explícito do pedido.

**Acceptance Criteria**:

1. **KEY-01** WHEN the user presses Tab inside the Solo typing area THEN focus SHALL move to the "Reiniciar" button, and WHEN the user presses Enter on it THEN the Solo page SHALL restart the same text with time and input reset.
2. **KEY-02** WHEN the user presses Escape on the Solo page THEN the page SHALL load a new text of the current difficulty.
3. **KEY-03** WHEN a Solo race finishes THEN focus SHALL move to the "Jogar novamente" button.
4. **KEY-04** WHEN a Duel race finishes and the final results arrive THEN focus SHALL move to the "Nova partida" button.
5. **KEY-05** WHEN the user presses Escape on the Duel waiting screen THEN the page SHALL cancel the room and return to the lobby.
6. **KEY-06** WHEN the user presses Enter in the Home name field with a non-empty name THEN the app SHALL navigate to `/solo`, or to `state.redirectTo` when present.
7. **KEY-07** Visible keyboard hints (`Kbd`) SHALL show the shortcuts of KEY-01, KEY-02 and KEY-06 next to the controls they trigger.

**Independent Test**: Jogar Solo e Duel do início ao fim sem mouse.

---

### P1: Duel com pista e convite ⭐ MVP

**User Story**: Como jogador de duelo, quero convidar alguém por link e ver a corrida lado a lado num único texto.

**Why P1**: Corrige o texto duplicado e o fluxo de convite.

**Acceptance Criteria**:

1. **DUEL-01** WHILE the Duel is running or counting down the page SHALL render the race text exactly once.
2. **DUEL-02** WHILE the Duel is running the page SHALL show a race track with one lane for the player (`accent`, label "você") and one for the opponent (`rival`), each with a `role="progressbar"` and its percentage.
3. **DUEL-03** WHILE waiting for an opponent the page SHALL show the room code split into 6 digit boxes, a "Copiar link" button, a "Copiar código" button and a player list with the count "1/2" or "2/2".
4. **DUEL-04** WHEN the user activates "Copiar link" THEN the app SHALL write `${location.origin}/duel?code=<code>` to the clipboard and show "Link copiado" for 1.8 s.
5. **DUEL-05** WHEN `/duel` opens with a `code` query param of exactly 6 digits THEN the lobby SHALL prefill the room-code field with it and focus the "Entrar na sala" button.
6. **DUEL-06** IF the `code` query param is not exactly 6 digits THEN the lobby SHALL ignore it and leave the field empty.
7. **DUEL-07** WHILE counting down the page SHALL show the text with the caret at the first character and input disabled.
8. **DUEL-08** IF the opponent leaves the room THEN the page SHALL show "<nome> saiu da sala." with a "Voltar ao lobby" button.
9. **DUEL-09** The Duel page SHALL keep every existing socket emit and listener with the same event names and payloads.

**Independent Test**: Duas abas; criar sala, copiar link, abrir o link na outra aba, correr até o fim.

---

### P1: Conexão visível

**User Story**: Como jogador de duelo, quero saber se estou conectado, conectando ou reconectando.

**Why P1**: Hoje queda e reconexão parecem o estado inicial.

**Acceptance Criteria**:

1. **CONN-01** The connection badge SHALL show one of four states with text: "Conectado" (`ok`), "Conectando…" (`muted`), "Reconectando…" (`accent`), "Sem conexão" (`error`).
2. **CONN-02** WHEN the socket disconnects after having connected at least once THEN the status SHALL become "Reconectando…".
3. **CONN-03** WHEN the browser fires `offline` THEN the status SHALL become "Sem conexão", and WHEN it fires `online` THEN the status SHALL follow the socket state again.
4. **CONN-04** WHILE a Duel race is running and the status is not "Conectado" the page SHALL show a banner with the status text.
5. **CONN-05** WHILE the lobby is not connected the create and join buttons SHALL be disabled and the text "Aguardando conexão com o servidor…" SHALL be linked to them via `aria-describedby`.

**Independent Test**: Derrubar o backend durante o lobby e a corrida e observar o badge e o banner.

---

### P1: Resultado em primeiro plano

**User Story**: Como jogador, quero ver meu resultado logo ao terminar e comparar com meu histórico.

**Why P1**: Hoje o resultado fica abaixo da dobra.

**Acceptance Criteria**:

1. **RES-01** WHEN a Solo race finishes THEN the page SHALL replace the typing area with a result card showing WPM, accuracy (1 decimal), duration in seconds (1 decimal), correct characters and errors.
2. **RES-02** WHERE the Solo history has at least one earlier race the result card SHALL show the difference to the average WPM of earlier races (e.g. "+6 vs. sua média (78)") and the best earlier WPM as "Recorde".
3. **RES-03** WHERE the Solo history has at least two races the result card SHALL show a bar chart of the last up to 10 races with the current race in `accent`.
4. **RES-04** WHEN the Duel final results arrive THEN the page SHALL replace the race area with a ranking showing position, name, WPM, accuracy and time per player, with the current player marked "você".
5. **RES-05** WHEN the Duel final results arrive THEN the headline SHALL read "Você venceu" if the player is position 1, "Você ficou em <n>º" otherwise, followed by the WPM gap to the other player when there are two players.
6. **RES-06** WHEN a race finishes (Solo or Duel) THEN a polite live region SHALL announce the player's WPM and accuracy once.

**Independent Test**: Terminar uma corrida Solo e uma Duel e ver o cartão no topo com foco no botão principal.

---

### P2: Home clara

**User Story**: Como visitante, quero entender os dois modos e começar rápido.

**Why P2**: Melhora a entrada, mas o fluxo já funciona.

**Acceptance Criteria**:

1. **HOME-01** The Home SHALL show a "Solo" card and a "Duelo" card, each with a one-line description and meta chips (Solo: "1 jogador", "60 s", "3 níveis"; Duelo: "2 jogadores", "tempo real", "link ou código").
2. **HOME-02** WHILE the name field is empty the mode buttons SHALL be disabled.
3. **HOME-03** WHEN the Home is reached with `state.redirectTo` THEN it SHALL show "Digite seu nome para continuar." above the name field.
4. **HOME-04** WHERE the Solo history is not empty the Home SHALL show best WPM, average WPM, race count and average accuracy.
5. **HOME-05** WHEN `/solo` or `/duel` is opened without a player name THEN the app SHALL redirect to `/` with `state.redirectTo` set to the original path plus query string.

**Independent Test**: Abrir `/duel?code=123456` em janela anônima e chegar à sala com o código preenchido.

---

### P2: Estados vazios, de carregamento, de erro e 404

**User Story**: Como jogador, quero entender o que acontece quando não há dados, quando carrega ou quando falha.

**Why P2**: Acabamento; os estados já existem em forma básica.

**Acceptance Criteria**:

1. **STATE-01** WHEN the Solo history is empty THEN the Solo page SHALL show "Nenhuma partida ainda" with a one-line explanation.
2. **STATE-02** WHILE the Solo text loads the page SHALL show a 3-line skeleton inside an element with `role="status"` and the sr-only text "Carregando texto…".
3. **STATE-03** IF loading the Solo text fails THEN the page SHALL show "Não foi possível carregar o texto." with the error detail and a "Tentar novamente" button.
4. **STATE-04** The app SHALL NOT call `window.confirm` or `window.alert`.
5. **STATE-05** The 404 page SHALL show "404", the heading "Página não encontrada" and a link "Voltar ao início" in the direction-A style.

**Independent Test**: Limpar histórico; derrubar a API; abrir `/qualquer-coisa`.

---

## Edge Cases

- IF the clipboard API rejects THEN the copy button SHALL show "Não foi possível copiar" for 1.8 s.
- IF the Solo text is shorter than the visible area THEN the typing area SHALL keep its padding and caret behavior (no layout jump).
- WHEN the player is alone in the final ranking THEN the Duel headline SHALL omit the WPM gap.
- WHEN two players tie on WPM THEN the headline SHALL follow the server's `position` field without computing a tie.
- IF `navigator.onLine` is false at mount THEN the connection status SHALL start as "Sem conexão".

---

## Implicit-Requirement Dimensions (sweep)

| Dimension | Resolution |
| --- | --- |
| Input validation & bounds | DUEL-05, DUEL-06 (código de 6 dígitos); nome já limitado a 32 pelo store |
| Failure / partial-failure states | STATE-03, DUEL-08, edge case de clipboard |
| Idempotency / retry / duplicate handling | Assumption "Lógica de fim de partida no Solo": score registrado uma vez |
| Auth boundaries & rate limits | N/A because o app não tem autenticação e a feature não chama endpoints novos |
| Concurrency / ordering | DUEL-09 mantém a ordem de eventos existente; N/A para o resto |
| Data lifecycle / expiry | Histórico local continua limitado a 20 pelo store (sem mudança) |
| Observability | N/A because o app não tem telemetria e a feature é de apresentação |
| External-dependency failure | CONN-01..05; fontes têm fallback de sistema (GLOB-04) |
| State-transition integrity | DUEL-07, KEY-04, KEY-05 sobre as fases existentes lobby → waiting → countdown → running → finished |

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| GLOB-01 | P1: Fundação | Tasks | Verified |
| GLOB-02 | P1: Fundação | Tasks | Verified |
| GLOB-03 | P1: Fundação | Tasks | Verified |
| GLOB-04 | P1: Fundação | Tasks | Verified |
| GLOB-05 | P1: Fundação | Tasks | Verified |
| GLOB-06 | P1: Fundação | Tasks | Verified |
| GLOB-07 | P1: Fundação | Tasks | Verified |
| TYPE-01 | P1: Digitação | Tasks | Verified |
| TYPE-02 | P1: Digitação | Tasks | Verified |
| TYPE-03 | P1: Digitação | Tasks | Verified |
| TYPE-04 | P1: Digitação | Tasks | Verified |
| TYPE-05 | P1: Digitação | Tasks | Verified |
| TYPE-06 | P1: Digitação | Tasks | Verified |
| TYPE-07 | P1: Digitação | Tasks | Verified |
| TYPE-08 | P1: Digitação | Tasks | Verified |
| TYPE-09 | P1: Digitação | Tasks | Verified |
| MET-01 | P1: Métricas | Tasks | Verified |
| MET-02 | P1: Métricas | Tasks | Verified |
| MET-03 | P1: Métricas | Tasks | Verified |
| MET-04 | P1: Métricas | Tasks | Verified |
| MET-05 | P1: Métricas | Tasks | Verified |
| MET-06 | P1: Métricas | Tasks | Verified |
| KEY-01 | P1: Teclado | Tasks | Verified |
| KEY-02 | P1: Teclado | Tasks | Verified |
| KEY-03 | P1: Teclado | Tasks | Verified |
| KEY-04 | P1: Teclado | Tasks | Verified |
| KEY-05 | P1: Teclado | Tasks | Verified |
| KEY-06 | P1: Teclado | Tasks | Verified |
| KEY-07 | P1: Teclado | Tasks | Verified |
| DUEL-01 | P1: Duel | Tasks | Verified |
| DUEL-02 | P1: Duel | Tasks | Verified |
| DUEL-03 | P1: Duel | Tasks | Verified |
| DUEL-04 | P1: Duel | Tasks | Verified |
| DUEL-05 | P1: Duel | Tasks | Verified |
| DUEL-06 | P1: Duel | Tasks | Verified |
| DUEL-07 | P1: Duel | Tasks | Verified |
| DUEL-08 | P1: Duel | Tasks | Verified |
| DUEL-09 | P1: Duel | Tasks | Verified |
| CONN-01 | P1: Conexão | Tasks | Verified |
| CONN-02 | P1: Conexão | Tasks | Verified |
| CONN-03 | P1: Conexão | Tasks | Verified |
| CONN-04 | P1: Conexão | Tasks | Verified |
| CONN-05 | P1: Conexão | Tasks | Verified |
| RES-01 | P1: Resultado | Tasks | Verified |
| RES-02 | P1: Resultado | Tasks | Verified |
| RES-03 | P1: Resultado | Tasks | Verified |
| RES-04 | P1: Resultado | Tasks | Verified |
| RES-05 | P1: Resultado | Tasks | Verified |
| RES-06 | P1: Resultado | Tasks | Verified |
| HOME-01 | P2: Home | Tasks | Verified |
| HOME-02 | P2: Home | Tasks | Verified |
| HOME-03 | P2: Home | Tasks | Verified |
| HOME-04 | P2: Home | Tasks | Verified |
| HOME-05 | P2: Home | Tasks | Verified |
| STATE-01 | P2: Estados | Tasks | Verified |
| STATE-02 | P2: Estados | Tasks | Verified |
| STATE-03 | P2: Estados | Tasks | Verified |
| STATE-04 | P2: Estados | Tasks | Verified |
| STATE-05 | P2: Estados | Tasks | Verified |

**Coverage:** 59 total, 59 mapped to tasks, 0 unmapped.

---

## Success Criteria

- [ ] Contraste ≥ 4,5:1 em todo texto normal (tabela de `visual-direction.md`).
- [ ] Solo e Duel completos, do início ao "jogar de novo", sem mouse.
- [ ] `npm run lint` e `npm run build` com código 0.
- [ ] `git diff` da feature sem mudanças em `src/hooks/useTyping.ts`, `src/hooks/useTimer.ts`, `src/hooks/useSocket.ts`, `src/store/playerStore.ts`, `src/lib/socket.ts`.
