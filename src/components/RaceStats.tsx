interface RaceStatsProps {
    remainingSec: number;
    wpm: number;
    accuracy: number;
}

// MET-04: sem região viva; os números mudam a cada tecla e não devem ser anunciados.
export function RaceStats({ remainingSec, wpm, accuracy }: RaceStatsProps) {
    const urgent = remainingSec <= 5;
    const accuracyText = accuracy.toLocaleString('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    });

    return (
        <div className="flex items-baseline gap-6 font-mono tabular-nums sm:gap-9">
            <span className="flex items-baseline gap-1">
                <span className="sr-only">Tempo restante:</span>
                <span
                    className={`text-4xl transition-colors duration-200 ease-brass sm:text-5xl ${
                        urgent ? 'text-error' : 'text-accent'
                    }`}
                >
                    {remainingSec}
                </span>
                <span className="font-sans text-sm text-muted">s</span>
            </span>
            <span className="flex items-baseline gap-1.5">
                <span className="sr-only">Velocidade:</span>
                <span className="text-2xl text-ink sm:text-[30px]">{wpm}</span>
                <span className="font-sans text-sm text-muted">wpm</span>
            </span>
            <span className="flex items-baseline gap-1.5">
                <span className="sr-only">Precisão:</span>
                <span className="text-2xl text-ink sm:text-[30px]">{accuracyText}%</span>
                <span className="font-sans text-sm text-muted" aria-hidden="true">
                    precisão
                </span>
            </span>
        </div>
    );
}
