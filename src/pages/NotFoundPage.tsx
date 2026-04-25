import { Link } from 'react-router-dom';

export function NotFoundPage() {
    return (
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-16 text-center sm:py-24">
            <p className="font-mono-typing text-6xl font-bold text-emerald-400">404</p>
            <h1 className="text-2xl font-semibold text-zinc-100">Página não encontrada</h1>
            <p className="text-zinc-400">
                O endereço acessado não existe ou foi movido. Volte para o início e
                escolha um modo de jogo.
            </p>
            <Link
                to="/"
                className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-emerald-500 px-5 font-medium text-zinc-950 transition hover:bg-emerald-400"
            >
                Voltar ao início
            </Link>
        </div>
    );
}
