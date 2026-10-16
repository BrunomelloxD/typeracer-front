# STATE

## Decisions

### AD-001
- **Decision**: As regras `react-hooks/refs`, `react-hooks/purity` e `react-hooks/set-state-in-effect` ficam desligadas só para `src/hooks/**` em `eslint.config.js`.
- **Reason**: Os hooks de jogo violam essas regras desde antes da feature e não podem mudar de comportamento; o resto do app segue com as regras ligadas.
- **Trade-off**: Os hooks não recebem o aviso do React Compiler; um refactor futuro deve religar as regras.
- **Scope**: `src/hooks/**`
- **Date**: 2026-10-16
- **Status**: active

### AD-002
- **Decision**: O projeto não tem framework de testes; o gate de cada task é `npm run lint` + `npm run build`.
- **Reason**: Escolha do usuário: nenhuma dependência nova.
- **Trade-off**: Critérios de aceite são verificados por leitura de código com `file:line`, sem suíte que detecte regressões; o discrimination sensor não se aplica.
- **Scope**: projeto inteiro
- **Date**: 2026-10-16
- **Status**: active

### AD-003
- **Decision**: Cores, fontes e easing vivem como tokens Tailwind 4 em `@theme` no `src/index.css`; componentes usam só utilitários desses tokens (`bg-surface`, `text-ink`, `text-accent`…), nunca a paleta `zinc/emerald/sky`.
- **Reason**: Direção A aprovada; uma fonte de verdade para cor e contraste.
- **Trade-off**: Classes da paleta padrão do Tailwind deixam de ser usadas no app.
- **Scope**: `src/**`
- **Date**: 2026-10-16
- **Status**: active

## Handoff

- **Feature**: `.specs/features/ux-redesign`
- **Phase / Task**: concluída (T1–T25 + correções da revisão web-design-guidelines)
- **Completed**: T1–T25, Verifier PASS, revisão de guidelines
- **In-progress** (file:line): none
- **Next step**: UAT manual no navegador (Solo e Duel com backend rodando); depois push/PR quando o usuário autorizar
- **Blockers**: none
- **Uncommitted files**: `graphify-out/`
- **Branch**: feat/ux-redesign
