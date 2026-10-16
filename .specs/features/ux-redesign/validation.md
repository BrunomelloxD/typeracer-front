# Redesign UX/UI — Graphite & Brass — Validation

## Validation: ux-redesign - PASS

**Date**: 2026-10-16
**Spec**: `.specs/features/ux-redesign/spec.md`
**Diff range**: `071a262..HEAD` (branch `feat/ux-redesign`, 25 commits, `4fd026c` … `f720ed1`)
**Verifier**: independent sub-agent (author ≠ verifier)

> Testing regime: AD-002. The project has no test framework, so evidence is `file:line` plus the code that implements the exact value or condition from the spec. The gate is `npm run lint && npm run build`. Without a test suite, the discrimination sensor cannot run. An adversarial read stands in for it (see the Sensor section).

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 eslint override (AD-001) | ✅ Done | `eslint.config.js` +9 lines, only `src/hooks/**/*.{ts,tsx}` |
| T2 specs committed | ✅ Done | `19b169c` |
| T3 tokens / global CSS | ✅ Done | `src/index.css` |
| T4 HTML base | ✅ Done | `index.html` |
| T5 `ui.ts` | ✅ Done | `src/lib/ui.ts:4` `min-h-11` + `active:scale-[0.98]` |
| T6 Kbd | ✅ Done | `src/components/Kbd.tsx` |
| T7 TypingArea | ✅ Done | shake and `setState`-in-effect removed |
| T8 RaceStats | ✅ Done | no `aria-live` in the file |
| T9 RaceTrack | ✅ Done | only `transform` animates |
| T10 Countdown | ✅ Done | `role="status"` + `aria-live="polite"` |
| T11 CopyButton | ✅ Done | — |
| T12 useConnectionStatus | ✅ Done | `setState` only inside event callbacks |
| T13 ConnectionBadge | ✅ Done | — |
| T14 useRaceFocusMode | ✅ Done | — |
| T15 Header | ✅ Done | — |
| T16 HomePage | ✅ Done | see the P2 finding on "Começar solo" + `redirectTo` |
| T17 SoloResult | ✅ Done | — |
| T18 SoloHistory | ✅ Done | — |
| T19 SoloPage | ✅ Done | payload and single send confirmed below |
| T20 DuelResult | ✅ Done | — |
| T21 DuelPage | ✅ Done | socket contract identical (DUEL-09) |
| T22 ProgressBar | ✅ Done | — |
| T23 NotFoundPage | ✅ Done | — |
| T24 StatPill removed | ✅ Done | `grep -r StatPill src` is empty |
| T25 App shell tokens | ✅ Done | — |

All 51 "Done when" checkboxes in `tasks.md` are `[x]`. None are open.

---

## Invariants

| Invariant | Command / evidence | Result |
| --- | --- | --- |
| Game hooks, store, socket, api and types untouched | `git diff 071a262..HEAD --stat -- src/hooks/useTyping.ts src/hooks/useTimer.ts src/hooks/useSocket.ts src/store/playerStore.ts src/lib/socket.ts src/lib/api.ts src/types/api.ts` → empty output | ✅ |
| No new dependencies | `git diff 071a262..HEAD --stat -- package.json package-lock.json` → empty output | ✅ |
| No `window.confirm` / `window.alert` | `grep -rnE "window\.(confirm\|alert)" src` → only 2 **comments** (`src/components/SoloHistory.tsx:22`, `src/pages/SoloPage.tsx:88`); no calls | ✅ |
| No default Tailwind palette | `grep -rnE "zinc-\|emerald-\|sky-\|amber-\|rose-" src` → empty output | ✅ |
| DUEL-09: socket contract | The same 9 `socket.on` and 9 `socket.off` calls (`player_joined`, `room_ready`, `countdown`, `start_game`, `progress_update`, `opponent_finished`, `final_results`, `player_left`, `exception`) appear at `src/pages/DuelPage.tsx:164-183` vs. original `:125-144`. The 4 emits are unchanged: `progress_update {code, progress, correctChars, totalKeystrokes}` (`:197-202`), `finish_game {code, wpm, accuracy, durationMs}` (`:217-222`), `join_room {code: room.code, playerName}` (`:241`), `join_room {code: inputCode, playerName}` (`:255`). The bodies of the progress and finish effects and of `handleCreate` and `handleJoin` match the original. The only handler changes are local UI state (`setOpponentLeft`, `:155`, `:161`). | ✅ |
| Solo score payload identical | `pushHistory({wpm, accuracy, durationMs, textId, createdAt})` and `api.submitScore({mode:'SOLO', playerName, wpm, accuracy, durationMs, textId})` at `src/pages/SoloPage.tsx:116-138`. `durationMs = timer.elapsedMs \|\| DURATION_MS` and `accuracy = Number(typing.accuracy.toFixed(2))` match the original (`git show 071a262:src/pages/SoloPage.tsx:82-99`). | ✅ |
| Solo score sent once per race | Guard `if (!finished \|\| recordedRef.current \|\| !text) return; recordedRef.current = true;` at `src/pages/SoloPage.tsx:113-114`. `recordedRef` returns to `false` only in `loadText` (`:94`) and `replay` (`:102`). Both reset `typing` and `timer` in the same batch, so `finished` (`:108-109`) is `false` on the next render. Paths checked: **replay** after the end → `finished=false` because `typed=''` and `elapsedMs=0`, so nothing is sent. **Esc / "Novo texto" / "Tentar novamente"** → `loading=true` keeps `finished` false (`!loading`); the abandoned race is not sent, as in the original. **Difficulty change** → the radiogroup only renders while `!finished` (`:188`). During a race the abandoned race is discarded, as in the original, which also discarded it after `confirm`. **StrictMode** → the effect fires on update, not on mount, so there is no double run. The effect's deps change on every render (`timer`, `typing`), but the ref blocks a second send. | ✅ |

