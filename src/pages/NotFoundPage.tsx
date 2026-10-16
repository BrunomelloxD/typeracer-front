import { Link } from 'react-router-dom';
import { btnPrimary } from '../lib/ui';

export function NotFoundPage() {
    return (
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-20 text-center sm:py-28">
            <p className="font-mono text-7xl text-accent tabular-nums">404</p>
            <h1 className="text-3xl font-semibold tracking-[-0.02em] text-ink">Página não encontrada</h1>
            <p className="max-w-[44ch] text-muted">
                O endereço acessado não existe ou foi movido. Volte para o início e
                escolha um modo de jogo.
            </p>
            <Link to="/" className={btnPrimary}>
                Voltar ao início
            </Link>
        </div>
    );
}
