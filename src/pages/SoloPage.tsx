import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TypingArea } from '../components/TypingArea';
import { ProgressBar } from '../components/ProgressBar';
import { StatPill } from '../components/StatPill';
import { useTyping } from '../hooks/useTyping';
import { useTimer } from '../hooks/useTimer';
import { calculateWpm } from '../hooks/useSocket';
import { api } from '../lib/api';
import { timeAgo } from '../lib/format';
import { useHistoryStore, usePlayerStore } from '../store/playerStore';
import type { Difficulty, TextResponse } from '../types/api';

const DURATION_MS = 60_000;

export function SoloPage() {
    const navigate = useNavigate();
    const playerName = usePlayerStore(s => s.playerName);
    const pushHistory = useHistoryStore(s => s.pushEntry);

    const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
    const [text, setText] = useState<TextResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [finished, setFinished] = useState(false);
    const submittedRef = useRef(false);

    const typing = useTyping(text?.content ?? '');
    const timer = useTimer(DURATION_MS);

    useEffect(() => {
        if (!playerName) navigate('/');
    }, [playerName, navigate]);

    const loadText = async (d: Difficulty) => {
        // Confirmação ao trocar texto durante a partida
        if (timer.running && !finished) {
            const ok = window.confirm('Trocar de texto vai descartar sua partida atual. Continuar?');
            if (!ok) return;
        }
        setLoading(true);
        setError(null);
        setFinished(false);
        submittedRef.current = false;
        timer.reset();
        try {
            const t = await api.getRandomText(d);
            setText(t);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Falha ao carregar texto');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadText(difficulty);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleType = (value: string) => {
        if (!text || finished) return;
        if (!timer.running && timer.elapsedMs === 0) timer.start();
        typing.setTyped(value);
    };

    const wpm = useMemo(
        () => calculateWpm(typing.correctChars, timer.elapsedMs || 1),
        [typing.correctChars, timer.elapsedMs],
    );

    const remainingSec = Math.ceil(timer.remainingMs / 1000);
    const timerTone = remainingSec <= 5 ? 'danger' : remainingSec <= 10 ? 'warning' : 'default';

    // Fim do desafio: tempo esgotou OU texto concluído
    useEffect(() => {
        const done = !timer.running && timer.elapsedMs > 0;
        const completed = typing.isComplete;
        if ((done || completed) && !finished && text) {
            setFinished(true);
            timer.stop();
            const finalWpm = calculateWpm(typing.correctChars, timer.elapsedMs || DURATION_MS);
            const payload = {
                wpm: finalWpm,
                accuracy: Number(typing.accuracy.toFixed(2)),
                durationMs: timer.elapsedMs || DURATION_MS,
                textId: text.id,
                createdAt: new Date().toISOString(),
            };
            pushHistory(payload);
            if (!submittedRef.current) {
                submittedRef.current = true;
                api.submitScore({
                    mode: 'SOLO',
                    playerName,
                    wpm: payload.wpm,
                    accuracy: payload.accuracy,
                    durationMs: payload.durationMs,
                    textId: text.id,
                }).catch(err => setError(err instanceof Error ? err.message : 'Falha ao salvar score'));
            }
        }
    }, [
        timer.running,
        timer.elapsedMs,
        typing.isComplete,
        typing.correctChars,
        typing.accuracy,
        finished,
        text,
        playerName,
        pushHistory,
        timer,
    ]);

    return (
        <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div
                    className="flex gap-2"
                    role="radiogroup"
                    aria-label="Dificuldade"
                >
                    {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map(d => (
                        <button
                            key={d}
                            type="button"
                            role="radio"
                            aria-checked={difficulty === d}
                            onClick={() => {
                                setDifficulty(d);
                                void loadText(d);
                            }}
                            className={`min-h-[36px] rounded-md border px-3 py-1.5 text-sm transition ${
                                difficulty === d
                                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                            }`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => loadText(difficulty)}
                    className="min-h-[36px] rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-emerald-500 hover:text-emerald-300"
                >
                    Novo texto
                </button>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-3">
                <StatPill
                    label="Tempo"
                    value={remainingSec}
                    suffix="s"
                    tone={timerTone}
                    live
                />
                <StatPill label="WPM" value={wpm} live />
                <StatPill label="Acurácia" value={typing.accuracy.toFixed(0)} suffix="%" />
            </div>

            <div className="mb-3">
                <ProgressBar progress={typing.progress} label="Progresso" />
            </div>

            {error && (
                <div
                    className="mb-3 flex items-start justify-between gap-3 rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300"
                    role="alert"
                >
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => loadText(difficulty)}
                        className="shrink-0 rounded-md border border-rose-500/60 px-2 py-1 text-xs hover:bg-rose-500/10"
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            {loading || !text ? (
                <div
                    className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6"
                    aria-busy="true"
                    aria-label="Carregando texto"
                >
                    <div className="space-y-2">
                        <div className="h-5 w-11/12 animate-pulse rounded bg-zinc-800" />
                        <div className="h-5 w-10/12 animate-pulse rounded bg-zinc-800" />
                        <div className="h-5 w-8/12 animate-pulse rounded bg-zinc-800" />
                    </div>
                </div>
            ) : (
                <TypingArea
                    target={text.content}
                    typed={typing.typed}
                    onChange={handleType}
                    disabled={finished}
                />
            )}

            {finished && (
                <FinishedPanel
                    wpm={wpm}
                    accuracy={typing.accuracy}
                    onRestart={() => loadText(difficulty)}
                />
            )}

            <SoloHistory />
        </div>
    );
}

function FinishedPanel({
    wpm,
    accuracy,
    onRestart,
}: {
    wpm: number;
    accuracy: number;
    onRestart: () => void;
}) {
    return (
        <section
            className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-6 text-center"
            aria-live="polite"
        >
            <h2 className="text-2xl font-semibold text-emerald-300">Desafio finalizado!</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
                <StatPill label="WPM" value={wpm} tone="success" />
                <StatPill label="Acurácia" value={accuracy.toFixed(1)} suffix="%" tone="success" />
            </div>
            <button
                type="button"
                onClick={onRestart}
                className="mt-5 min-h-[44px] rounded-md bg-emerald-500 px-5 py-2 font-medium text-zinc-950 transition hover:bg-emerald-400"
            >
                Jogar novamente
            </button>
        </section>
    );
}

function SoloHistory() {
    const history = useHistoryStore(s => s.history);
    const clear = useHistoryStore(s => s.clear);
    if (history.length === 0) return null;

    const max = Math.max(...history.map(h => h.wpm));
    return (
        <section className="mt-10">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm uppercase tracking-wider text-zinc-500">
                    Suas últimas partidas
                </h3>
                <button
                    type="button"
                    onClick={() => {
                        if (window.confirm('Limpar histórico local?')) clear();
                    }}
                    className="text-xs text-zinc-500 transition hover:text-rose-400"
                >
                    Limpar
                </button>
            </div>
            <ul className="space-y-2">
                {history.map(h => {
                    const widthPct = max === 0 ? 0 : (h.wpm / max) * 100;
                    return (
                        <li
                            key={h.createdAt}
                            className="flex flex-wrap items-center gap-3 rounded-md border border-zinc-800 bg-zinc-900/40 p-3 sm:flex-nowrap"
                        >
                            <div className="w-12 text-right font-mono text-emerald-400 tabular-nums">
                                {h.wpm}
                            </div>
                            <div className="order-3 w-full sm:order-none sm:flex-1">
                                <div className="h-2 overflow-hidden rounded bg-zinc-800">
                                    <div
                                        className="h-full bg-emerald-500"
                                        style={{ width: `${widthPct}%` }}
                                    />
                                </div>
                            </div>
                            <div className="w-16 text-right text-xs text-zinc-500 tabular-nums">
                                {h.accuracy.toFixed(0)}%
                            </div>
                            <div
                                className="ml-auto text-right text-xs text-zinc-500 sm:ml-0 sm:w-32"
                                title={new Date(h.createdAt).toLocaleString('pt-BR')}
                            >
                                {timeAgo(h.createdAt)}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
