import { useEffect, useState } from 'react';
import useSound from 'use-sound';

const NotificationListener = () => {
    const [canPlay, setCanPlay] = useState(false);
    const [play] = useSound('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg', {
        volume: 0.5,
        interrupt: true,
    });

    useEffect(() => {
        const unlockAudio = () => {
            setCanPlay(true);
            window.removeEventListener('click', unlockAudio);
        };

        window.addEventListener('click', unlockAudio);
        return () => window.removeEventListener('click', unlockAudio);
    }, []);

    useEffect(() => {
        if (!canPlay) return;
        const eventSource = new EventSource('http://localhost:8080/subscribe');

        eventSource.onerror = (err) => {
            console.error("SSE error", err);
            eventSource.close();
        };

        eventSource.onmessage = () => {
            play();
        };

        return () => { 
            eventSource.close(); 
        };
    }, [canPlay, play]);

    return null;
};

export default NotificationListener;
