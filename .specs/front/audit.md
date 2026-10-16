# Auditoria UX/UI — TypeRace (front)

Data: 2026-10-16 · Fonte: `graphify-out/` (184 nós, 13 comunidades) + leitura de `src/`.
Escopo: só apresentação. `useTyping`, `useTimer`, `useSocket`, `store/playerStore.ts` e `lib/socket.ts` não mudam de comportamento.

## 1. Mapa (graphify)

```
main.tsx → BrowserRouter → App()
  ├─ Header (Link "/" · nav Solo/Duelo · "jogando como <nome>")
  └─ <main id="main"> Routes
       /        HomePage      → usePlayerStore.setPlayerName → navigate(/solo | /duel)
       /solo    SoloPage      → useTyping · useTimer · api.getRandomText/submitScore · useHistoryStore
                 ├─ TypingArea · ProgressBar · StatPill×3
                 ├─ FinishedPanel (resultado)
                 └─ SoloHistory
       /duel    DuelPage      → useSocket · useTyping · useTimer · api.createRoom
                 phase: lobby → waiting → countdown → running → finished
                 ├─ ConnectionBadge · CopyButton · Countdown
                 ├─ TypingArea · ProgressBar(você/oponente) · StatPill×3
                 └─ FinalRanking (resultado)
       *        NotFoundPage
```
Hubs mais conectados: `DuelPage()` (16 arestas), `SoloPage()` (13), `usePlayerStore` (9).
Eventos de socket consumidos pelo Duel: `player_joined`, `room_ready`, `countdown`, `start_game`, `progress_update`, `opponent_finished`, `final_results`, `player_left`, `exception`.

Estilo atual: Tailwind 4 (`@import "tailwindcss"`), paleta zinc + emerald + sky + amber + rose, fontes de sistema, `.font-mono-typing`, `.typing-cursor` (bloco piscante), `.animate-shake`, foco global `#34d399`, bloco `prefers-reduced-motion`.

## 2. Problemas por tela e estado

### Global / CSS
| # | Problema | Evidência |
|---|---|---|
| G1 | **Sobra do template Vite no `index.css`**: `#root { width:1126px; text-align:center; border-inline… }`, `h1 {font-size:56px; margin:32px 0}`, `h2 {font-weight:500; color:var(--text-h)}` e um `:root` claro (`--bg:#fff`). Esse CSS fica fora de `@layer`, então **ganha dos utilitários do Tailwind 4**: o `text-4xl` do H1 da Home e o `text-2xl font-semibold` do 404 são ignorados, tudo herda texto centralizado e aparecem bordas laterais. | `src/index.css:162-273` |
| G2 | Dois `:root` com `color-scheme` conflitantes (`dark` e `light dark`). | `index.css:105`, `:181` |
| G3 | `<html lang="en">` num app 100% pt-BR (leitores de tela pronunciam errado). Sem `meta description`. | `index.html` |
| G4 | Fontes de sistema na UI e no texto de digitação: a métrica da fonte mono muda por sistema operacional, então a largura das linhas e a quebra mudam entre usuários. | `index.css:107,121` |
| G5 | Emerald faz papel demais: marca, caractere correto, botão primário, sucesso, foco e "você". Sky é um segundo destaque (Duelo/oponente). Amber e rose completam 4 cores saturadas. | todas as páginas |
| G6 | Contraste: texto ainda não digitado `zinc-500` sobre o card = **3,8:1** (falha AA); rodapé "Sala:" `zinc-600` = **2,57:1**. | `TypingArea.tsx`, `DuelPage.tsx` |
| G7 | `ProgressBar` anima `width` com `transition-all` (dispara layout a cada tecla). | `ProgressBar.tsx` |

