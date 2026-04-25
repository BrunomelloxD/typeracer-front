type Tone = 'default' | 'warning' | 'danger' | 'success';

interface StatPillProps {
    label: string;
    value: string | number;
    suffix?: string;
    tone?: Tone;
    live?: boolean;
}

const TONE_CLASSES: Record<Tone, string> = {
    default: 'border-zinc-800 bg-zinc-900/60 text-zinc-100',
    success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    danger: 'border-rose-500/50 bg-rose-500/10 text-rose-300',
};

export function StatPill({ label, value, suffix, tone = 'default', live = false }: StatPillProps) {
    return (
        <div className={`rounded-lg border px-4 py-3 text-center transition-colors ${TONE_CLASSES[tone]}`}>
            <div className="text-xs uppercase tracking-wider text-zinc-500">{label}</div>
            <div
                className="mt-1 text-2xl font-semibold tabular-nums"
                aria-live={live ? 'polite' : undefined}
            >
                {value}
                {suffix && <span className="ml-1 text-sm opacity-70">{suffix}</span>}
            </div>
        </div>
    );
}
