// Classes compartilhadas de botão e superfície (GLOB-07: alvo mínimo de 44px).

export const btnBase =
    'inline-flex items-center justify-center gap-2.5 rounded-full min-h-11 px-5 text-[15px] font-semibold transition duration-200 ease-brass active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100';

export const btnPrimary = `${btnBase} bg-accent text-on-accent hover:brightness-110`;

export const btnSecondary = `${btnBase} bg-surface-2 text-ink ring-1 ring-line hover:ring-white/15`;

export const btnGhost = `${btnBase} text-muted hover:text-ink`;

export const btnDanger = `${btnBase} text-error ring-1 ring-error/50 hover:bg-error/10`;

export const bezelOuter = 'rounded-[22px] bg-surface p-1.5 ring-1 ring-white/6';

export const bezelInner = 'rounded-2xl bg-core ring-1 ring-white/4';
