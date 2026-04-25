import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { CopyButton } from '../components/CopyButton';
import { Countdown } from '../components/Countdown';
import { ProgressBar } from '../components/ProgressBar';
import { StatPill } from '../components/StatPill';
import { TypingArea } from '../components/TypingArea';
import { calculateWpm, useSocket } from '../hooks/useSocket';
import { useTimer } from '../hooks/useTimer';
import { useTyping } from '../hooks/useTyping';
import { api } from '../lib/api';
import { disconnectGameSocket } from '../lib/socket';
import { usePlayerStore } from '../store/playerStore';
import type { RankingEntry } from '../types/api';

type Phase = 'lobby' | 'waiting' | 'countdown' | 'running' | 'finished';
const DURATION_MS = 60_000;

interface OpponentState {
    socketId: string;
    playerName: string;
    progress: number;
    finishedWpm?: number;
}

export function DuelPage() {
    const navigate = useNavigate();
    const playerName = usePlayerStore(s => s.playerName);
    const { socket, connected } = useSocket();

    const [phase, setPhase] = useState<Phase>('lobby');
    const [code, setCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [text, setText] = useState<string>('');
    const [countdown, setCountdown] = useState(3);
    const [opponent, setOpponent] = useState<OpponentState | null>(null);
    const [ranking, setRanking] = useState<RankingEntry[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [announce, setAnnounce] = useState('');

    const typing = useTyping(text);
    const timer = useTimer(DURATION_MS);
    const finishedRef = useRef(false);

    useEffect(() => {
        if (!playerName) navigate('/');
    }, [playerName, navigate]);

    const resetToLobby = useCallback(() => {
        finishedRef.current = false;
        setPhase('lobby');
        setCode('');
        setInputCode('');
        setText('');
        setCountdown(3);
        setOpponent(null);
        setRanking(null);
        setError(null);
        setAnnounce('');
        typing.reset();
        timer.reset();
    }, [typing, timer]);

    // Listeners do gateway
    useEffect(() => {
        const onPlayerJoined = (data: { playerName: string; players: string[] }) => {
            const others = data.players.filter(p => p !== playerName);
            if (others[0]) {
                setOpponent(prev => prev ?? {
                    socketId: '',
                    playerName: others[0],
                    progress: 0,
                });
                setAnnounce(`${others[0]} entrou na sala`);
            }
        };
        const onRoomReady = (data: { text: string; textId: string }) => {
            setText(data.text);
            void data.textId;
        };
        const onCountdown = (data: { remaining: number }) => {
            setPhase('countdown');
            setCountdown(data.remaining);
        };
        const onStartGame = () => {
            setPhase('running');
            timer.start();
        };
        const onProgressUpdate = (data: {
            socketId: string;
            playerName: string;
            progress: number;
        }) => {
            setOpponent(prev => ({
                socketId: data.socketId,
                playerName: data.playerName,
                progress: data.progress,
                finishedWpm: prev?.finishedWpm,
            }));
        };
        const onOpponentFinished = (data: { playerName: string; wpm: number }) => {
            setOpponent(prev =>
                prev
                    ? { ...prev, finishedWpm: data.wpm }
                    : { socketId: '', playerName: data.playerName, progress: 100, finishedWpm: data.wpm },
            );
            setAnnounce(`${data.playerName} terminou com ${data.wpm} WPM`);
        };
        const onFinalResults = (data: { ranking: RankingEntry[] }) => {
            setRanking(data.ranking);
            setPhase('finished');
            timer.stop();
        };
        const onPlayerLeft = (data?: { playerName?: string }) => {
            const who = data?.playerName ?? 'O oponente';
            setError(`${who} saiu da sala.`);
            setAnnounce(`${who} saiu da sala`);
        };
        const onError = (e: { message?: string } | string) => {
            const msg = typeof e === 'string' ? e : e?.message ?? 'Erro no servidor';
            setError(msg);
        };

        socket.on('player_joined', onPlayerJoined);
        socket.on('room_ready', onRoomReady);
        socket.on('countdown', onCountdown);
        socket.on('start_game', onStartGame);
        socket.on('progress_update', onProgressUpdate);
        socket.on('opponent_finished', onOpponentFinished);
        socket.on('final_results', onFinalResults);
        socket.on('player_left', onPlayerLeft);
        socket.on('exception', onError);

        return () => {
            socket.off('player_joined', onPlayerJoined);
            socket.off('room_ready', onRoomReady);
            socket.off('countdown', onCountdown);
            socket.off('start_game', onStartGame);
            socket.off('progress_update', onProgressUpdate);
            socket.off('opponent_finished', onOpponentFinished);
            socket.off('final_results', onFinalResults);
            socket.off('player_left', onPlayerLeft);
            socket.off('exception', onError);
        };
    }, [socket, playerName, timer]);

    // Desconecta ao sair da página
    useEffect(() => () => disconnectGameSocket(), []);

    // Envia progresso ao servidor (throttled pelo próprio React: dispara em mudança)
    const lastSentProgressRef = useRef(-1);
    useEffect(() => {
        if (phase !== 'running' || !code) return;
        const intPct = Math.floor(typing.progress);
        if (intPct === lastSentProgressRef.current) return;
        lastSentProgressRef.current = intPct;
        socket.emit('progress_update', {
            code,
            progress: typing.progress,
            correctChars: typing.correctChars,
            totalKeystrokes: typing.totalKeystrokes,
        });
    }, [typing.progress, typing.correctChars, typing.totalKeystrokes, phase, code, socket]);

    const wpm = useMemo(
        () => calculateWpm(typing.correctChars, timer.elapsedMs || 1),
        [typing.correctChars, timer.elapsedMs],
    );

    // Detecta fim local (tempo acabou ou texto concluído) e emite finish_game
    useEffect(() => {
        if (phase !== 'running' || finishedRef.current) return;
        const timeUp = !timer.running && timer.elapsedMs >= DURATION_MS;
        if (typing.isComplete || timeUp) {
            finishedRef.current = true;
            const finalWpm = calculateWpm(typing.correctChars, timer.elapsedMs || DURATION_MS);
            socket.emit('finish_game', {
                code,
                wpm: finalWpm,
                accuracy: Number(typing.accuracy.toFixed(2)),
                durationMs: timer.elapsedMs || DURATION_MS,
            });
        }
    }, [
        phase,
        timer.running,
        timer.elapsedMs,
        typing.isComplete,
        typing.correctChars,
        typing.accuracy,
        code,
        socket,
    ]);

    const handleCreate = async () => {
        setError(null);
        try {
            const room = await api.createRoom('MEDIUM');
            setCode(room.code);
            setPhase('waiting');
            socket.emit('join_room', { code: room.code, playerName });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Falha ao criar sala');
        }
    };

    const handleJoin = () => {
        if (!/^\d{6}$/.test(inputCode)) {
            setError('Código deve ter 6 dígitos.');
            return;
        }
        setError(null);
        setCode(inputCode);
        setPhase('waiting');
        socket.emit('join_room', { code: inputCode, playerName });
    };

    const remainingSec = Math.ceil(timer.remainingMs / 1000);
    const timerTone =
        remainingSec <= 5 ? 'danger' : remainingSec <= 10 ? 'warning' : 'default';

    const liveRegion = (
        <div className="sr-only" aria-live="polite" role="status">
            {announce}
        </div>
    );

    if (phase === 'lobby') {
        return (
            <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
                {liveRegion}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-2xl font-semibold">Modo Duelo</h2>
                    <ConnectionBadge connected={connected} />
                </div>

                {error && (
                    <div
                        className="mb-4 rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                        <h3 className="mb-3 font-medium">Criar duelo</h3>
                        <p className="mb-4 text-sm text-zinc-400">
                            Gera um código de 6 dígitos para compartilhar com seu oponente.
                        </p>
                        <button
                            type="button"
                            disabled={!connected}
                            onClick={handleCreate}
                            className="min-h-[44px] w-full rounded-md bg-emerald-500 px-4 font-medium text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Criar sala
                        </button>
                    </div>

                    <form
                        className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5"
                        onSubmit={e => {
                            e.preventDefault();
                            handleJoin();
                        }}
                    >
                        <h3 className="mb-3 font-medium">Entrar em duelo</h3>
                        <label htmlFor="room-code" className="sr-only">
                            Código da sala
                        </label>
                        <input
                            id="room-code"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={inputCode}
                            onChange={e =>
                                setInputCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                            }
                            placeholder="000000"
                            className="mb-3 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-center font-mono-typing text-2xl tracking-widest text-zinc-100 outline-none transition focus:border-sky-500"
                        />
                        <button
                            type="submit"
                            disabled={!connected || inputCode.length !== 6}
                            className="min-h-[44px] w-full rounded-md border border-sky-500 px-4 font-medium text-sky-300 transition hover:bg-sky-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Entrar na sala
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (phase === 'waiting') {
        return (
            <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:py-16">
                {liveRegion}
                <h2 className="mb-2 text-xl text-zinc-400">Aguardando oponente...</h2>
                <div className="my-6 inline-block rounded-xl border border-emerald-500/40 bg-emerald-500/5 px-8 py-6">
                    <div className="text-xs uppercase tracking-wider text-emerald-300">
                        Código da sala
                    </div>
                    <div
                        className="font-mono-typing text-5xl font-bold text-emerald-300 tabular-nums"
                        aria-label={`Código ${code.split('').join(' ')}`}
                    >
                        {code}
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <CopyButton value={code} />
                    <button
                        type="button"
                        onClick={resetToLobby}
                        className="min-h-[44px] rounded-md border border-zinc-700 px-4 text-sm text-zinc-300 transition hover:border-rose-500/60 hover:text-rose-300"
                    >
                        Cancelar
                    </button>
                </div>
                <p className="mt-4 text-sm text-zinc-500">
                    Compartilhe o código com seu oponente para começar.
                </p>
                {error && (
                    <p className="mt-4 text-sm text-rose-300" role="alert">
                        {error}
                    </p>
                )}
            </div>
        );
    }

    if (phase === 'countdown') {
        return (
            <div className="mx-auto max-w-3xl px-4 py-8 text-center sm:py-12">
                {liveRegion}
                <p className="mb-2 text-sm text-zinc-400">
                    Vs. {opponent?.playerName ?? 'oponente'}
                </p>
                <Countdown value={countdown} />
                <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 text-left">
                    <p className="font-mono-typing text-base leading-relaxed text-zinc-500 sm:text-lg">
                        {text}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-6">
            {liveRegion}
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

            {error && (
                <div
                    className="mb-3 rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300"
                    role="alert"
                >
                    {error}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {/* Você */}
                <section
                    className="space-y-3 rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4"
                    aria-label="Sua corrida"
                >
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-emerald-300">{playerName} (você)</span>
                        <span className="text-xs text-zinc-400 tabular-nums">{wpm} wpm</span>
                    </div>
                    <ProgressBar progress={typing.progress} color="emerald" label="Você" />
                    {phase === 'running' && text ? (
                        <TypingArea
                            target={text}
                            typed={typing.typed}
                            onChange={typing.setTyped}
                            disabled={phase !== 'running'}
                        />
                    ) : (
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-zinc-500">
                            {phase === 'finished' ? 'Partida encerrada.' : 'Aguardando...'}
                        </div>
                    )}
                </section>

                {/* Oponente */}
                <section
                    className="space-y-3 rounded-xl border border-sky-500/40 bg-sky-500/5 p-4"
                    aria-label="Corrida do oponente"
                >
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-sky-300">
                            {opponent?.playerName ?? 'Oponente'}
                        </span>
                        {opponent?.finishedWpm !== undefined && (
                            <span className="text-xs text-zinc-400 tabular-nums">
                                {opponent.finishedWpm} wpm
                            </span>
                        )}
                    </div>
                    <ProgressBar
                        progress={opponent?.progress ?? 0}
                        color="sky"
                        label={opponent?.playerName ?? 'Oponente'}
                    />
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
                        <p className="font-mono-typing text-base leading-relaxed text-zinc-500">
                            {text || 'Aguardando texto...'}
                        </p>
                    </div>
                </section>
            </div>

            {phase === 'finished' && ranking && (
                <FinalRanking
                    ranking={ranking}
                    me={playerName}
                    onPlayAgain={resetToLobby}
                    onLeave={() => navigate('/')}
                />
            )}

            <div className="mt-4 flex items-center justify-center gap-3 text-xs text-zinc-600">
                <span>
                    Sala: <span className="font-mono">{code}</span>
                </span>
                <ConnectionBadge connected={connected} />
            </div>
        </div>
    );
}

function FinalRanking({
    ranking,
    me,
    onPlayAgain,
    onLeave,
}: {
    ranking: RankingEntry[];
    me: string;
    onPlayAgain: () => void;
    onLeave: () => void;
}) {
    return (
        <section
            className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-6"
            aria-live="polite"
        >
            <h3 className="mb-4 text-center text-2xl font-semibold text-emerald-300">
                Resultado final
            </h3>
            <ol className="space-y-2">
                {ranking.map(r => {
                    const isMe = r.playerName === me;
                    return (
                        <li
                            key={`${r.position}-${r.playerName}`}
                            className={`flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 transition ${
                                isMe
                                    ? 'border-emerald-500/60 bg-emerald-500/10'
                                    : 'border-zinc-800 bg-zinc-900/40'
                            }`}
                        >
                            <span className="flex items-center gap-3">
                                <span
                                    className={`font-mono text-lg tabular-nums ${
                                        r.position === 1 ? 'text-amber-300' : 'text-emerald-400'
                                    }`}
                                >
                                    #{r.position}
                                </span>
                                <span className="font-medium">
                                    {r.playerName}
                                    {isMe && (
                                        <span className="ml-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
                                            você
                                        </span>
                                    )}
                                </span>
                            </span>
                            <span className="text-sm text-zinc-400 tabular-nums">
                                {r.wpm} wpm · {r.accuracy.toFixed(0)}% ·{' '}
                                {(r.durationMs / 1000).toFixed(1)}s
                            </span>
                        </li>
                    );
                })}
            </ol>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={onPlayAgain}
                    className="min-h-[44px] rounded-md bg-emerald-500 px-5 font-medium text-zinc-950 transition hover:bg-emerald-400"
                >
                    Jogar novamente
                </button>
                <button
                    type="button"
                    onClick={onLeave}
                    className="min-h-[44px] rounded-md border border-zinc-700 px-5 text-zinc-300 transition hover:border-zinc-500"
                >
                    Voltar ao início
                </button>
            </div>
        </section>
    );
}