---

## Spec-Anchored Acceptance Criteria

### P1: Fundação visual e acessível

| Criterion | Spec-defined outcome | `file:line` + evidence | Result |
| --- | --- | --- | --- |
| GLOB-01 | `@theme` with the 12 hex values | `src/index.css:4-17`: `--color-bg:#0E0F12`, `surface:#16181D`, `surface-2:#1D2027`, `core:#121419`, `line:#2A2D35`, `ink:#E8E6E1`, `muted:#8A8F98`, `untyped:#80858F`, `accent:#E2B75A`, `rival:#7FA7C9`, `error:#F0716B`, `ok:#7BC89A`. Fonts at `:19-20`, easing at `:22`. All 12 match. | ✅ PASS |
| GLOB-02 | No Vite template rules | `src/index.css:1-107`: no `#root` width/text-align/border, no global `h1`/`h2`, no light `:root`. The only `#root` rule is `min-height:100%` (`:29-33`). | ✅ PASS |
| GLOB-03 | `lang="pt-BR"` + meta description | `index.html:2` `<html lang="pt-BR">`; `index.html:7` `<meta name="description" …>` | ✅ PASS |
| GLOB-04 | Geist for UI, JetBrains Mono for typing and numbers, with fallbacks | `src/index.css:19` `"Geist", ui-sans-serif, system-ui`; `:20` `"JetBrains Mono", ui-monospace…`; `body{font-family:var(--font-sans)}` `:39`; typing in `font-mono` `src/components/TypingArea.tsx:124`; numbers in `font-mono` `src/components/RaceStats.tsx:16`, `src/components/SoloResult.tsx:76,93`; fonts loaded at `index.html:11` | ✅ PASS |
| GLOB-05 | 2px `accent` outline, 2px offset, `:focus-visible`, every focusable element | `src/index.css:45-48` `:where(button,a,input,textarea,select,[role=button],[role=radio],[tabindex]):focus-visible{outline:2px solid var(--color-accent);outline-offset:2px}`. In the build CSS this rule is **unlayered**, so it beats the `outline-none` utility at `src/pages/HomePage.tsx:100` and `src/pages/DuelPage.tsx:390` (both inside `@layer utilities`). Exception: the typing `<textarea>` is `opacity-0` (`src/components/TypingArea.tsx:177`), so its outline matches but is invisible. Focus shows through the overlay disappearing and the caret appearing (`:106-107`). | ⚠️ Spec-precision gap |
| GLOB-06 | Reduced motion disables animations and transitions, including caret and countdown | `src/index.css:95-107`: `animation-duration:0.001ms !important; transition-duration:0.001ms !important` on `*`, plus `.caret-blink{animation:none !important}` (`:104-106`). This covers `.countdown-pop` (`:90-92`), the caret transition (`TypingArea.tsx:159`) and `animate-pulse`. | ✅ PASS |
| GLOB-07 | Every interactive control ≥ 44×44 px | Every button uses `btnBase` with `min-h-11` (`src/lib/ui.ts:4`), including `btnCompact`/`btnGhostSmall` (`SoloPage.tsx:28`, `SoloHistory.tsx:8`), which keep `min-h-11`. Difficulty radios: `min-h-11` (`SoloPage.tsx:209`). Header links: `min-h-11` (`Header.tsx:14,28`). Inputs: `h-14` (`HomePage.tsx:100`, `DuelPage.tsx:390`). 404 link: `btnPrimary` (`NotFoundPage.tsx:13`). **Exception**: the skip link `src/App.tsx:13` uses `focus:py-2.5 focus:text-sm`, which gives 10+20+10 = **40px** of height. It only appears on keyboard focus (`sr-only` otherwise). | ⚠️ Spec-precision gap |

### P1: Digitação focada

