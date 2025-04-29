import { useEffect, useState } from 'react';
import useSound from 'use-sound';
import notificationSound from '../assets/sounds/notification-pluck-off-269290.mp3';

const NotificationListener = () => {
    const [canPlay, setCanPlay] = useState(false);
    const [play] = useSound(notificationSound, {
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
        const eventSource = new EventSource('/api/subscribe');

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