### Home
| # | Problema |
|---|---|
| H1 | Solo e Duelo aparecem como dois botões sem explicação do que cada modo faz (duração de 60 s, se precisa de outra pessoa, código da sala). |
| H2 | Os dois CTAs competem: um preenchido (emerald) e outro contornado (sky). Enter vai para o Solo, mas isso não aparece em lugar nenhum. |
| H3 | O H1 "TypeRace" fica com 56px e margens do template (G1), e o layout acaba centralizado sem querer. |
| H4 | Os links Solo/Duelo do Header levam a `/solo` sem nome: o redirecionamento para `/` é **silencioso** e não diz por que voltou. |

### Digitação (Solo e Duel)
| # | Problema |
|---|---|
| T1 | O caret é um **bloco que pisca sempre**, inclusive enquanto a pessoa digita (Monkeytype e keybr param de piscar ao digitar). Ele salta de caractere em caractere, sem deslizar. |
| T2 | Feedback por caractere: o acerto fica **verde** e o texto vira um "arco-íris" que distrai. O padrão em apps de digitação é digitado = cor do texto, não digitado = cor apagada, erro = vermelho. **Espaço errado é quase invisível**: só um sublinhado fino. |
| T3 | Cada erro faz o **container inteiro tremer** e pintar a borda de vermelho. Com muitos erros, isso vira ruído visual constante. |
| T4 | Quando a área perde o foco (clique fora, Tab), **nada avisa**. Teclas digitadas são perdidas e não há "clique ou pressione qualquer tecla para focar". |
| T5 | O Solo não diz "comece a digitar para iniciar o tempo": o timer parado em 60 parece travado. |
| T6 | Durante a partida, seletor de dificuldade, "Novo texto", Header e histórico continuam visíveis com o mesmo peso (distração). |
| T7 | O texto não tem largura máxima de leitura no Duel (fica em meia coluna). A entrelinha `leading-relaxed` está ok, mas as linhas ficam curtas demais no desktop. |

### Métricas
| # | Problema |
|---|---|
| M1 | Três `StatPill` do mesmo tamanho e peso. Tempo, WPM e precisão competem com o texto. |
| M2 | **`aria-live` no Tempo e no WPM**: o leitor de tela anuncia a cada segundo e a cada tecla. É um problema sério de acessibilidade. |
| M3 | A precisão é arredondada para 0 casas durante a partida e 1 casa no resultado (inconsistente). |
| M4 | Dificuldade aparece como `EASY/MEDIUM/HARD` (em inglês, caixa alta). |

### Countdown e início
| # | Problema |
|---|---|
| C1 | `animate-pulse` no número (opacidade oscilando) não comunica "contagem". Além disso, `role="timer"` + `aria-live="assertive"` interrompe o leitor de tela. |
| C2 | O texto aparece apagado durante o countdown (bom para pré-leitura), mas a área de digitação ainda não existe, então não dá para "posicionar os dedos" com o caret visível. |
| C3 | O Solo não tem countdown (começa na 1ª tecla). Isso está ok como padrão, mas precisa de dica (T5). |

### Duel
| # | Problema |
|---|---|
| D1 | **O texto aparece duas vezes** na partida: uma na sua coluna e outra, estática, na coluna do oponente. Isso divide a largura útil pela metade no desktop e dobra o scroll no mobile. |
| D2 | O progresso do oponente é uma barra dentro de um card separado. Não há uma "pista" comparativa (você × oponente no mesmo eixo), que é o centro da experiência de um TypeRacer. |
| D3 | **Convite só por código**. O `CopyButton` copia os 6 dígitos e não há link `/duel?code=123456` que já preencha o campo. |
| D4 | A espera pelo oponente não mostra nenhum sinal de vida (lista de jogadores, "1/2"). O título "Aguardando oponente..." fica em `text-zinc-400` e é a coisa mais fraca da tela. |
| D5 | Conexão: o badge só tem "Conectado" e "Conectando...", então queda e reconexão no meio da partida ficam iguais ao estado inicial. Durante a corrida, o badge vai para o rodapé com 2,57:1 de contraste. Botões desabilitados quando offline não explicam o motivo. |
| D6 | `player_left` mostra um erro vermelho, mas não oferece ação ("Voltar ao lobby"). |
| D7 | O CopyButton com `aria-live` no próprio botão anuncia o rótulo inteiro, e o "✓" é decorativo. |

