import React from 'react';
import '../App.css';
import Expandable from './Expandable.jsx';
import httpClient from '../pages/httpClient';
import { Button, } from "@mui/material";
import { Cancel } from "@mui/icons-material";
import MarkAsUnreadIcon from '@mui/icons-material/MarkAsUnread';
import { useNavigate } from 'react-router-dom';

const ReadNotifications = () => {
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

React.useEffect(() => {
    const fetchNotifications = async () => {
      const response = await httpClient.get('http://localhost:8080/read-notifications');
      setNotifications(response.data);
      console.log(response.data)
      setLoading(false)
    };
    fetchNotifications();
  }, []);

const handleMarkUnread = async (index) =>
{
    const notification = notifications[index];

    await httpClient.post("http://localhost:8080/mark_unread",
    {
        device_id: notification.device_id,
        timestamp: notification.timestamp,
    });

    setNotifications(notifications.filter((_, i) => i !== index));
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

const handleDeleteAllRead = async () =>
{
    await httpClient.post("http://localhost:8080/delete_all_read");
    setNotifications([]);
};

const createExpandables = () => {
    if (notifications.length > 0) {
    return notifications.map((notification, index) => (
        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <Button 
            onClick={() => handleDelete(index)}
        >
            <Cancel sx={{ fontSize: 28, color: 'red'}} />
        </Button>
        <Button onClick={() => handleMarkUnread(index)}>
            <MarkAsUnreadIcon/>
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
      <h2>Read Notifications Feed</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <Button
        variant="contained"
        sx={{backgroundColor: 'red', color: 'white'}}
        onClick={handleDeleteAllRead}
        >
            Delete All Read
        </Button>

        <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/notifications')}
        >
          View Unread Notifications
        </Button>
      </div>

      {createExpandables()}
    </div>
  );
};

export default ReadNotifications;