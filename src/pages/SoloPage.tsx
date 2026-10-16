import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TypingArea } from '../components/TypingArea';
import { ProgressBar } from '../components/ProgressBar';
import { RaceStats } from '../components/RaceStats';
import { Kbd } from '../components/Kbd';
import { SoloResult } from '../components/SoloResult';
import { SoloHistory } from '../components/SoloHistory';
import { useTyping } from '../hooks/useTyping';
import { useTimer } from '../hooks/useTimer';
import { calculateWpm } from '../hooks/useSocket';
import { useRaceFocusMode } from '../hooks/useRaceFocusMode';
import { api } from '../lib/api';
import { bezelInner, bezelOuter, btnGhost, btnSecondary } from '../lib/ui';
import { useHistoryStore, usePlayerStore } from '../store/playerStore';
import type { Difficulty, TextResponse } from '../types/api';

const DURATION_MS = 60_000;
const INITIAL_DIFFICULTY: Difficulty = 'MEDIUM';

// MET-05
const DIFFICULTIES: { value: Difficulty; label: string }[] = [
    { value: 'EASY', label: 'Fácil' },
    { value: 'MEDIUM', label: 'Médio' },
    { value: 'HARD', label: 'Difícil' },
];

const btnCompact = btnSecondary.replace('px-5', 'px-4').replace('text-[15px]', 'text-sm');

type PageError = { kind: 'load' | 'score'; message: string };

