export interface Lane {
    name: string;
    tag?: string;
    progress: number;
    tone: 'accent' | 'rival';
}

interface RaceTrackProps {
    lanes: Lane[];
}

// Classes literais por tom para o Tailwind enxergá-las.
const TONE = {
    accent: {
        text: 'text-accent',
        fill: 'bg-accent',
        avatar: 'bg-accent/15 text-accent',
    },
    rival: {
        text: 'text-rival',
        fill: 'bg-rival',
        avatar: 'bg-rival/15 text-rival',
    },
} as const;

function clamp(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.min(100, Math.max(0, value));
}

export function RaceTrack({ lanes }: RaceTrackProps) {
    return (
        <div className="space-y-5 rounded-[20px] bg-surface p-5 ring-1 ring-white/6 sm:p-7">
            {lanes.map((lane, i) => {
                const p = clamp(lane.progress);
                const rounded = Math.round(p);
                const tone = TONE[lane.tone];
                return (
                    <div
                        key={`${lane.name}-${i}`}
                        className="grid grid-cols-[minmax(0,6.5rem)_1fr_auto] items-center gap-4 sm:grid-cols-[10rem_1fr_auto] sm:gap-6"
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            <span
                                aria-hidden="true"
                                className={`grid size-7 shrink-0 place-items-center rounded-lg text-xs font-semibold ${tone.avatar}`}
                            >
                                {lane.name.trim().charAt(0).toUpperCase() || '?'}
                            </span>
                            <span className="min-w-0 leading-tight">
                                <span className={`block truncate text-sm font-semibold ${tone.text}`}>
                                    {lane.name}
                                </span>
                                {lane.tag && (
                                    <span className="block truncate text-xs text-muted">{lane.tag}</span>
                                )}
                            </span>
                        </div>
                        <div
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={rounded}
                            aria-label={`Progresso de ${lane.name}`}
                            className="relative h-1 rounded-full bg-line"
                        >
                            <span
                                aria-hidden="true"
                                className="pointer-events-none absolute -inset-y-3 right-0 border-r border-dashed border-muted/50"
                            />
                            <span
                                aria-hidden="true"
                                className={`absolute inset-y-0 left-0 w-full origin-left rounded-full transition-transform duration-200 ease-brass ${tone.fill}`}
                                style={{ transform: `scaleX(${p / 100})` }}
                            />
                            <span
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 transition-transform duration-200 ease-brass"
                                style={{ transform: `translateX(calc(${p}% - 12px))` }}
                            >
                                <span
                                    className={`absolute top-1/2 left-0 grid h-[18px] w-6 -translate-y-1/2 place-items-center rounded-full ${tone.fill}`}
                                >
                                    <span className="h-0.5 w-2 rounded-full bg-bg/50" />
                                </span>
                            </span>
                        </div>
                        <span className="w-12 text-right font-mono text-sm text-ink tabular-nums">
                            {rounded}%
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
