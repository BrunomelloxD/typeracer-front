import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';

export type ConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'offline';

/**
 * Observa o socket, o Manager (`socket.io`) e a janela para derivar o estado da conexão.
 * Não muda o socket; todo setState acontece em callbacks de evento.
 */
export function useConnectionStatus(socket: Socket): ConnectionStatus {
    const [online, setOnline] = useState(() => navigator.onLine);
    const [connected, setConnected] = useState(() => socket.connected);
    const [everConnected, setEverConnected] = useState(() => socket.connected);

    useEffect(() => {
        const onConnect = () => {
            setConnected(true);
            setEverConnected(true);
        };
        const onDisconnect = () => setConnected(false);
        const onReconnectAttempt = () => setConnected(false);
        const onOnline = () => setOnline(true);
        const onOffline = () => setOnline(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.io.on('reconnect_attempt', onReconnectAttempt);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.io.off('reconnect_attempt', onReconnectAttempt);
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, [socket]);

    if (!online) return 'offline';
    if (connected) return 'connected';
    if (everConnected) return 'reconnecting';
    return 'connecting';
}
