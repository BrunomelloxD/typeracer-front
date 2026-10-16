import { Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { SoloPage } from './pages/SoloPage';
import { DuelPage } from './pages/DuelPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
    return (
        <div className="min-h-dvh bg-bg text-ink">
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:inline-flex focus:min-h-11 focus:items-center focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-on-accent"
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
