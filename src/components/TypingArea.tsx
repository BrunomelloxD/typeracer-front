import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { bezelInner, bezelOuter } from '../lib/ui';

interface TypingAreaProps {
    target: string;
    typed: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    autoFocus?: boolean;
    inputId?: string;
}

const TYPING_IDLE_MS = 500;

function isEditableTarget(el: Element | null): boolean {
    return !!el?.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]');
}

function TypingAreaInner({
    target,
    typed,
    onChange,
    disabled = false,
    autoFocus = true,
    inputId,
}: TypingAreaProps) {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const caretRef = useRef<HTMLSpanElement>(null);
    const typingTimeoutRef = useRef<number | undefined>(undefined);
    const [isTyping, setIsTyping] = useState(false);
    const [focused, setFocused] = useState(false);

    const chars = useMemo(() => target.split(''), [target]);

    // TYPE-05: autofoco ao montar habilitado (só chama focus, sem setState).
    useEffect(() => {
        if (autoFocus && !disabled) inputRef.current?.focus();
    }, [autoFocus, disabled]);

    // TYPE-03: posiciona o caret medindo o próximo caractere; escreve direto no DOM.
    useLayoutEffect(() => {
        const wrapper = textRef.current;
        const caret = caretRef.current;
        if (!wrapper || !caret) return;

        const update = () => {
            const idx = Math.min(typed.length, target.length);
            let x = 0;
            let y = 0;
            let h = 0;
            const next = wrapper.querySelector<HTMLElement>(`[data-i="${idx}"]`);
            if (next) {
                x = next.offsetLeft;
                y = next.offsetTop;
                h = next.offsetHeight;
            } else if (idx > 0) {
                const last = wrapper.querySelector<HTMLElement>(`[data-i="${idx - 1}"]`);
                if (last) {
                    x = last.offsetLeft + last.offsetWidth;
                    y = last.offsetTop;
                    h = last.offsetHeight;
                }
            }
            caret.style.transform = `translate(${x}px, ${y}px)`;
            caret.style.height = `${h || 28}px`;
        };

        update();
        window.addEventListener('resize', update);
        let cancelled = false;
        document.fonts?.ready.then(() => {
            if (!cancelled) update();
        });
        return () => {
            cancelled = true;
            window.removeEventListener('resize', update);
        };
    }, [typed, target]);

    useEffect(() => () => window.clearTimeout(typingTimeoutRef.current), []);

    // TYPE-07: qualquer tecla imprimível foca a área enquanto ela está sem foco.
    useEffect(() => {
        if (focused || disabled) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
            const el = e.target instanceof Element ? e.target : null;
            if (isEditableTarget(el)) return;
            if (e.key === ' ' && el?.closest('button, [role="radio"], a')) return;
            inputRef.current?.focus();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [focused, disabled]);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        // TYPE-04: caret sólido enquanto digita; pisca após 500 ms parado.
        setIsTyping(true);
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = window.setTimeout(() => setIsTyping(false), TYPING_IDLE_MS);
        onChange(e.target.value);
    };

    const showOverlay = !focused && !disabled;
    const caretClass = showOverlay ? 'opacity-0' : !disabled && !isTyping ? 'caret-blink' : '';

    return (
        // O textarea é invisível; o foco aparece no anel da moldura (GLOB-05).
        <div className={`${bezelOuter} transition-shadow duration-200 ease-brass focus-within:ring-accent/50`}>
            <div
                className={`${bezelInner} relative p-5 sm:p-10 ${disabled ? 'cursor-default' : 'cursor-text'}`}
                onClick={() => inputRef.current?.focus()}
            >
                <p className="sr-only">{target}</p>
                <div
                    ref={textRef}
                    className={`relative transition-opacity duration-200 ease-brass ${
                        showOverlay ? 'opacity-25 blur-[1px]' : 'opacity-100'
                    }`}
                >
                    <p
                        aria-hidden="true"
                        className="font-mono text-xl leading-[1.7] break-words whitespace-pre-wrap select-none sm:text-[28px]"
                    >
                        {chars.map((char, idx) => {
                            if (idx >= typed.length) {
                                return (
                                    <span key={idx} data-i={idx} className="text-untyped">
                                        {char}
                                    </span>
                                );
                            }
                            if (typed[idx] === char) {
                                return (
                                    <span key={idx} data-i={idx} className="text-ink">
                                        {char}
                                    </span>
                                );
                            }
                            // TYPE-02: espaço errado ganha sublinhado de 2px.
                            const wrongSpace = char === ' ';
                            return (
                                <span
                                    key={idx}
                                    data-i={idx}
                                    className={`rounded-[3px] bg-error/15 text-error ${
                                        wrongSpace ? 'shadow-[inset_0_-2px_0_var(--color-error)]' : ''
                                    }`}
                                >
                                    {char}
                                </span>
                            );
                        })}
                    </p>
                    <span
                        ref={caretRef}
                        aria-hidden="true"
                        className={`pointer-events-none absolute top-0 left-0 w-[2.5px] rounded-full bg-accent transition-transform duration-[120ms] ease-brass ${caretClass}`}
                    />
                </div>
                {showOverlay && (
                    <div className="pointer-events-none absolute inset-0 grid place-items-center">
                        <span className="rounded-full bg-surface-2 px-5 py-3 text-[15px] font-semibold text-ink ring-1 ring-line">
                            Clique ou pressione qualquer tecla para focar
                        </span>
                    </div>
                )}
                <textarea
                    ref={inputRef}
                    id={inputId}
                    value={typed}
                    onChange={handleChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    disabled={disabled}
                    className={`absolute inset-0 h-full w-full resize-none opacity-0 ${
                        disabled ? 'cursor-default' : 'cursor-text'
                    }`}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    aria-label="Área de digitação"
                />
            </div>
        </div>
    );
}

export const TypingArea = memo(TypingAreaInner);
