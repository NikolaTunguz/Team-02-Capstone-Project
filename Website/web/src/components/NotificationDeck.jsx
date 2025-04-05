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
  const[notificationSnapshots, setNotificationSnapshots] = React.useState([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchNotifications = async () => {
      const response = await httpClient.get('http://localhost:8080/notifications');
      setNotifications(response.data);
      setLoading(false);
  
      response.data.forEach((notif, index) => {
        fetchSnapshot(notif.device_id, notif.timestamp, index);
      });
    };
    fetchNotifications();
  }, []);
  
  async function fetchSnapshot(deviceId, timestamp, index) {
    try {
      const response = await httpClient.get(
        `http://localhost:8080/get_notification?device_id=${deviceId}&timestamp=${encodeURIComponent(timestamp)}`,
        {
          responseType: "blob",
          withCredentials: true,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          }
        }
      );
      const blob = response.data;
      const imageURL = URL.createObjectURL(blob);
      
      setNotificationSnapshots((prev) => {
        const updated = [...prev];
        updated[index] = imageURL;
        return updated;
      });
    } catch (error) {
      console.error("Error fetching snapshot:", error);
    }
  }  

  const handleDelete = async (index) => {
    const updatedNotifications = notifications.filter((_, i) => i !== index);
    const data = {
      device_id:notifications[index]['device_id'],
      timestamp:notifications[index]['timestamp']
    };
    await httpClient.post("http://localhost:8080/remove_notification", data)
    setNotifications(updatedNotifications);
  };

  const handleMarkRead = async (index) =>
  {
    const notification = notifications[index];

    await httpClient.post("http://localhost:8080/mark_read",
    {
      device_id: notification.device_id,
      timestamp: notification.timestamp,
    });

    setNotifications(notifications.filter((_, i) => i !== index));
  }
  
  const handleMarkAllRead = async () =>
  {
    await httpClient.post("http://localhost:8080/mark_all_read");
    setNotifications([]);
  };

  const handleViewReadNotifications = () =>
  {
    navigate('/read-notifications')
  }

  const createExpandables = () => {
    if (notifications.length > 0) {
      return notifications.map((notification, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '20px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '8px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Expandable
              style={{ marginLeft: "-3px", flex: 1 }}
              preview={notification['message']}
              content={
                <div>
                  <div>{notification['timestamp']}</div>
                  {notificationSnapshots[index] && (
                    <img
                      src={notificationSnapshots[index]}
                      alt="snapshot"
                      style={{ marginTop: '10px', maxWidth: '100%', borderRadius: '6px' }}
                    />
                  )}
                </div>
              }
            />
            <div>
              <Button onClick={() => handleDelete(index)}>
                <Cancel sx={{ fontSize: 28, color: 'red' }} />
              </Button>
              <Button onClick={() => handleMarkRead(index)}>
                <MarkEmailReadIcon />
              </Button>
            </div>
          </div>
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
