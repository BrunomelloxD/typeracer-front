import { memo, useEffect, useMemo, useRef, useState } from 'react';

interface TypingAreaProps {
    target: string;
    typed: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    autoFocus?: boolean;
}

function TypingAreaInner({
    target,
    typed,
    onChange,
    disabled = false,
    autoFocus = true,
}: TypingAreaProps) {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [shouldShake, setShouldShake] = useState(false);
    const lastLenRef = useRef(0);

    useEffect(() => {
        if (autoFocus && !disabled) inputRef.current?.focus();
    }, [autoFocus, disabled]);

    // Shake quando o usuário acabou de digitar um caractere errado
    useEffect(() => {
        if (typed.length > lastLenRef.current) {
            const idx = typed.length - 1;
            if (typed[idx] !== target[idx]) {
                setShouldShake(true);
                const t = window.setTimeout(() => setShouldShake(false), 260);
                lastLenRef.current = typed.length;
                return () => window.clearTimeout(t);
            }
        }
        lastLenRef.current = typed.length;
    }, [typed, target]);

    const chars = useMemo(() => target.split(''), [target]);

    return (
        <div
            className={`relative cursor-text rounded-xl border bg-zinc-900/60 p-4 transition-colors sm:p-6 ${
                shouldShake
                    ? 'border-rose-500/60 animate-shake'
                    : disabled
                      ? 'border-zinc-800'
                      : 'border-zinc-800 focus-within:border-emerald-500/60'
            }`}
            onClick={() => inputRef.current?.focus()}
        >
            <p className="font-mono-typing text-lg leading-relaxed select-none break-words sm:text-2xl">
                {chars.map((char, idx) => {
                    let cls = 'text-zinc-500';
                    if (idx < typed.length) {
                        cls =
                            typed[idx] === char
                                ? 'text-emerald-400'
                                : 'text-rose-400 underline decoration-rose-500/60';
                    } else if (idx === typed.length) {
                        cls = 'text-zinc-100 typing-cursor';
                    }
                    return (
                        <span key={idx} className={cls}>
                            {char === ' ' && idx === typed.length ? '\u00A0' : char}
                        </span>
                    );
                })}
            </p>
            <textarea
                ref={inputRef}
                value={typed}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                className="absolute inset-0 h-full w-full resize-none opacity-0"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label="Área de digitação"
            />
        </div>
    );
}

export const TypingArea = memo(TypingAreaInner);

