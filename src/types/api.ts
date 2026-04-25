export type GameMode = 'SOLO' | 'DUEL';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface TextResponse {
    id: string;
    content: string;
    difficulty: Difficulty;
    language: string;
}

export interface CreateScorePayload {
    mode: GameMode;
    playerName: string;
    wpm: number;
    accuracy: number;
    durationMs: number;
    textId?: string;
    roomId?: string;
}

export interface ScoreResponse {
    id: string;
    mode: GameMode;
    playerName: string;
    wpm: number;
    accuracy: number;
    durationMs: number;
    textId: string | null;
    roomId: string | null;
    createdAt: string;
}

export interface RoomResponse {
    id: string;
    code: string;
    status: string;
}

export interface RankingEntry {
    position: number;
    playerName: string;
    wpm: number;
    accuracy: number;
    durationMs: number;
}
