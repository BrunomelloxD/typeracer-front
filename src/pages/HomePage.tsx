import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Kbd } from '../components/Kbd';
import { bezelInner, bezelOuter, btnPrimary, btnSecondary } from '../lib/ui';
import { useHistoryStore, usePlayerStore } from '../store/playerStore';

const FORM_ID = 'home-name-form';

const chip = 'rounded-lg bg-surface-2 px-2.5 py-1 text-[13px] text-muted ring-1 ring-line';

function formatPct(value: number): string {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function HomePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const playerName = usePlayerStore(s => s.playerName);
    const setPlayerName = usePlayerStore(s => s.setPlayerName);
    const history = useHistoryStore(s => s.history);
    const [name, setName] = useState(playerName);

    const state = location.state as { redirectTo?: unknown } | null;
    const redirectTo = typeof state?.redirectTo === 'string' ? state.redirectTo : undefined;

    // Enter vai para o destino lembrado; cada botão leva ao próprio modo (o Duelo mantém ?code=).
    const enterTarget = redirectTo ?? '/solo';
    const duelTarget = redirectTo?.startsWith('/duel') ? redirectTo : '/duel';

    const trimmed = name.trim();
    const canSubmit = trimmed.length > 0;

    const goTo = (path: string) => {
        if (!canSubmit) return;
        setPlayerName(trimmed);
        navigate(path);
    };

    const stats =
        history.length > 0
            ? [
                  { label: 'Melhor', value: `${Math.max(...history.map(h => h.wpm))} wpm` },
                  {
                      label: 'Média',
                      value: `${Math.round(history.reduce((a, h) => a + h.wpm, 0) / history.length)} wpm`,
                  },
                  { label: 'Partidas', value: String(history.length) },
                  {
                      label: 'Precisão média',
                      value: `${formatPct(history.reduce((a, h) => a + h.accuracy, 0) / history.length)}%`,
                  },
              ]
            : null;

    return (
        <div className="mx-auto grid max-w-[1120px] gap-12 px-4 py-12 sm:py-20 lg:grid-cols-[1fr_520px] lg:gap-20">
            <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-[13px] font-semibold text-muted ring-1 ring-line">
                    <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
                    Desafio de digitação · 60 s
                </span>
                <h1 className="mt-6 text-balance text-5xl leading-[1.02] font-semibold tracking-[-0.03em] text-ink sm:text-[76px]">
                    <span className="block">Digite rápido.</span>
                    <span className="block">
                        Erre{' '}
                        <span
                            className="caret-blink mx-[0.04em] inline-block h-[0.9em] w-[3px] rounded-full bg-accent align-[-0.08em] sm:w-1"
                            aria-hidden="true"
                        />
                        <span className="text-untyped">pouco.</span>
                    </span>
                </h1>
                <p className="mt-6 max-w-[44ch] text-lg text-muted">
                    Corridas de 60 segundos contra o relógio ou contra outra pessoa. O WPM conta só
                    caracteres certos.
                </p>

                <form
                    id={FORM_ID}
                    className="mt-10 max-w-[460px]"
                    onSubmit={e => {
                        e.preventDefault();
                        goTo(enterTarget);
                    }}
                >
                    {redirectTo && (
                        <p role="status" className="mb-3 text-sm font-semibold text-accent">
                            Digite seu nome para continuar.
                        </p>
                    )}
                    <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="name">
                        Seu nome
                    </label>
                    <div className={bezelOuter}>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="nickname"
                            spellCheck={false}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Digite seu nome…"
                            maxLength={32}
                            autoFocus
                            aria-describedby="name-hint"
                            className="h-14 w-full rounded-2xl bg-core px-5 text-lg text-ink caret-accent ring-1 ring-white/4 outline-none transition-shadow duration-200 ease-brass placeholder:text-untyped focus:ring-2 focus:ring-accent/60"
                        />
                    </div>
                    <p id="name-hint" className="mt-3 text-sm text-muted">
                        Aparece no ranking e para quem disputar com você.
                    </p>
                </form>
            </div>

            <div className="flex flex-col gap-6">
                <section className={bezelOuter.replace('ring-white/6', 'ring-accent/35')}>
                    <div className={`${bezelInner} p-7 sm:p-9`}>
                        <h2 className="text-3xl font-semibold tracking-[-0.02em] text-ink">Solo</h2>
                        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Detalhes do modo solo">
                            <li className={chip}>1 jogador</li>
                            <li className={chip}>60 s</li>
                            <li className={chip}>3 níveis</li>
                        </ul>
                        <p className="mt-4 text-muted">Texto aleatório. O tempo começa na primeira tecla.</p>
                        <button
                            type="button"
                            onClick={() => goTo('/solo')}
                            disabled={!canSubmit}
                            className={`${btnPrimary} mt-6 w-full sm:w-auto`}
                        >
                            Começar solo
                            {enterTarget === '/solo' && <Kbd onAccent>↵ Enter</Kbd>}
                        </button>
                    </div>
                </section>

                <section className={bezelOuter}>
                    <div className={`${bezelInner} p-7 sm:p-9`}>
                        <h2 className="text-3xl font-semibold tracking-[-0.02em] text-ink">Duelo</h2>
                        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Detalhes do modo duelo">
                            <li className={chip}>2 jogadores</li>
                            <li className={chip}>tempo real</li>
                            <li className={chip}>link ou código</li>
                        </ul>
                        <p className="mt-4 text-muted">
                            Crie uma sala e mande o link, ou entre com 6 dígitos.
                        </p>
                        <button
                            type="button"
                            onClick={() => goTo(duelTarget)}
                            disabled={!canSubmit}
                            className={`${btnSecondary} mt-6 w-full sm:w-auto`}
                        >
                            Ir para o duelo
                            {enterTarget === duelTarget && <Kbd>↵ Enter</Kbd>}
                        </button>
                    </div>
                </section>
            </div>

            {stats && (
                <section
                    className="flex flex-wrap items-end gap-x-12 gap-y-6 border-t border-white/6 pt-8 lg:col-span-2"
                    aria-label="Seu histórico solo"
                >
                    <dl className="grid flex-1 grid-cols-2 gap-6 sm:grid-cols-4">
                        {stats.map(s => (
                            <div key={s.label}>
                                <dt className="text-[13px] text-muted">{s.label}</dt>
                                <dd className="mt-1 font-mono text-2xl text-ink tabular-nums">{s.value}</dd>
                            </div>
                        ))}
                    </dl>
                    <p className="hidden text-[13px] text-muted lg:block">Enter começa o solo · Tab navega</p>
                </section>
            )}
        </div>
    );
}
