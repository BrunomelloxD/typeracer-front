import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlayerState {
    playerName: string;
    setPlayerName: (name: string) => void;
}

export const usePlayerStore = create<PlayerState>()(
    persist(
        set => ({
            playerName: '',
            setPlayerName: name => set({ playerName: name.trim().slice(0, 32) }),
        }),
        { name: 'typerace.player' },
    ),
);

export interface SoloHistoryEntry {
    wpm: number;
    accuracy: number;
    durationMs: number;
    textId: string;
    createdAt: string;
}

interface HistoryState {
    history: SoloHistoryEntry[];
    pushEntry: (entry: SoloHistoryEntry) => void;
    clear: () => void;
}

export const useHistoryStore = create<HistoryState>()(
    persist(
        set => ({
            history: [],
            pushEntry: entry =>
                set(state => ({ history: [entry, ...state.history].slice(0, 20) })),
            clear: () => set({ history: [] }),
        }),
        { name: 'typerace.history' },
    ),
);
