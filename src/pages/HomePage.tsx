import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';

export function HomePage() {
    const navigate = useNavigate();
    const playerName = usePlayerStore(s => s.playerName);
    const setPlayerName = usePlayerStore(s => s.setPlayerName);
    const [name, setName] = useState(playerName);

    const trimmed = name.trim();
    const canSubmit = trimmed.length > 0;

    const goTo = (mode: 'solo' | 'duel') => {
        if (!canSubmit) return;
        setPlayerName(trimmed);
        navigate(`/${mode}`);
    };

    return (
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-4 py-12 sm:py-16">
            <div className="text-center">
                <h1 className="font-mono-typing text-4xl font-bold text-emerald-400 sm:text-5xl">
                    TypeRace
                </h1>
                <p className="mt-3 text-zinc-400">
                    Desafio de digitação com modo solo e duelo em tempo real.
                </p>
            </div>

            <form
                className="w-full space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6"
                onSubmit={e => {
                    e.preventDefault();
                    goTo('solo');
                }}
            >
                <label className="block text-sm text-zinc-400" htmlFor="name">
                    Seu nome
                </label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Digite seu nome..."
                    maxLength={32}
                    autoFocus
                    aria-describedby="name-hint"
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none transition focus:border-emerald-500"
                />
                <p id="name-hint" className="text-xs text-zinc-500">
                    Usado para identificar você no ranking.
                </p>
                <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="min-h-[44px] rounded-md bg-emerald-500 px-4 font-medium text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Modo Solo
                    </button>
                    <button
                        type="button"
                        onClick={() => goTo('duel')}
                        disabled={!canSubmit}
                        className="min-h-[44px] rounded-md border border-sky-500 px-4 font-medium text-sky-300 transition hover:bg-sky-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Modo Duelo
                    </button>
                </div>
            </form>
        </div>
    );
}