function oneDecimal(value: number): string {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function SoloPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const playerName = usePlayerStore(s => s.playerName);
    const pushHistory = useHistoryStore(s => s.pushEntry);

    const [difficulty, setDifficulty] = useState<Difficulty>(INITIAL_DIFFICULTY);
    const [text, setText] = useState<TextResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<PageError | null>(null);
    const [round, setRound] = useState(0);
    const recordedRef = useRef(false);
    const requestRef = useRef(0);
    const primaryRef = useRef<HTMLButtonElement>(null);

    const typing = useTyping(text?.content ?? '');
    const timer = useTimer(DURATION_MS);

    // HOME-05: sem nome, volta para a Home lembrando o destino (com query string).
    useEffect(() => {
        if (!playerName) {
            navigate('/', {
                replace: true,
                state: { redirectTo: location.pathname + location.search },
            });
        }
    }, [playerName, navigate, location.pathname, location.search]);

    // Busca sem setState síncrono; só a resposta mais recente vale.
    const fetchText = useCallback((d: Difficulty) => {
        const id = ++requestRef.current;
        api.getRandomText(d)
            .then(t => {
                if (id === requestRef.current) setText(t);
            })
            .catch(e => {
                if (id === requestRef.current) {
                    setError({
                        kind: 'load',
                        message: e instanceof Error ? e.message : 'Falha ao carregar texto',
                    });
                }
            })
            .finally(() => {
                if (id === requestRef.current) setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchText(INITIAL_DIFFICULTY);
    }, [fetchText]);

    // STATE-04: troca de texto sem window.confirm.
    const loadText = (d: Difficulty) => {
        setLoading(true);
        setError(null);
        typing.reset();
        timer.reset();
        recordedRef.current = false;
        fetchText(d);
    };

    // KEY-01: mesmo texto, tempo e entrada zerados; o novo `key` remonta a área e refaz o foco.
    const replay = () => {
        typing.reset();
        timer.reset();
        recordedRef.current = false;
        setError(null);
        setRound(r => r + 1);
    };

    // Fim derivado: texto concluído OU tempo esgotado.
    const finished =
        !!text && !loading && (typing.isComplete || (!timer.running && timer.elapsedMs > 0));

    // Registro do resultado: uma vez por partida, mesmo payload de antes.
    useEffect(() => {
        if (!finished || recordedRef.current || !text) return;
        recordedRef.current = true;
        timer.stop();
        const durationMs = timer.elapsedMs || DURATION_MS;
        const finalWpm = calculateWpm(typing.correctChars, durationMs);
        const accuracy = Number(typing.accuracy.toFixed(2));
        pushHistory({
            wpm: finalWpm,
            accuracy,
            durationMs,
            textId: text.id,
            createdAt: new Date().toISOString(),
        });
        api.submitScore({
            mode: 'SOLO',
            playerName,
            wpm: finalWpm,
            accuracy,
            durationMs,
            textId: text.id,
        }).catch(err =>
            setError({
                kind: 'score',
                message: err instanceof Error ? err.message : 'Falha ao salvar score',
            }),
        );
    }, [finished, text, timer, typing, pushHistory, playerName]);

    // KEY-03: foco no "Jogar novamente" ao terminar.
    useEffect(() => {
        if (finished) primaryRef.current?.focus();
    }, [finished]);

    // KEY-02: Esc carrega novo texto da dificuldade atual.
    const loadTextRef = useRef(loadText);
    useEffect(() => {
        loadTextRef.current = loadText;
    });
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            e.preventDefault();
            loadTextRef.current(difficulty);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [difficulty]);

    // MET-06: modo foco enquanto corre.
    useRaceFocusMode(timer.running && !finished);

    const handleType = (value: string) => {
        if (!text || finished) return;
        if (!timer.running && timer.elapsedMs === 0) timer.start();
        typing.setTyped(value);
    };

    const wpm = calculateWpm(typing.correctChars, timer.elapsedMs || 1);
    const remainingSec = Math.ceil(timer.remainingMs / 1000);

    // Resultado derivado de typing/timer, que ficam congelados após o fim.
    const resultDurationMs = timer.elapsedMs || DURATION_MS;
    const resultWpm = calculateWpm(typing.correctChars, resultDurationMs);
    const resultErrors = Math.round(typing.totalKeystrokes * (1 - typing.accuracy / 100));
    const difficultyLabel = DIFFICULTIES.find(d => d.value === difficulty)?.label ?? '';

    return (
        <div className="mx-auto max-w-[1040px] px-4 py-8 sm:py-12">
            <h1 className="sr-only">Modo solo</h1>
            {/* RES-06 */}
            <div className="sr-only" role="status" aria-live="polite">
                {finished
                    ? `Resultado: ${resultWpm} palavras por minuto, precisão ${oneDecimal(typing.accuracy)}%`
                    : ''}
            </div>

            {!finished && (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <RaceStats remainingSec={remainingSec} wpm={wpm} accuracy={typing.accuracy} />
                    <div className="race-dim flex flex-wrap items-center gap-2">
                        <div
                            role="radiogroup"
                            aria-label="Dificuldade"
                            className="flex rounded-full bg-surface p-1 ring-1 ring-line"
                        >
                            {DIFFICULTIES.map(d => {
                                const active = difficulty === d.value;
                                return (
                                    <button
                                        key={d.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        onClick={() => {
                                            setDifficulty(d.value);
                                            loadText(d.value);
                                        }}
                                        className={`min-h-11 rounded-full px-4 text-sm font-semibold transition duration-200 ease-brass ${
                                            active
                                                ? 'bg-surface-2 text-ink ring-1 ring-white/8'
                                                : 'text-muted hover:text-ink'
                                        }`}
                                    >
                                        {d.label}
                                    </button>
                                );
                            })}
                        </div>
                        <button type="button" onClick={() => loadText(difficulty)} className={btnGhost}>
                            Novo texto
                            <Kbd>Esc</Kbd>
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div
                    role="alert"
                    className="mb-6 flex flex-col gap-3 rounded-2xl bg-error/8 p-4 ring-1 ring-error/30 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div>
                        <p className="font-semibold text-error">
                            {error.kind === 'load'
                                ? 'Não foi possível carregar o texto.'
                                : 'Não foi possível salvar o resultado.'}
                        </p>
                        <p className="mt-1 text-sm text-muted">{error.message}</p>
                    </div>
                    {error.kind === 'load' && (
                        <button
                            type="button"
                            onClick={() => loadText(difficulty)}
                            className={`${btnSecondary} shrink-0`}
                        >
                            Tentar novamente
                        </button>
                    )}
                </div>
            )}

            {finished ? (
                <SoloResult
                    wpm={resultWpm}
                    accuracy={typing.accuracy}
                    durationMs={resultDurationMs}
                    correctChars={typing.correctChars}
                    errors={resultErrors}
                    difficultyLabel={difficultyLabel}
                    onReplay={replay}
                    onNewText={() => loadText(difficulty)}
                    onHome={() => navigate('/')}
                    primaryRef={primaryRef}
                />
            ) : loading ? (
                <div role="status" className={bezelOuter}>
                    <div className={`${bezelInner} space-y-4 p-5 sm:p-10`}>
                        <div className="h-6 w-11/12 animate-pulse rounded bg-surface-2" />
                        <div className="h-6 w-10/12 animate-pulse rounded bg-surface-2" />
                        <div className="h-6 w-8/12 animate-pulse rounded bg-surface-2" />
                    </div>
                    <span className="sr-only">Carregando texto…</span>
                </div>
            ) : (
                text &&
                error?.kind !== 'load' && (
                    <>
                        <TypingArea
                            key={round}
                            inputId="solo-input"
                            target={text.content}
                            typed={typing.typed}
                            onChange={handleType}
                        />
                        <div className="mt-4">
                            <ProgressBar progress={typing.progress} />
                        </div>
                        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                            <button type="button" onClick={replay} className={btnCompact}>
                                Reiniciar
                            </button>
                            <p className="text-[13px] text-muted">
                                <Kbd>Tab</Kbd> + <Kbd>Enter</Kbd> reinicia · <Kbd>Esc</Kbd> troca o texto
                            </p>
                        </div>
                    </>
                )
            )}

            {(!timer.running || finished) && (
                <div className="mt-12">
                    <SoloHistory />
                </div>
            )}
        </div>
    );
}
