interface ProgressBarProps {
    progress: number;
    label?: string;
    color?: 'emerald' | 'sky';
}

export function ProgressBar({ progress, label, color = 'emerald' }: ProgressBarProps) {
    const pct = Math.max(0, Math.min(100, progress));
    const fill = color === 'emerald' ? 'bg-emerald-500' : 'bg-sky-500';
    return (
        <div className="space-y-1">
            {label && (
                <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>{label}</span>
                    <span className="tabular-nums">{pct.toFixed(0)}%</span>
                </div>
            )}
            <div
                className="h-2 w-full overflow-hidden rounded-full bg-zinc-800"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(pct)}
                aria-label={label ?? 'Progresso'}
            >
                <div
                    className={`h-full ${fill} transition-all duration-150 ease-out`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