| Criterion | Spec-defined outcome | `file:line` + evidence | Result |
| --- | --- | --- | --- |
| TYPE-01 | Correct → `ink`; untyped → `untyped`; wrong → `error` on `error`/15 | `src/components/TypingArea.tsx:129` `text-untyped`; `:136` `text-ink`; `:147` `bg-error/15 text-error` | ✅ PASS |
| TYPE-02 | Wrong space → visible 2px `error` underline | `TypingArea.tsx:142-151`: `wrongSpace ? 'shadow-[inset_0_-2px_0_var(--color-error)]'`, rendered as NBSP (U+00A0) so it keeps its width | ✅ PASS |
| TYPE-03 | Caret 2–3px, `accent`, before the next character | `TypingArea.tsx:159` `w-[2.5px] … bg-accent`; position from `[data-i=typed.length]` `offsetLeft/offsetTop` at `:49-57`, written via `transform` at `:66` | ✅ PASS |
| TYPE-04 | Solid within 500 ms of a key, blinks after | `TypingArea.tsx:14` `TYPING_IDLE_MS = 500`; `:100-102` `setIsTyping(true)` + `setTimeout(() => setIsTyping(false), 500)`; `:107` `!isTyping ? 'caret-blink' : ''` | ✅ PASS |
| TYPE-05 | Autofocus when mounted enabled | `TypingArea.tsx:38-40` `if (autoFocus && !disabled) inputRef.current?.focus()` (default `autoFocus = true`, `:25`) | ✅ PASS |
| TYPE-06 | Unfocused and enabled → dimmed text + exact message | `TypingArea.tsx:106` `showOverlay = !focused && !disabled`; `:119` `opacity-25 blur-[1px]`; `:165` "Clique ou pressione qualquer tecla para focar" (exact text) | ✅ PASS |
| TYPE-07 | Printable key with no Ctrl/Alt/Meta outside another text field → focus | `TypingArea.tsx:85-96`: listener only `if (!focused && !disabled)`; `e.key.length !== 1 \|\| e.ctrlKey \|\| e.metaKey \|\| e.altKey` → ignore; `isEditableTarget` (`:16-18`) skips input, textarea, select and contenteditable; Space on a button/radio/link is preserved (`:91`) | ✅ PASS |
| TYPE-08 | No shake and no border change on error | `grep -rn shake src` is empty; the container uses fixed `bezelOuter`/`bezelInner` classes (`TypingArea.tsx:110-112`) with no dependency on errors | ✅ PASS |
| TYPE-09 | 20px / 1.7 below 640px; 28px / 1.7 from 640px up | `TypingArea.tsx:124` `text-xl leading-[1.7] … sm:text-[28px]`. Build CSS: `.text-xl{font-size:var(--text-xl);line-height:var(--tw-leading,…)}`, `.leading-\[1\.7\]{--tw-leading:1.7;line-height:1.7}`, `.sm\:text-\[28px\]{font-size:28px}` (the unitless line-height stays 1.7) | ✅ PASS |

### P1: Métricas sem ruído

| Criterion | Spec-defined outcome | `file:line` + evidence | Result |
| --- | --- | --- | --- |
| MET-01 | Time in `accent`, larger than WPM and accuracy | `src/components/RaceStats.tsx:20-21` `text-4xl … sm:text-5xl … 'text-accent'` vs. WPM and accuracy at `:30,35` `text-2xl sm:text-[30px]` | ✅ PASS |
| MET-02 | ≤ 5 s → `error` | `RaceStats.tsx:9` `urgent = remainingSec <= 5`; `:21` `urgent ? 'text-error' : 'text-accent'` | ✅ PASS |
| MET-03 | Accuracy with 1 decimal, pt-BR (`97,3%`) | `RaceStats.tsx:10-13` `toLocaleString('pt-BR', {minimumFractionDigits:1, maximumFractionDigits:1})`; `:35` `{accuracyText}%` | ✅ PASS |
| MET-04 | No `aria-live` on time, WPM or accuracy | `RaceStats.tsx:1-42` has no `aria-live`. `grep -rn aria-live src` → only Countdown `:8`, ConnectionBadge `:28`, CopyButton `:67`, the Solo result live region (`SoloPage.tsx:182`, empty until the end) and the Duel live region (`DuelPage.tsx:303`, room events and result). None of them contains live metrics. | ✅ PASS |
| MET-05 | "Fácil", "Médio", "Difícil" | `src/pages/SoloPage.tsx:22-26` | ✅ PASS |
| MET-06 | Header + selector + "Novo texto" at 35% during the race; 100% on hover/focus | `src/index.css:59-66` `body[data-race="running"] .race-dim{opacity:.35}` and `:hover,:focus-within{opacity:1}`; `.race-dim` on the header (`Header.tsx:24`) and on the group with selector + "Novo texto" (`SoloPage.tsx:191`); activated by `useRaceFocusMode(timer.running && !finished)` (`SoloPage.tsx:162`), `useRaceFocusMode(phase === 'running')` (`DuelPage.tsx:295`), hook at `src/hooks/useRaceFocusMode.ts:5-12` | ✅ PASS |

### P1: Teclado de ponta a ponta