### Resultado
| # | Problema |
|---|---|
| R1 | O resultado do **Solo** aparece *abaixo* do texto e o do **Duel** abaixo das duas colunas, ou seja, possivelmente fora da tela. Não há scroll nem foco. |
| R2 | **"Jogar novamente" não funciona pelo teclado sem Tab-caçada**: não há atalho (Tab+Enter / Esc) nem foco automático no botão. |
| R3 | O Solo não compara com a média/melhor marca do histórico (o dado existe em `useHistoryStore`). O tempo da partida não é mostrado. |
| R4 | O tom da cópia está alto ("Desafio finalizado!"). |

### Estados vazios, loading, erro, 404
| # | Problema |
|---|---|
| E1 | Histórico vazio = nada é renderizado, e não há convite para a 1ª partida. |
| E2 | Skeleton de loading ok, mas tem `aria-label` sem `role` (o aria-label é ignorado em `div`). |
| E3 | Os erros mostram a mensagem crua da API. `window.confirm` aparece ao trocar texto e limpar histórico (modal nativo, que quebra o fluxo de teclado no mobile). |
| E4 | 404 bom em conteúdo, mas sofre com G1 (h1 sobrescrito). |

## 3. Lista priorizada (impacto × esforço)

| Prio | Item | Impacto | Esforço | Resolve |
|---|---|---|---|---|
| P0 | Limpar CSS do template + tokens de tema (`@theme`) + `lang="pt-BR"` | Alto | P | G1 G2 G3 E4 H3 |
| P0 | Tirar `aria-live` de Tempo/WPM; live region só para início, fim e eventos | Alto | P | M2 C1 |
| P0 | TypingArea: cores digitado/apagado/erro, erro de espaço visível, sem shake, caret fino que para de piscar ao digitar, overlay "fora de foco" | Alto | M | T1 T2 T3 T4 G6 |
| P0 | Atalhos de teclado: Tab+Enter/Esc reinicia o Solo, foco automático no "Jogar novamente", Enter na Home | Alto | P | R2 |
| P1 | Duel: pista única com faixas você × oponente + **um** texto em largura total | Alto | M | D1 D2 T7 |
| P1 | Resultado como "cartão de corrida" no topo do fluxo (foco + scroll), com comparação com melhor/média | Alto | M | R1 R3 R4 |
| P1 | Convite por link `/duel?code=` + copiar link/código | Médio | P | D3 D7 |
| P1 | Estados de conexão: conectado / conectando / reconectando (banner na partida) + motivo nos botões desabilitados | Médio | P | D5 D6 |
| P1 | Home: cartões de modo com descrição + nome; aviso ao chegar sem nome | Médio | P | H1 H2 H4 |
| P2 | Modo foco: esconder controles secundários enquanto a partida corre | Médio | P | T6 M1 |
| P2 | Hierarquia de métricas (WPM em destaque, tempo e precisão secundários), precisão com 1 casa | Médio | P | M1 M3 M4 |
| P2 | Countdown: escala/opacidade + caret já posicionado no texto | Médio | P | C1 C2 |
| P2 | Espera do Duel com presença ("1/2 jogadores") e animação sutil | Baixo | P | D4 |
| P2 | Empty state do histórico; skeleton com `role="status"`; remover `window.confirm` (confirmação inline) | Baixo | P | E1 E2 E3 |
| P3 | ProgressBar via `transform: scaleX` | Baixo | P | G7 |
| P3 | Fontes definidas (UI + mono de digitação) | Médio | P | G4 |

Legenda de esforço: P ≤ 1h, M 1–3h.
