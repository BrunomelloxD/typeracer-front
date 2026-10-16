interface ProgressBarProps {
    progress: number;
    label?: string;
    tone?: 'accent' | 'rival';
}

// Classes literais por tom para o Tailwind enxergá-las.
const FILL = {
    accent: 'bg-accent',
    rival: 'bg-rival',
} as const;

export function ProgressBar({ progress, label, tone = 'accent' }: ProgressBarProps) {
    const pct = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0;
    return (
        <div className="space-y-1">
            {label && (
                <div className="flex items-center justify-between text-xs text-muted">
                    <span>{label}</span>
                    <span className="font-mono tabular-nums">{pct.toFixed(0)}%</span>
                </div>
            )}
            <div
                className="h-[3px] w-full overflow-hidden rounded-full bg-line"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(pct)}
                aria-label={label ?? 'Progresso'}
            >
                <div
                    className={`h-full w-full origin-left rounded-full transition-transform duration-150 ease-brass ${FILL[tone]}`}
                    style={{ transform: `scaleX(${pct / 100})` }}
                />
            </div>
        </div>
    );
}
