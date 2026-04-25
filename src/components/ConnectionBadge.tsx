interface ConnectionBadgeProps {
    connected: boolean;
}

export function ConnectionBadge({ connected }: ConnectionBadgeProps) {
    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                connected
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
            }`}
            role="status"
            aria-live="polite"
        >
            <span
                className={`inline-block h-2 w-2 rounded-full ${
                    connected ? 'bg-emerald-400' : 'bg-amber-400 motion-safe:animate-pulse'
                }`}
                aria-hidden="true"
            />
            {connected ? 'Conectado' : 'Conectando...'}
        </span>
    );
}
