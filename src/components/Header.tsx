import { Link, useLocation } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';

export function Header() {
    const { pathname } = useLocation();
    const playerName = usePlayerStore(s => s.playerName);

    const navLink = (to: string, label: string) => {
        const active = pathname === to;
        return (
            <Link
                to={to}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex min-h-[40px] items-center rounded-md px-3 text-sm transition ${
                    active
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                }`}
            >
                {label}
            </Link>
        );
    };

    return (
        <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
                <Link
                    to="/"
                    className="font-mono-typing text-lg font-semibold text-emerald-400"
                    aria-label="TypeRace - ir para o início"
                >
                    type<span className="text-zinc-100">race</span>
                </Link>
                <nav className="flex items-center gap-1" aria-label="Modos de jogo">
                    {navLink('/solo', 'Solo')}
                    {navLink('/duel', 'Duelo')}
                    {playerName && (
                        <span className="ml-3 hidden text-xs text-zinc-500 sm:inline">
                            jogando como{' '}
                            <span className="text-zinc-300">{playerName}</span>
                        </span>
                    )}
                </nav>
            </div>
        </header>
    );
}
