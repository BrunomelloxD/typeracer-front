import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { getGameSocket } from '../lib/socket';

export function useSocket(): { socket: Socket; connected: boolean } {
    const socket = getGameSocket();
    const [connected, setConnected] = useState<boolean>(() => socket.connected);

    useEffect(() => {
        const sync = () => setConnected(socket.connected);
        sync();

        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        if (!socket.connected) socket.connect();

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, [socket]);

    return { socket, connected };
}

/** Calcula WPM padrão: (caracteres corretos / 5) / (minutos decorridos). */
export function calculateWpm(correctChars: number, elapsedMs: number): number {
    if (elapsedMs <= 0) return 0;
    const minutes = elapsedMs / 60_000;
    return Math.round((correctChars / 5) / minutes);
}