| Criterion | Spec-defined outcome | `file:line` + evidence | Result |
| --- | --- | --- | --- |
| KEY-01 | Tab from the typing area → "Reiniciar"; Enter → same text, time and input reset | DOM order: `<textarea>` is the last focusable inside TypingArea (`TypingArea.tsx:169`). Next comes `ProgressBar` (not focusable, `SoloPage.tsx:286`), then `<button>Reiniciar` (`SoloPage.tsx:289-291`). `replay` (`:99-105`) calls `typing.reset()`, `timer.reset()` and `setRound(r+1)` with no fetch (same `text`), and the new `key={round}` (`:279`) remounts and autofocuses. | ✅ PASS |
| KEY-02 | Esc → new text, current difficulty | `SoloPage.tsx:151-159` global listener: `e.key === 'Escape'` → `loadTextRef.current(difficulty)` → `fetchText(d)` (`:89-96`) | ✅ PASS |
| KEY-03 | Solo finishes → focus on "Jogar novamente" | `SoloPage.tsx:142-144` `if (finished) primaryRef.current?.focus()`; `ref={primaryRef}` on "Jogar novamente" `src/components/SoloResult.tsx:133-138` | ✅ PASS |
| KEY-04 | Duel results → focus on "Nova partida" | `src/pages/DuelPage.tsx:266-268` `if (phase === 'finished' && ranking) primaryRef.current?.focus()`; `ref` on "Nova partida" `src/components/DuelResult.tsx:117-122` | ✅ PASS |
| KEY-05 | Esc while waiting → cancel the room and return to the lobby | `DuelPage.tsx:271-292`: `phase === 'waiting'` → `resetToLobby()` (same action as the original "Cancelar" button, with no new emit; DUEL-09) | ✅ PASS |
| KEY-06 | Enter in the name field with a name → `/solo` or `state.redirectTo` | `src/pages/HomePage.tsx:77-80` `onSubmit → goTo(redirectTo ?? '/solo')`; `goTo` blocks an empty name (`:29-30`); implicit submission through the submit button associated with `form={FORM_ID}` (`:120-121`) | ✅ PASS |
| KEY-07 | Kbd for KEY-01, KEY-02 and KEY-06 next to their controls | KEY-01: `<Kbd>Tab</Kbd> + <Kbd>Enter</Kbd> reinicia` next to "Reiniciar" (`SoloPage.tsx:289-294`). KEY-02: `<Kbd>Esc</Kbd>` inside "Novo texto" (`SoloPage.tsx:220-223`) and in the hint at `:293`. KEY-06: `<Kbd onAccent>↵ Enter</Kbd>` on "Começar solo" (`HomePage.tsx:126`). | ✅ PASS |

### P1: Duel com pista e convite

| Criterion | Spec-defined outcome | `file:line` + evidence | Result |
| --- | --- | --- | --- |
| DUEL-01 | Text rendered once (running and countdown) | Countdown: one `<TypingArea … disabled>` (`DuelPage.tsx:543`). Running: one `<TypingArea>` (`:608-613`). There is no other `{text}` render. | ✅ PASS |
| DUEL-02 | Track: player lane (`accent`, "você") + opponent lane (`rival`), each with `role="progressbar"` and % | `DuelPage.tsx:569-579` lanes `{name: playerName, tag: 'você', tone: 'accent'}` and `{tone: 'rival'}`; `src/components/RaceTrack.tsx:60-64` `role="progressbar" aria-valuemin/max/now`; `:88-89` `{rounded}%` | ✅ PASS |
| DUEL-03 | 6 digit boxes, "Copiar link", "Copiar código", list with "1/2"/"2/2" | `DuelPage.tsx:438-446` one box per digit; `:453-459` `label="Copiar link"`; `:463` `<CopyButton value={code} />` (default label "Copiar código", `CopyButton.tsx:20`); `:470` `{opponent ? '2/2' : '1/2'}` | ✅ PASS |
| DUEL-04 | Clipboard gets `${location.origin}/duel?code=<code>`; "Link copiado" for 1.8 s | `DuelPage.tsx:409` ``inviteUrl = `${window.location.origin}/duel?code=${code}` ``; `:457` `copiedLabel="Link copiado"`; `CopyButton.tsx:14` `RESET_MS = 1800`, `:29-33` `setTimeout(() => setState('idle'), RESET_MS)` | ✅ PASS |
| DUEL-05 | `?code=` with exactly 6 digits → prefill + focus "Entrar na sala" | `DuelPage.tsx:55-56` `/^\d{6}$/.test(queryCode)`; `:60` `useState(() => initialCode)`; `:259-263` focuses `joinRef` once, only when `status === 'connected'` (the button is disabled before that, `:395`) | ✅ PASS |
| DUEL-06 | Code ≠ 6 digits → ignore, empty field | `DuelPage.tsx:56` `: ''` | ✅ PASS |
| DUEL-07 | Countdown: text, caret on the 1st character, input disabled | `DuelPage.tsx:543` `<TypingArea target={text} typed="" … disabled />`; caret at `data-i=0` (`TypingArea.tsx:49-57`), solid while disabled (`:107`); `<textarea disabled>` (`:176`) | ✅ PASS |
| DUEL-08 | "<nome> saiu da sala." + "Voltar ao lobby" | `DuelPage.tsx:153-155` `` setError(`${who} saiu da sala.`) ``; `:317-320` `{opponentLeft && <button …>Voltar ao lobby</button>}`. `errorBox` is rendered in every phase (`:335, :421, :536, :553, :605`). | ✅ PASS |
| DUEL-09 | Same emits, listeners and payloads | See Invariants (`DuelPage.tsx:164-183, 197-202, 217-222, 241, 255`) | ✅ PASS |

### P1: Conexão visível

