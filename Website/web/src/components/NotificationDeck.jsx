import React from 'react';
import '../App.css';
import Expandable from './Expandable.jsx';
import httpClient from '../pages/httpClient';
import { Button, } from "@mui/material";
import { Cancel } from "@mui/icons-material";
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { useNavigate } from 'react-router-dom';

const NotificationDeck = () => {
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchNotifications = async () => {
      const response = await httpClient.get('/api/notifications');
      setNotifications(response.data);
      console.log(response.data)
      setLoading(false)
    };
    fetchNotifications();
  }, []);

  const handleDelete = async (index) => {
    const updatedNotifications = notifications.filter((_, i) => i !== index);
    const data = {
      device_id:notifications[index]['device_id'],
      timestamp:notifications[index]['timestamp']
    };
    await httpClient.post("/api/remove_notification", data)
    setNotifications(updatedNotifications);
  };

  const handleMarkRead = async (index) =>
  {
    const notification = notifications[index];

    await httpClient.post("/api/mark_read",
    {
      device_id: notification.device_id,
      timestamp: notification.timestamp,
    });

    setNotifications(notifications.filter((_, i) => i !== index));
  }
  
  const handleMarkAllRead = async () =>
  {
    await httpClient.post("/api/mark_all_read");
    setNotifications([]);
  };

  const handleViewReadNotifications = () =>
  {
    navigate('/read-notifications')
  }

  const createExpandables = () => {
    if (notifications.length > 0) {
      return notifications.map((notification, index) => (
        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <Button 
            onClick={() => handleDelete(index)}
          >
            <Cancel sx={{ fontSize: 28, color: 'red'}} />
          </Button>
          <Button onClick={() => handleMarkRead(index)}>
            <MarkEmailReadIcon/>
          </Button>
          <Expandable style={{marginLeft:"-3px"}} preview={notification['message']} content={notification['timestamp']} />
        </div>
      ));
    } else {
      return 'No data available.';
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Notifications Feed</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <Button
        variant="contained"
        color="primary"
        onClick={handleMarkAllRead}
        >
          Mark All Read
        </Button>

        <Button
        variant="contained"
        color="primary"
        onClick={handleViewReadNotifications}
        >
          View Read Notifications
        </Button>
      </div>

      {createExpandables()}
    </div>
  );
};

export default NotificationDeck;
