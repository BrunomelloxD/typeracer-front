import { io, type Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:3000';

let socket: Socket | null = null;

export function getGameSocket(): Socket {
    if (!socket) {
        socket = io(`${WS_URL}/game`, {
            autoConnect: true,
            transports: ['websocket'],
            withCredentials: true,
        });
    }
    return socket;
}

export function disconnectGameSocket(): void {
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }
}
