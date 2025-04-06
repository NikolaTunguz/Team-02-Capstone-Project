import { useEffect } from 'react';
import useSound from 'use-sound';

const NotificationListener = () => {
  const [play] = useSound('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg', {
    volume: 0.5,
  });

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:8080/subscribe');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('🔔 New notification:', data);
      play();
    };

    return () => {
      eventSource.close();
    };
  }, [play]);

  return null;
};

export default NotificationListener;