| Criterion | Spec-defined outcome | `file:line` + evidence | Result |
| --- | --- | --- | --- |
| CONN-01 | 4 states: "Conectado" `ok`, "Conectando…" `muted`, "Reconectando…" `accent`, "Sem conexão" `error` | `src/components/ConnectionBadge.tsx:7-20`: `connected:{label:'Conectado', tone:'text-ok…'}`, `connecting:{'Conectando…','text-muted…'}`, `reconnecting:{'Reconectando…','text-accent…'}`, `offline:{'Sem conexão','text-error…'}` | ✅ PASS |
| CONN-02 | Disconnect after a connection → "Reconectando…" | `src/hooks/useConnectionStatus.ts:16-20` `onConnect` sets `everConnected`, `onDisconnect` → `connected=false`; `:42` `if (everConnected) return 'reconnecting'` | ✅ PASS |
| CONN-03 | `offline` → "Sem conexão"; `online` → follows the socket | `useConnectionStatus.ts:22-23,28-29` window listeners; `:40` `if (!online) return 'offline'`, then `:41-43` derive from `connected`/`everConnected` | ✅ PASS |
| CONN-04 | Race running and not connected → banner with the status text | `DuelPage.tsx:587-599` `status !== 'connected'` → `role="status"` + `STATUS_TEXT[status]` (`:32-36`: "Conectando…", "Reconectando…", "Sem conexão") | ✅ PASS |
| CONN-05 | Lobby not connected → buttons disabled + text linked via `aria-describedby` | `DuelPage.tsx:337-341` `<p id="duel-conn-hint">Aguardando conexão com o servidor…</p>`; `:354-355` and `:395-396` `disabled={!connected…}` + `aria-describedby={connHint}` (`:326`) | ✅ PASS |

### P1: Resultado em primeiro plano

| Criterion | Spec-defined outcome | `file:line` + evidence | Result |
| --- | --- | --- | --- |
| RES-01 | Card replaces the typing area: WPM, accuracy (1 decimal), duration in s (1 decimal), correct characters, errors | `SoloPage.tsx:253-265` `finished ? <SoloResult…/> : …` (TypingArea not rendered); `SoloResult.tsx:76-78` WPM; `:59-64` `Precisão ${oneDecimal(accuracy)}%`, `Tempo ${oneDecimal(durationMs/1000)} s`, `Caracteres`, `Erros`; `oneDecimal` pt-BR 1 decimal at `:19-21` | ✅ PASS |
| RES-02 | ≥1 earlier race → "+6 vs. sua média (78)" and "Recorde" | `SoloResult.tsx:37` `earlier = history.slice(1)`; `:42-52` `` `${diff >= 0 ? '+' : ''}${diff} vs. sua média (${avg})` `` and `record = Math.max(...earlier.map(h => h.wpm))`; `:121-124` `Recorde: {record} wpm`. Exact format. (Transient risk noted in the Sensor section, finding A4.) | ✅ PASS |
| RES-03 | ≥2 races → bars for the last ≤10, current race in `accent` | `SoloResult.tsx:56` `history.length >= 2 ? history.slice(0, 10).reverse() : []`; `:113` `i === bars.length - 1 ? 'bg-accent' : 'bg-line'` | ✅ PASS |
| RES-04 | Ranking: position, name, WPM, accuracy, time; "você" | `DuelPage.tsx:549-563` replaces the race area; `DuelResult.tsx:68` `#{r.position}`, `:81` name, `:84` `você`, `:88` `${oneDecimal(r.accuracy)}% precisão · ${oneDecimal(r.durationMs/1000)} s`, `:104` WPM | ✅ PASS |
| RES-05 | "Você venceu" / "Você ficou em <n>º" + WPM gap with 2 players | `DuelResult.tsx:23-27` `mine.position === 1 ? 'Você venceu' : \`Você ficou em ${mine.position}º\``; `:30` `gap` only if `ranking.length === 2`; `:47-49` `por {gap} wpm de diferença` | ✅ PASS |
| RES-06 | Polite live region announces WPM and accuracy once | Solo: `SoloPage.tsx:182-186` `role="status" aria-live="polite"`, empty until `finished`, then a fixed string (typing and timer frozen). Duel: `DuelPage.tsx:301-307` `myResult ? 'Resultado: … precisão …%' : announce`. The node stays in the same tree position between running and finished, so React reuses it and the change is announced once. | ✅ PASS |

### P2: Home clara

| Criterion | Spec-defined outcome | `file:line` + evidence | Result |
| --- | --- | --- | --- |
| HOME-01 | Solo and Duelo cards with a description + chips | `HomePage.tsx:112-118` Solo: "1 jogador", "60 s", "3 níveis" + one line; `:133-141` Duelo: "2 jogadores", "tempo real", "link ou código" + one line | ✅ PASS |
| HOME-02 | Empty name → mode buttons disabled | `HomePage.tsx:27` `canSubmit = trimmed.length > 0`; `:122` and `:145` `disabled={!canSubmit}` | ✅ PASS |
| HOME-03 | `redirectTo` → "Digite seu nome para continuar." above the field | `HomePage.tsx:82-86`, before the `<label>`/`<input>` at `:87-101` | ✅ PASS |
| HOME-04 | History → best, average, count, average accuracy | `HomePage.tsx:35-49` "Melhor", "Média", "Partidas", "Precisão média"; rendered at `:154-169` | ✅ PASS |
| HOME-05 | No name on `/solo` or `/duel` → `/` with `redirectTo = path + query` | `SoloPage.tsx:55-62` and `DuelPage.tsx:77-84`: `navigate('/', {replace:true, state:{redirectTo: location.pathname + location.search}})` | ✅ PASS |

