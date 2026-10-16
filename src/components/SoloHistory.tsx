import { useEffect, useRef, useState } from 'react';
import { timeAgo } from '../lib/format';
import { btnGhost } from '../lib/ui';
import { useHistoryStore } from '../store/playerStore';

const CONFIRM_MS = 4000;

const btnGhostSmall = btnGhost.replace('px-5', 'px-3').replace('text-[15px]', 'text-[13px]');

function oneDecimal(value: number): string {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function SoloHistory() {
    const history = useHistoryStore(s => s.history);
    const clear = useHistoryStore(s => s.clear);
    const [confirming, setConfirming] = useState(false);
    const timeoutRef = useRef<number | undefined>(undefined);

    useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

    // STATE-04: limpeza em dois passos, sem window.confirm; a confirmação expira em 4 s.
    const handleClear = () => {
        window.clearTimeout(timeoutRef.current);
        if (confirming) {
            setConfirming(false);
            clear();
            return;
        }
        setConfirming(true);
        timeoutRef.current = window.setTimeout(() => setConfirming(false), CONFIRM_MS);
    };

    const max = Math.max(1, ...history.map(h => h.wpm));

    return (
        <section aria-labelledby="solo-history-title">
            <div className="mb-3 flex min-h-11 items-center justify-between gap-3">
                <h2 id="solo-history-title" className="text-[15px] font-semibold text-ink">
                    Suas últimas partidas
                </h2>
                {history.length > 0 && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className={`${btnGhostSmall} ${confirming ? 'text-error hover:text-error' : ''}`}
                    >
                        {confirming ? 'Confirmar limpeza' : 'Limpar'}
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-line p-8 text-center">
                    <p className="font-semibold text-ink">Nenhuma partida ainda</p>
                    <p className="mt-1 text-sm text-muted">
                        Sua primeira corrida aparece aqui, com WPM e precisão.
                    </p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {history.slice(0, 20).map((h, i) => {
                        const first = i === 0;
                        return (
                            <li
                                key={`${h.createdAt}-${i}`}
                                className={`flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-surface px-5 py-3 sm:flex-nowrap ${
                                    first ? 'ring-1 ring-white/6' : ''
                                }`}
                            >
                                <span
                                    className={`w-10 font-mono text-lg tabular-nums ${
                                        first ? 'text-accent' : 'text-ink'
                                    }`}
                                >
                                    {h.wpm}
                                    <span className="sr-only"> wpm</span>
                                </span>
                                <span
                                    className="order-last h-1.5 w-full overflow-hidden rounded-full bg-line sm:order-none sm:flex-1"
                                    aria-hidden="true"
                                >
                                    <span
                                        className={`block h-full origin-left rounded-full ${
                                            first ? 'bg-accent' : 'bg-muted/50'
                                        }`}
                                        style={{ transform: `scaleX(${h.wpm / max})` }}
                                    />
                                </span>
                                <span className="font-mono text-sm text-muted tabular-nums sm:w-20 sm:text-right">
                                    {oneDecimal(h.accuracy)}%
                                    <span className="sr-only"> de precisão</span>
                                </span>
                                <span
                                    className="ml-auto text-right text-sm text-muted sm:w-24"
                                    title={new Date(h.createdAt).toLocaleString('pt-BR')}
                                >
                                    {timeAgo(h.createdAt)}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
