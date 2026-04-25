import { Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { SoloPage } from './pages/SoloPage';
import { DuelPage } from './pages/DuelPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-emerald-500 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-zinc-950"
            >
                Pular para o conteúdo
            </a>
            <Header />
            <main id="main">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/solo" element={<SoloPage />} />
                    <Route path="/duel" element={<DuelPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>
        </div>
    );
}