### P2: Estados

| Criterion | Spec-defined outcome | `file:line` + evidence | Result |
| --- | --- | --- | --- |
| STATE-01 | Empty history → "Nenhuma partida ainda" + one line | `src/components/SoloHistory.tsx:53-58` | ✅ PASS |
| STATE-02 | 3-line skeleton in `role="status"` + sr-only "Carregando texto…" | `SoloPage.tsx:267-274`: `role="status"`, 3 `animate-pulse` divs, `<span className="sr-only">Carregando texto…</span>` | ✅ PASS |
| STATE-03 | "Não foi possível carregar o texto." + detail + "Tentar novamente" | `SoloPage.tsx:235-239` title + `error.message`; `:241-249` "Tentar novamente" → `loadText(difficulty)` | ✅ PASS |
| STATE-04 | No `window.confirm` / `alert` | grep only matches comments (see Invariants); two-step clear at `SoloHistory.tsx:22-32` (expires after 4 s, `:6`) | ✅ PASS |
| STATE-05 | "404", "Página não encontrada", "Voltar ao início" link | `src/pages/NotFoundPage.tsx:7` `404`; `:8` `<h1>Página não encontrada`; `:13-15` `<Link to="/" className={btnPrimary}>Voltar ao início` | ✅ PASS |

**Status**: ⚠️ 57/59 ✅ PASS, 2 ⚠️ spec-precision gaps (GLOB-05 invisible proxy textarea; GLOB-07 keyboard-only skip link at 40px), 0 ❌ GAP.

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| — | — | N/A: no suite (AD-002); 0 mutations run | — |

**Sensor depth**: N/A. Fault injection cannot run because no test can kill a mutant. The gate (lint + build) only catches type and lint errors, not behavior.
**Result**: N/A — no suite (AD-002); 0 mutations run.

### Adversarial review by reading (substitute for the sensor)

| # | Plausible failure | Prevented? | Evidence |
| --- | --- | --- | --- |
| A1 | Caret out of place after a line wrap | ✅ Prevented | Position comes from the real `offsetLeft/offsetTop` of the next span (`TypingArea.tsx:53-57`); the `offsetParent` is the `relative` div (`:118`); recalculated on `typed`/`target`, `resize` and `document.fonts.ready` (`:70-80`) |
| A2 | Focus lost after "Reiniciar"/"Jogar novamente"/Esc | ✅ Prevented | `key={round}` remounts TypingArea (`SoloPage.tsx:279`) → autofocus (`TypingArea.tsx:38-40`); after Esc the area unmounts during loading and remounts with autofocus |
| A3 | End-of-race effect running twice (double score) | ✅ Prevented | `recordedRef` (`SoloPage.tsx:113-114`); Duel uses `finishedRef` (`DuelPage.tsx:212-215`, unchanged) |
| A4 | RES-02 computed before `pushEntry`: `history[0]` is still the previous race on the first render after the end | ⚠️ Transient | `SoloResult.tsx:35-37` assumes the current race is already in the store, but `pushHistory` runs in an effect after the render (`SoloPage.tsx:119`). On a timeout end (interval, not a discrete event), one frame can show the average and record without the latest race. It corrects itself on the next render. P2 cosmetic. |
| A5 | Live region announcing on every key | ✅ Prevented | RaceStats has no live region; the Solo live region stays empty until the end (`SoloPage.tsx:183-185`) |
| A6 | `?code=` lost on the redirect without a name | ✅ Prevented | `redirectTo: location.pathname + location.search` (`DuelPage.tsx:81`) → `goTo(redirectTo)` (`HomePage.tsx:79`) → `initialCode` (`DuelPage.tsx:56`) |
| A7 | Focus on a disabled "Entrar na sala" | ✅ Prevented | Effect waits for `status === 'connected'` and fires once (`DuelPage.tsx:260`) |
| A8 | Esc fires while typing in another input | ✅ Not applicable / safe | Solo has no other text fields. In Duel, Esc only acts in `waiting`/`finished` (`DuelPage.tsx:274-282`); in the lobby (`room-code`) it does nothing |
| A9 | Any key steals focus from another field | ✅ Prevented | `isEditableTarget` + modifiers (`TypingArea.tsx:88-90`); listener only while unfocused (`:86`) |
| A10 | "Começar solo" sends the user to the Duel when the Home was reached with `redirectTo=/duel?code=…` | ❌ Real defect (P2, outside any AC) | "Começar solo" is `type="submit"` on the shared form (`HomePage.tsx:119-127`), and `onSubmit` does `goTo(redirectTo ?? '/solo')` (`:77-80`). Clicking the Solo card goes to `/duel?code=…`. Meanwhile "Ir para o duelo" (`:144`) goes to `/duel` without the code. KEY-06 (Enter) is still met. |
| A11 | Layout jump when a space is mistyped | ⚠️ Risk | A wrong space is rendered as NBSP (`TypingArea.tsx:151`, bytes `C2 A0`), which removes the line-break opportunity. If the error lands on the space where the line wraps, the line reflows mid-typing. |
| A12 | Old text stays visible after a "Novo texto" load fails | ⚠️ Minor | `fetchText` keeps the previous `text` on error (`SoloPage.tsx:71-77`), so the error card (`:228-251`) shows above the old text with the input reset |

