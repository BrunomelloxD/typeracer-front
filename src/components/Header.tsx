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
                className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition duration-200 ease-brass ${
                    active ? 'bg-surface-2 text-ink ring-1 ring-line' : 'text-muted hover:text-ink'
                }`}
            >
                {label}
            </Link>
        );
    };

    return (
        <header className="race-dim sticky top-0 z-30 border-b border-white/6 bg-bg/85 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-4 sm:h-16">
                <Link
                    to="/"
                    className="inline-flex min-h-11 items-center font-mono text-lg text-accent"
                    aria-label="TypeRace - ir para o início"
                >
                    type<span className="text-ink">race</span>
                </Link>
                <div className="flex items-center gap-2 sm:gap-3">
                    <nav className="flex items-center gap-1" aria-label="Modos de jogo">
                        {navLink('/solo', 'Solo')}
                        {navLink('/duel', 'Duelo')}
                    </nav>
                    {playerName && (
                        <>
                            <span className="h-5 w-px bg-line" aria-hidden="true" />
                            <span className="flex items-center gap-2">
                                <span
                                    className="grid size-7 place-items-center rounded-lg bg-accent/15 text-sm font-bold text-accent"
                                    aria-hidden="true"
                                >
                                    {playerName.charAt(0).toUpperCase()}
                                </span>
                                <span className="hidden text-sm font-semibold text-ink sm:inline">
                                    <span className="sr-only">Jogando como </span>
                                    {playerName}
                                </span>
                            </span>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
