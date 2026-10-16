import type { ReactNode } from 'react';

interface KbdProps {
    children: ReactNode;
    onAccent?: boolean;
}

export function Kbd({ children, onAccent = false }: KbdProps) {
    const tone = onAccent
        ? 'bg-on-accent/15 text-on-accent'
        : 'bg-surface-2 text-muted ring-1 ring-line shadow-[inset_0_-2px_0_var(--color-line)]';
    return (
        <kbd className={`rounded-md px-1.5 py-1 font-mono text-[11px] leading-none ${tone}`}>
            {children}
        </kbd>
    );
}
