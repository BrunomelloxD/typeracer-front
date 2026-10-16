import { useEffect } from 'react';

/** MET-06: marca `body[data-race="running"]` enquanto a corrida está ativa (usado por `.race-dim`). */
export function useRaceFocusMode(active: boolean): void {
    useEffect(() => {
        if (!active) return;
        document.body.dataset.race = 'running';
        return () => {
            delete document.body.dataset.race;
        };
    }, [active]);
}