---

## Code Quality

| Principle | Status |
| --- | --- |
| Minimum code | ✅ Shared class strings in `ui.ts`; no abstractions beyond the design |
| Surgical changes | ✅ Every touched file in `src/`, `index.html` and `eslint.config.js` maps to T1–T25; invariant files untouched |
| No scope creep | ⚠️ Small additions outside the spec but present in the FigCraft designs: Esc on the Duel result → `/` (`DuelPage.tsx:278-281`), "Voltar ao início" in SoloResult (`SoloResult.tsx:149-151`), `code` in DuelResult. No new logic. |
| Matches patterns | ✅ Inline Tailwind classes + tokens (AD-003); page-owned state preserved |
| Spec-anchored outcome check (code values match the spec) | ✅ Texts, hex values, 500 ms, 1800 ms, 4 s, 6-digit regex and pt-BR format all checked literally |
| Per-layer Coverage Expectation met | ✅ Matrix: every layer `none (AD-002)`, gate only |
| Every test maps to a spec requirement | N/A: no tests (AD-002) |
| Documented guidelines followed | none (strong defaults applied); AD-001/002/003 followed |
| Lint hygiene | ⚠️ 1 warning (not an error): `src/hooks/useTyping.ts:52` "Unused eslint-disable directive (react-hooks/exhaustive-deps)". The file is frozen by invariant, so the warning cannot be removed within scope. Exit 0. |

---

## Edge Cases

- [x] Clipboard rejects → "Não foi possível copiar" for 1.8 s: `CopyButton.tsx:15` `FAILED_LABEL`, `:39-41` `catch { show('failed') }` (also covers `navigator.clipboard` undefined, since the TypeError is caught inside the async function), `:14,29-33` 1800 ms
- [x] Short text keeps padding and caret: padding is fixed at `p-5 sm:p-10` (`TypingArea.tsx:112`); caret positioning has no dependency on length (`:49-65`)
- [x] Alone in the ranking → no gap: `DuelResult.tsx:30` `ranking.length === 2`
- [x] WPM tie → follows `position`: `DuelResult.tsx:25` uses `mine.position === 1`, with no WPM comparison
- [x] `navigator.onLine` false at mount → "Sem conexão": `useConnectionStatus.ts:11` `useState(() => navigator.onLine)`, `:40`

---

## Gate Check

- **Gate command**: `npm run lint && npm run build` (tasks.md "build" level)
- **Result**: exit **0**. `eslint .` → 0 errors, 1 warning (`src/hooks/useTyping.ts:52`, unused directive in a frozen file). `tsc -b && vite build` → 83 modules, `dist/assets/index-*.css 35.77 kB`, `index-*.js 323.93 kB`, built in 358 ms.
- **Test count before feature**: 0 (AD-002)
- **Test count after feature**: 0
- **Delta**: +0
- **Skipped tests**: none
- **Failures**: none

---

## Fix Plans (non-blocking)

### Fix 1: "Começar solo" follows `redirectTo` (A10)
- **Root cause**: the Solo button is the form's `submit`, and `onSubmit` uses `redirectTo ?? '/solo'`.
- **Fix task**: in `src/pages/HomePage.tsx`, make the "Começar solo" button call `goTo('/solo')` (keep `type="submit"` only for implicit submission, or set `onClick={e => { e.preventDefault(); goTo('/solo'); }}`), and make "Ir para o duelo" use `redirectTo?.startsWith('/duel') ? redirectTo : '/duel'` to keep `?code=`.
- **Verify**: `/duel?code=123456` with no name → Home → click "Começar solo" → `/solo`; Enter → `/duel?code=123456`.
- **Priority**: Minor

### Fix 2: Skip link at 44px (GLOB-07 precision)
- **Fix task**: `src/App.tsx:13` change `focus:py-2.5` to `focus:py-3`, or add `focus:min-h-11 focus:inline-flex focus:items-center`.
- **Priority**: Cosmetic

### Fix 3: Wrong space without reflow (A11)
- **Fix task**: in `src/components/TypingArea.tsx:151`, render the wrong space as a normal space (`' '`) with `whitespace-pre-wrap` on the `<p>`, or as an inline-block with fixed width, so the line-break opportunity is kept.
- **Priority**: Minor

### Fix 4: RES-02 with no stale frame (A4)
- **Fix task**: pass the current race to `SoloResult` and compute `earlier` as the history excluding the entry whose `createdAt` matches the current race, or snapshot the history in the page before `pushHistory`.
- **Priority**: Cosmetic

---

## Requirement Traceability Update

The orchestrator applies these to `spec.md`. The Verifier does not edit the spec.

