interface CountdownProps {
    value: number; // 0 mostra "GO!"
}

export function Countdown({ value }: CountdownProps) {
    const text = value === 0 ? 'GO!' : String(value);
    return (
        <div
            className="flex h-32 items-center justify-center"
            role="timer"
            aria-live="assertive"
            aria-atomic="true"
        >
            <span
                key={value}
                className="text-7xl font-bold text-emerald-400 tabular-nums motion-safe:animate-pulse"
            >
                {text}
            </span>
        </div>
    );
}
