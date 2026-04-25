/**
 * Devolve uma string curta de tempo relativo: "agora", "há 3 min", "há 2 h", "ontem", etc.
 * Usa Intl.RelativeTimeFormat quando disponível.
 */
export function timeAgo(iso: string, now: number = Date.now()): string {
    const ts = new Date(iso).getTime();
    if (Number.isNaN(ts)) return '';
    const diffSec = Math.round((ts - now) / 1000);
    const abs = Math.abs(diffSec);

    const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
    if (abs < 45) return rtf.format(diffSec, 'second');
    if (abs < 60 * 45) return rtf.format(Math.round(diffSec / 60), 'minute');
    if (abs < 60 * 60 * 22) return rtf.format(Math.round(diffSec / 3600), 'hour');
    if (abs < 60 * 60 * 24 * 6) return rtf.format(Math.round(diffSec / 86400), 'day');
    return new Date(ts).toLocaleDateString('pt-BR');
}