| Requirement | Previous Status | New Status |
| --- | --- | --- |
| GLOB-01, GLOB-02, GLOB-03, GLOB-04, GLOB-06 | Implementing | ✅ Verified |
| GLOB-05 | Implementing | ✅ Verified (⚠️ precision: invisible proxy textarea) |
| GLOB-07 | Implementing | ✅ Verified (⚠️ precision: skip link at 40px) |
| TYPE-01..TYPE-09 | Implementing | ✅ Verified |
| MET-01..MET-06 | Implementing | ✅ Verified |
| KEY-01..KEY-07 | Implementing | ✅ Verified |
| DUEL-01..DUEL-09 | Implementing | ✅ Verified |
| CONN-01..CONN-05 | Implementing | ✅ Verified |
| RES-01..RES-06 | Implementing | ✅ Verified |
| HOME-01..HOME-05 | Implementing | ✅ Verified |
| STATE-01..STATE-05 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ PASS (with gaps listed: 2 spec-precision gaps + 1 P2 defect outside any AC)

**Spec-anchored check**: 57/59 ACs match the spec outcome; 2 spec-precision gaps (GLOB-05, GLOB-07); 0 ❌ GAP
**Sensor**: N/A — no suite (AD-002); 0 mutations run; 12 adversarial hypotheses by reading (8 prevented, 1 real P2 defect, 3 risks/minor)
**Gate**: `npm run lint && npm run build` exit 0 (0 errors, 1 warning in a frozen file)

**What works**: Graphite & Brass tokens; the typing area (colors, wrong-space underline, sliding caret with 500 ms idle, focus overlay, focus on any key); silent metrics; keyboard flow end to end (Tab→Reiniciar, Esc, automatic focus on the results); Duel with one text, track, invite link, `?code=` survives the redirect; 4 connection states + banner; result cards; Home and empty/loading/error/404 states. The game hooks, store, socket, api and types are unchanged; the socket contract and the Solo score payload are identical, sent once.

**Issues found**:
1. P2: "Começar solo" navigates to `redirectTo` (can be `/duel?code=…`), `src/pages/HomePage.tsx:77-80,119-127` → Fix 1.
2. ⚠️ GLOB-07: skip link is 40px tall, `src/App.tsx:13` → Fix 2.
3. ⚠️ GLOB-05: the typing `<textarea>` is `opacity-0`, so its outline is invisible (focus shows through overlay and caret), `src/components/TypingArea.tsx:177`.
4. Risk: wrong space as NBSP can reflow the line, `src/components/TypingArea.tsx:151` → Fix 3.
5. Cosmetic: one stale frame in RES-02 on a timeout end, `src/components/SoloResult.tsx:35-37` → Fix 4.

**Next steps**: the orchestrator decides whether to apply Fixes 1–2 (cheap) before the merge; none of them blocks the verdict.

---

## Pós-validação: revisão web-design-guidelines (2026-10-16)

Revisão com as Web Interface Guidelines (Vercel). Os achados e as lacunas acima foram corrigidos em commits atômicos. Gate: `npm run lint && npm run build` → exit 0.

| Achado | Origem | Correção | Commit |
| --- | --- | --- | --- |
| Header sticky cobre o elemento focado | guidelines | `scroll-padding-top: 5rem` em `html` (`src/index.css`) | `7109dd8` |
| Sem `touch-action`/tap-highlight | guidelines | `touch-action: manipulation` e tap-highlight transparente nos controles (`src/index.css`) | `7109dd8` |
| Skip link com 40px (GLOB-07 ⚠️) | Verifier gap 2 | `focus:min-h-11` (`src/App.tsx:13`) | `2b99f21` |
| "Começar solo" ia para o Duel com `redirectTo`; "Ir para o duelo" perdia `?code=` | Verifier gap 1 | Cada botão leva ao próprio modo; o Duelo mantém `redirectTo`; Enter segue `redirectTo` e o `Kbd` aparece no botão certo (`src/pages/HomePage.tsx`) | `0b7c432` |
| Input do nome com `outline-none` sem anel, sem `name/autocomplete` | guidelines | `focus:ring-2 ring-accent/60`, `name`, `autoComplete="nickname"`, `spellCheck={false}`; `text-balance` no h1 | `0b7c432` |
| Solo sem h1; texto antigo visível após erro de carregamento | guidelines + Verifier gap 6 | `h1.sr-only` "Modo solo"; o palco some quando `error.kind === 'load'` (`src/pages/SoloPage.tsx`) | `9f2fdec` |
| Duel sem h1 em countdown/corrida/resultado; código sem `spellCheck` | guidelines | `h1.sr-only` por fase; `name`/`spellCheck={false}` (`src/pages/DuelPage.tsx`) | `a2e548c` |
| Foco invisível no textarea `opacity-0` (GLOB-05 ⚠️) | Verifier gap 3 | `focus-within:ring-accent/50` na moldura (`src/components/TypingArea.tsx`) | `c49509a` |
| Espaço errado como NBSP podia mudar a quebra de linha | Verifier gap 4 | Espaço normal + `whitespace-pre-wrap` | `c49509a` |
| Comparação/recorde errados por 1 frame no fim por tempo | Verifier gap 5 | `SoloResult` detecta se a partida já está no histórico | `9049732` |

Regra "Title Case" não se aplica: pt-BR usa caixa de frase. Lacunas restantes: nenhuma.
