import type { Ref } from 'react';
import { Kbd } from './Kbd';
import { bezelInner, bezelOuter, btnGhost, btnPrimary, btnSecondary } from '../lib/ui';
import { useHistoryStore } from '../store/playerStore';

interface SoloResultProps {
    wpm: number;
    accuracy: number;
    durationMs: number;
    correctChars: number;
    errors: number;
    difficultyLabel: string;
    onReplay: () => void;
    onNewText: () => void;
    onHome: () => void;
    primaryRef: Ref<HTMLButtonElement>;
}

function oneDecimal(value: number): string {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function SoloResult({
    wpm,
    accuracy,
    durationMs,
    correctChars,
    errors,
    difficultyLabel,
    onReplay,
    onNewText,
    onHome,
    primaryRef,
}: SoloResultProps) {
    // A página registra a partida num efeito; até lá history[0] ainda é a anterior.
    const stored = useHistoryStore(s => s.history);
    const head = stored[0];
    const includesCurrent =
        !!head &&
        head.wpm === wpm &&
        head.durationMs === durationMs &&
        head.accuracy === Number(accuracy.toFixed(2));
    const history = includesCurrent
        ? stored
        : [{ wpm, accuracy, durationMs, textId: '', createdAt: 'current' }, ...stored];
    const earlier = history.slice(1);

    // RES-02: comparação com a média e o recorde das partidas anteriores.
    let comparison: { text: string; tone: string } | null = null;
    let record: number | null = null;
    if (earlier.length >= 1) {
        const avg = Math.round(earlier.reduce((a, h) => a + h.wpm, 0) / earlier.length);
        const diff = wpm - avg;
        const tone =
            diff > 0
                ? 'text-ok bg-ok/10 ring-ok/30'
                : diff < 0
                  ? 'text-error bg-error/10 ring-error/30'
                  : 'text-muted bg-white/5 ring-line';
        comparison = { text: `${diff >= 0 ? '+' : ''}${diff} vs. sua média (${avg})`, tone };
        record = Math.max(...earlier.map(h => h.wpm));
    }

    // RES-03: últimas até 10, mais antiga à esquerda; a atual fica por último.
    const bars = history.length >= 2 ? history.slice(0, 10).reverse() : [];
    const maxBar = Math.max(1, ...bars.map(h => h.wpm));

    const metrics = [
        { label: 'Precisão', value: `${oneDecimal(accuracy)}%` },
        { label: 'Tempo', value: `${oneDecimal(durationMs / 1000)} s` },
        { label: 'Caracteres', value: String(correctChars) },
        { label: 'Erros', value: String(errors) },
    ];

    return (
        <div>
            <section className={bezelOuter} aria-labelledby="solo-result-title">
                <div className={`${bezelInner} p-6 sm:p-10`}>
                    <div className="grid gap-8 lg:grid-cols-2">
                        <div>
                            <h2 id="solo-result-title" className="text-[13px] font-semibold text-accent">
                                Resultado · {difficultyLabel}
                            </h2>
                            <p className="mt-2 flex items-baseline gap-3">
                                <span className="font-mono text-[96px] leading-none text-ink tabular-nums sm:text-[136px]">
                                    {wpm}
                                </span>
                                <span className="text-2xl text-muted">wpm</span>
                            </p>
                            {comparison && (
                                <p
                                    className={`mt-6 inline-flex rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ${comparison.tone}`}
                                >
                                    {comparison.text}
                                </p>
                            )}
                        </div>
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-6 self-center">
                            {metrics.map(m => (
                                <div key={m.label}>
                                    <dt className="text-[13px] text-muted">{m.label}</dt>
                                    <dd className="mt-1 font-mono text-4xl text-ink tabular-nums">{m.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {(bars.length > 0 || record !== null) && (
                        <div className="mt-8 flex flex-col gap-3 border-t border-white/6 pt-6 sm:flex-row sm:items-end sm:gap-10">
                            {bars.length > 0 && (
                                <>
                                    <span className="text-[13px] text-muted sm:self-center">Últimas 10</span>
                                    <div
                                        role="img"
                                        aria-label={`WPM das últimas ${bars.length} partidas`}
                                        className="flex h-14 flex-1 items-end gap-1.5 sm:max-w-[420px]"
                                    >
                                        {bars.map((h, i) => (
                                            <span
                                                key={`${h.createdAt}-${i}`}
                                                className={`flex-1 rounded-[3px] ${
                                                    i === bars.length - 1 ? 'bg-accent' : 'bg-line'
                                                }`}
                                                style={{ height: `${Math.max(6, (h.wpm / maxBar) * 100)}%` }}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                            {record !== null && (
                                <span className="text-[13px] text-muted sm:ml-auto sm:self-center">
                                    Recorde: {record} wpm
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                    ref={primaryRef}
                    type="button"
                    onClick={onReplay}
                    className={`${btnPrimary} w-full sm:w-auto`}
                >
                    Jogar novamente
                    <span className="hidden sm:inline-flex">
                        <Kbd onAccent>↵ Enter</Kbd>
                    </span>
                </button>
                <button type="button" onClick={onNewText} className={`${btnSecondary} w-full sm:w-auto`}>
                    Novo texto
                    <span className="hidden sm:inline-flex">
                        <Kbd>Tab</Kbd>
                    </span>
                </button>
                <button type="button" onClick={onHome} className={`${btnGhost} w-full sm:w-auto`}>
                    Voltar ao início
                </button>
            </div>
        </div>
    );
}
