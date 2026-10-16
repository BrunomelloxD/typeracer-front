import type { Ref } from 'react';
import { Kbd } from './Kbd';
import { bezelInner, bezelOuter, btnPrimary, btnSecondary } from '../lib/ui';
import type { RankingEntry } from '../types/api';

interface DuelResultProps {
    ranking: RankingEntry[];
    me: string;
    code?: string;
    onPlayAgain: () => void;
    onLeave: () => void;
    primaryRef: Ref<HTMLButtonElement>;
}

function oneDecimal(value: number): string {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function DuelResult({ ranking, me, code, onPlayAgain, onLeave, primaryRef }: DuelResultProps) {
    const mine = ranking.find(r => r.playerName === me);

    // RES-05: manchete segue a posição do servidor (empate incluído).
    const headline = !mine
        ? 'Resultado final'
        : mine.position === 1
          ? 'Você venceu'
          : `Você ficou em ${mine.position}º`;

    const other = ranking.find(r => r.playerName !== me);
    const gap = mine && other && ranking.length === 2 ? Math.abs(mine.wpm - other.wpm) : null;

    const maxWpm = Math.max(1, ...ranking.map(r => r.wpm));

    return (
        <div>
            <section className={bezelOuter} aria-labelledby="duel-result-title">
                <div className={`${bezelInner} p-6 sm:p-10`}>
                    <p className="text-[13px] font-semibold text-accent">
                        Resultado final{code ? ` · Sala ${code}` : ''}
                    </p>
                    <h2
                        id="duel-result-title"
                        className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-[56px] sm:leading-[1.05]"
                    >
                        {headline}
                    </h2>
                    {gap !== null && (
                        <p className="mt-2 text-lg text-muted">por {gap} wpm de diferença</p>
                    )}

                    {/* RES-04 */}
                    <ol className="mt-8 space-y-3">
                        {ranking.map(r => {
                            const isMe = r.playerName === me;
                            const pct = (r.wpm / maxWpm) * 100;
                            return (
                                <li
                                    key={`${r.position}-${r.playerName}`}
                                    className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-4 rounded-2xl p-5 sm:grid-cols-[3rem_auto_minmax(0,1fr)_minmax(0,18rem)_auto] sm:gap-x-5 ${
                                        isMe ? 'bg-surface-2 ring-1 ring-accent/30' : 'bg-surface ring-1 ring-white/5'
                                    }`}
                                >
                                    <span
                                        className={`font-mono text-3xl tabular-nums ${
                                            isMe ? 'text-accent' : 'text-rival'
                                        }`}
                                    >
                                        #{r.position}
                                    </span>
                                    <span
                                        aria-hidden="true"
                                        className={`hidden size-8 place-items-center rounded-lg text-xs font-semibold sm:grid ${
                                            isMe ? 'bg-accent/15 text-accent' : 'bg-rival/15 text-rival'
                                        }`}
                                    >
                                        {r.playerName.trim().charAt(0).toUpperCase() || '?'}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="flex items-baseline gap-2">
                                            <span className="truncate text-lg font-semibold text-ink">
                                                {r.playerName}
                                            </span>
                                            {isMe && (
                                                <span className="text-xs font-semibold text-accent">você</span>
                                            )}
                                        </span>
                                        <span className="block text-[13px] text-muted tabular-nums">
                                            {oneDecimal(r.accuracy)}% precisão · {oneDecimal(r.durationMs / 1000)} s
                                        </span>
                                    </span>
                                    <span
                                        aria-hidden="true"
                                        className="order-last col-span-full h-1.5 overflow-hidden rounded-full bg-line sm:order-none sm:col-span-1"
                                    >
                                        <span
                                            className={`block h-full w-full origin-left rounded-full ${
                                                isMe ? 'bg-accent' : 'bg-rival'
                                            }`}
                                            style={{ transform: `scaleX(${pct / 100})` }}
                                        />
                                    </span>
                                    <span className="flex flex-col items-end">
                                        <span className="font-mono text-4xl leading-none text-ink tabular-nums">
                                            {r.wpm}
                                        </span>
                                        <span className="mt-1 text-xs text-muted">wpm</span>
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </section>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                    ref={primaryRef}
                    type="button"
                    onClick={onPlayAgain}
                    className={`${btnPrimary} w-full sm:w-auto`}
                >
                    Nova partida
                    <span className="hidden sm:inline-flex">
                        <Kbd onAccent>↵ Enter</Kbd>
                    </span>
                </button>
                <button type="button" onClick={onLeave} className={`${btnSecondary} w-full sm:w-auto`}>
                    Voltar ao início
                    <span className="hidden sm:inline-flex">
                        <Kbd>Esc</Kbd>
                    </span>
                </button>
            </div>
        </div>
    );
}
