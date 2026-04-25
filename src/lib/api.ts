import type {
    CreateScorePayload,
    Difficulty,
    RoomResponse,
    ScoreResponse,
    TextResponse,
} from '../types/api';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
        ...init,
    });
    if (!res.ok) {
        let message = `HTTP ${res.status}`;
        try {
            const body = (await res.json()) as { message?: string | string[] };
            if (body?.message) {
                message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
            }
        } catch {
            // ignore parse errors
        }
        throw new Error(message);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
}

export const api = {
    getRandomText: (difficulty?: Difficulty, language = 'pt-br') => {
        const params = new URLSearchParams();
        if (difficulty) params.set('difficulty', difficulty);
        if (language) params.set('language', language);
        return request<TextResponse>(`/api/texts/random?${params.toString()}`);
    },

    submitScore: (payload: CreateScorePayload) =>
        request<ScoreResponse>('/api/scores', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    listRecentScores: (limit = 10) =>
        request<ScoreResponse[]>(`/api/scores?limit=${limit}`),

    createRoom: (difficulty?: Difficulty, language = 'pt-br') =>
        request<RoomResponse>('/api/rooms', {
            method: 'POST',
            body: JSON.stringify({ difficulty, language }),
        }),

    getRoom: (code: string) => request<RoomResponse>(`/api/rooms/${code}`),
};
