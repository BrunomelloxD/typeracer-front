import type { ConnectionStatus } from '../hooks/useConnectionStatus';

interface ConnectionBadgeProps {
    status: ConnectionStatus;
}

const STATES: Record<ConnectionStatus, { label: string; tone: string; dot: string }> = {
    connected: { label: 'Conectado', tone: 'text-ok bg-ok/10 ring-ok/30', dot: 'bg-ok' },
    connecting: {
        label: 'Conectando…',
        tone: 'text-muted bg-white/5 ring-line',
        dot: 'bg-muted motion-safe:animate-pulse',
    },
    reconnecting: {
        label: 'Reconectando…',
        tone: 'text-accent bg-accent/10 ring-accent/30',
        dot: 'bg-accent motion-safe:animate-pulse',
    },
    offline: { label: 'Sem conexão', tone: 'text-error bg-error/10 ring-error/30', dot: 'bg-error' },
};

export function ConnectionBadge({ status }: ConnectionBadgeProps) {
    const { label, tone, dot } = STATES[status];
    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[13px] font-semibold ring-1 ${tone}`}
            role="status"
            aria-live="polite"
        >
            <span className={`inline-block size-2 rounded-full ${dot}`} aria-hidden="true" />
            {label}
        </span>
    );
}
