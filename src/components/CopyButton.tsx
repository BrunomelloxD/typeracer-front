import { useState } from 'react';

interface CopyButtonProps {
    value: string;
    label?: string;
}

export function CopyButton({ value, label = 'Copiar código' }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch {
            // Fallback silencioso: usuário pode copiar manualmente
        }
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-emerald-500/60 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/10"
            aria-live="polite"
        >
            {copied ? '✓ Copiado!' : label}
        </button>
    );
}
