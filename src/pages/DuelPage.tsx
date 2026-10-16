import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { CopyButton } from '../components/CopyButton';
import { Countdown } from '../components/Countdown';
import { DuelResult } from '../components/DuelResult';
import { Kbd } from '../components/Kbd';
import { RaceStats } from '../components/RaceStats';
import { RaceTrack } from '../components/RaceTrack';
import { TypingArea } from '../components/TypingArea';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { useRaceFocusMode } from '../hooks/useRaceFocusMode';
import { calculateWpm, useSocket } from '../hooks/useSocket';
import { useTimer } from '../hooks/useTimer';
import { useTyping } from '../hooks/useTyping';
import { api } from '../lib/api';
import { disconnectGameSocket } from '../lib/socket';
import { bezelInner, bezelOuter, btnGhost, btnPrimary, btnSecondary } from '../lib/ui';
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

const STATUS_TEXT = {
    connecting: 'Conectando…',
    reconnecting: 'Reconectando…',
    offline: 'Sem conexão',
} as const;

function oneDecimal(value: number): string {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function initialOf(name: string): string {
    return name.trim().charAt(0).toUpperCase() || '?';
}

export function DuelPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();
    const playerName = usePlayerStore(s => s.playerName);
    const { socket } = useSocket();
    const status = useConnectionStatus(socket);

    // DUEL-05/06: só aceita `?code=` com exatamente 6 dígitos.
    const queryCode = params.get('code') ?? '';
    const initialCode = /^\d{6}$/.test(queryCode) ? queryCode : '';

    const [phase, setPhase] = useState<Phase>('lobby');
    const [code, setCode] = useState('');
    const [inputCode, setInputCode] = useState(() => initialCode);
    const [text, setText] = useState<string>('');
    const [countdown, setCountdown] = useState(3);
    const [opponent, setOpponent] = useState<OpponentState | null>(null);
    const [ranking, setRanking] = useState<RankingEntry[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [opponentLeft, setOpponentLeft] = useState(false);
    const [announce, setAnnounce] = useState('');

    const typing = useTyping(text);
    const timer = useTimer(DURATION_MS);
    const finishedRef = useRef(false);
    const primaryRef = useRef<HTMLButtonElement>(null);
    const joinRef = useRef<HTMLButtonElement>(null);
    const joinFocusedRef = useRef(false);

    // HOME-05: sem nome, volta para a Home lembrando o destino (com query string).
    useEffect(() => {
        if (!playerName) {
            navigate('/', {
                replace: true,
                state: { redirectTo: location.pathname + location.search },
            });
        }
    }, [playerName, navigate, location.pathname, location.search]);

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
        setOpponentLeft(false);
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
            setOpponentLeft(true);
            setAnnounce(`${who} saiu da sala`);
        };
        const onError = (e: { message?: string } | string) => {
            const msg = typeof e === 'string' ? e : e?.message ?? 'Erro no servidor';
            setError(msg);
            setOpponentLeft(false);
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

    // DUEL-05: com código no link, foca "Entrar na sala" assim que o botão fica habilitado.
    useEffect(() => {
        if (!initialCode || joinFocusedRef.current || phase !== 'lobby' || status !== 'connected') return;
        joinFocusedRef.current = true;
        joinRef.current?.focus();
    }, [initialCode, phase, status]);

    // KEY-04: foco em "Nova partida" quando o resultado chega.
    useEffect(() => {
        if (phase === 'finished' && ranking) primaryRef.current?.focus();
    }, [phase, ranking]);

    // KEY-05: Esc sai da sala na espera; no resultado volta ao início.
    const escapeRef = useRef<() => boolean>(() => false);
    useEffect(() => {
        escapeRef.current = () => {
            if (phase === 'waiting') {
                resetToLobby();
                return true;
            }
            if (phase === 'finished') {
                navigate('/');
                return true;
            }
            return false;
        };
    });
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            if (escapeRef.current()) e.preventDefault();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    // MET-06: modo foco enquanto corre.
    useRaceFocusMode(phase === 'running');

    const remainingSec = Math.ceil(timer.remainingMs / 1000);
    const connected = status === 'connected';

    // RES-06: anuncia o resultado do jogador; fora disso, os avisos da sala.
    const myResult = phase === 'finished' ? ranking?.find(r => r.playerName === playerName) : undefined;
    const liveRegion = (
        <div className="sr-only" aria-live="polite" role="status">
            {myResult
                ? `Resultado: ${myResult.wpm} palavras por minuto, precisão ${oneDecimal(myResult.accuracy)}%`
                : announce}
        </div>
    );

    // DUEL-08: saída do oponente oferece voltar ao lobby.
    const errorBox = error && (
        <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-2xl bg-error/8 p-4 ring-1 ring-error/30 sm:flex-row sm:items-center sm:justify-between"
        >
            <p className="text-sm font-semibold text-error">{error}</p>
            {opponentLeft && (
                <button type="button" onClick={resetToLobby} className={`${btnSecondary} shrink-0`}>
                    Voltar ao lobby
                </button>
            )}
        </div>
    );

    if (phase === 'lobby') {
        const connHint = connected ? undefined : 'duel-conn-hint';
        return (
            <div className="mx-auto max-w-[1040px] px-4 py-8 sm:py-12">
                {liveRegion}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-3xl font-semibold tracking-[-0.02em] text-ink">Modo Duelo</h1>
                    <ConnectionBadge status={status} />
                </div>

                {errorBox}

                {!connected && (
                    <p id="duel-conn-hint" className="mb-4 text-sm text-muted">
                        Aguardando conexão com o servidor…
                    </p>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    <section className={bezelOuter} aria-labelledby="duel-create-title">
                        <div className={`${bezelInner} flex h-full flex-col gap-4 p-6 sm:p-8`}>
                            <h2 id="duel-create-title" className="text-xl font-semibold tracking-[-0.02em] text-ink">
                                Criar duelo
                            </h2>
                            <p className="text-muted">
                                Gera um código de 6 dígitos e um link para mandar ao oponente.
                            </p>
                            <button
                                type="button"
                                disabled={!connected}
                                aria-describedby={connHint}
                                onClick={handleCreate}
                                className={`${btnPrimary} mt-auto w-full`}
                            >
                                Criar sala
                            </button>
                        </div>
                    </section>

                    <form
                        className={bezelOuter}
                        aria-labelledby="duel-join-title"
                        onSubmit={e => {
                            e.preventDefault();
                            handleJoin();
                        }}
                    >
                        <div className={`${bezelInner} flex h-full flex-col gap-4 p-6 sm:p-8`}>
                            <h2 id="duel-join-title" className="text-xl font-semibold tracking-[-0.02em] text-ink">
                                Entrar em duelo
                            </h2>
                            <label htmlFor="room-code" className="sr-only">
                                Código da sala
                            </label>
                            <input
                                id="room-code"
                                name="room-code"
                                type="text"
                                spellCheck={false}
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                value={inputCode}
                                onChange={e =>
                                    setInputCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                                }
                                placeholder="000000"
                                className="h-14 w-full rounded-2xl bg-core px-4 text-center font-mono text-2xl tracking-[0.4em] text-ink ring-1 ring-line outline-none transition duration-200 ease-brass placeholder:text-untyped focus:ring-accent/60"
                            />
                            <button
                                ref={joinRef}
                                type="submit"
                                disabled={!connected || inputCode.length !== 6}
                                aria-describedby={connHint}
                                className={`${btnSecondary} mt-auto w-full`}
                            >
                                Entrar na sala
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    if (phase === 'waiting') {
        const inviteUrl = `${window.location.origin}/duel?code=${code}`;
        return (
            <div className="mx-auto max-w-[1040px] px-4 py-8 sm:py-12">
                {liveRegion}
                <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                    <button type="button" onClick={resetToLobby} className={`${btnGhost} -ml-3`}>
                        ← Sair da sala
                        <Kbd>Esc</Kbd>
                    </button>
                    <ConnectionBadge status={status} />
                </div>

                {errorBox}

                <section className={`${bezelOuter} mx-auto max-w-[680px] text-center`} aria-labelledby="duel-wait-title">
                    <div className={`${bezelInner} px-5 py-8 sm:px-10 sm:py-10`}>
                        <p className="text-[13px] font-semibold text-accent">Sala criada</p>
                        <h1
                            id="duel-wait-title"
                            className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-[32px]"
                        >
                            Chame alguém para correr
                        </h1>

                        <div
                            role="group"
                            aria-label={`Código da sala ${code.split('').join(' ')}`}
                            className="mt-8 flex justify-center gap-2 sm:gap-3"
                        >
                            {code.split('').map((digit, i) => (
                                <span
                                    key={i}
                                    aria-hidden="true"
                                    className="grid h-[60px] w-11 place-items-center rounded-[14px] bg-surface-2 font-mono text-[28px] text-accent ring-1 ring-line sm:h-[88px] sm:w-[72px] sm:text-[44px]"
                                >
                                    {digit}
                                </span>
                            ))}
                        </div>

                        <div className="mt-8 flex items-center gap-3 rounded-full bg-surface-2 p-1.5 pl-5 ring-1 ring-line">
                            <span className="min-w-0 flex-1 truncate text-left font-mono text-[15px] text-muted">
                                {inviteUrl}
                            </span>
                            <CopyButton
                                variant="primary"
                                value={inviteUrl}
                                label="Copiar link"
                                copiedLabel="Link copiado"
                                className="shrink-0"
                            />
                        </div>
                        <p className="mt-4 text-[13px] text-muted">ou só o código</p>
                        <div className="mt-2 flex justify-center">
                            <CopyButton value={code} />
                        </div>

                        <div className="mt-8 border-t border-line pt-6 text-left">
                            <div className="flex items-center justify-between">
                                <h2 className="text-[13px] font-semibold text-ink">Jogadores</h2>
                                <span className="font-mono text-sm text-muted tabular-nums">
                                    {opponent ? '2/2' : '1/2'}
                                </span>
                            </div>
                            <ul className="mt-4 space-y-3">
                                <li className="flex items-center gap-3">
                                    <span
                                        aria-hidden="true"
                                        className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent/15 text-xs font-semibold text-accent"
                                    >
                                        {initialOf(playerName)}
                                    </span>
                                    <span className="min-w-0 truncate font-semibold text-ink">{playerName}</span>
                                    <span className="text-xs font-semibold text-accent">você</span>
                                    <span className="ml-auto flex items-center gap-2 text-sm text-ok">
                                        <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
                                        pronto
                                    </span>
                                </li>
                                <li className="flex items-center gap-3">
                                    {opponent ? (
                                        <>
                                            <span
                                                aria-hidden="true"
                                                className="grid size-8 shrink-0 place-items-center rounded-lg bg-rival/15 text-xs font-semibold text-rival"
                                            >
                                                {initialOf(opponent.playerName)}
                                            </span>
                                            <span className="min-w-0 truncate font-semibold text-ink">
                                                {opponent.playerName}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span
                                                aria-hidden="true"
                                                className="size-8 shrink-0 rounded-lg border border-dashed border-line"
                                            />
                                            <span className="text-untyped">Aguardando oponente…</span>
                                            <span aria-hidden="true" className="ml-auto flex gap-1.5">
                                                {[0, 1, 2].map(i => (
                                                    <span
                                                        key={i}
                                                        className="size-1.5 rounded-full bg-untyped motion-safe:animate-pulse"
                                                        style={{ animationDelay: `${i * 200}ms` }}
                                                    />
                                                ))}
                                            </span>
                                        </>
                                    )}
                                </li>
                            </ul>
                        </div>

                        <p className="mt-8 text-[13px] text-muted">
                            A partida começa sozinha quando o oponente entrar: contagem de 3 s.
                        </p>
                    </div>
                </section>
            </div>
        );
    }

    if (phase === 'countdown') {
        return (
            <div className="mx-auto max-w-[1040px] px-4 py-8 sm:py-12">
                {liveRegion}
                <h1 className="sr-only">Duelo: contagem regressiva</h1>
                {errorBox}
                <p className="mb-4 text-center text-sm text-muted">
                    Vs. {opponent?.playerName ?? 'oponente'}
                </p>
                <Countdown value={countdown} />
                {/* DUEL-07: texto visível com caret na 1ª letra e entrada desabilitada. */}
                <div className="mt-8">
                    <TypingArea target={text} typed="" onChange={() => {}} disabled />
                </div>
            </div>
        );
    }

    if (phase === 'finished' && ranking) {
        return (
            <div className="mx-auto max-w-[1040px] px-4 py-8 sm:py-12">
                {liveRegion}
                <h1 className="sr-only">Resultado do duelo</h1>
                {errorBox}
                <DuelResult
                    ranking={ranking}
                    me={playerName}
                    code={code}
                    onPlayAgain={resetToLobby}
                    onLeave={() => navigate('/')}
                    primaryRef={primaryRef}
                />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1040px] px-4 py-6 sm:py-8">
            {liveRegion}
            <h1 className="sr-only">Duelo em andamento</h1>
            <RaceTrack
                lanes={[
                    { name: playerName, tag: 'você', progress: typing.progress, tone: 'accent' },
                    {
                        name: opponent?.playerName ?? 'Oponente',
                        tag: 'oponente',
                        progress: opponent?.progress ?? 0,
                        tone: 'rival',
                    },
                ]}
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-[13px] text-muted">Sala {code}</span>
                <ConnectionBadge status={status} />
            </div>

            {/* CONN-04 */}
            {status !== 'connected' && (
                <div
                    role="status"
                    className={`mt-4 rounded-2xl p-4 ring-1 ${
                        status === 'offline' ? 'bg-error/8 ring-error/30' : 'bg-accent/8 ring-accent/30'
                    }`}
                >
                    <p className={`font-semibold ${status === 'offline' ? 'text-error' : 'text-accent'}`}>
                        {STATUS_TEXT[status]}
                    </p>
                    <p className="mt-1 text-sm text-muted">Seu progresso continua salvo localmente.</p>
                </div>
            )}

            <div className="mt-4 mb-6">
                <RaceStats remainingSec={remainingSec} wpm={wpm} accuracy={typing.accuracy} />
            </div>

            {errorBox}

            {/* DUEL-01: o texto aparece uma vez só. */}
            <TypingArea
                target={text}
                typed={typing.typed}
                onChange={typing.setTyped}
                disabled={phase !== 'running'}
            />
        </div>
    );
}
