import React from 'react';
import '../App.css';
import Expandable from './Expandable.jsx';
import httpClient from '../pages/httpClient';
import { Button, Box, Tooltip } from "@mui/material";
import { Close } from "@mui/icons-material";
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import MarkAsUnreadIcon from '@mui/icons-material/MarkAsUnread';
import { useNavigate } from 'react-router-dom';

const NotificationDeck = () => {
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const[notificationSnapshots, setNotificationSnapshots] = React.useState([]);
  const [viewingReadNotifications, setViewingReadNotifications] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchNotifications = async () => {
      const response = 
        viewingReadNotifications ?
          await httpClient.get('http://localhost:8080/read-notifications') :
          await httpClient.get('http://localhost:8080/notifications');
          
      setNotifications(response.data);
      setLoading(false);
  
      response.data.forEach((notif, index) => {
        fetchSnapshot(notif.device_id, notif.timestamp, index);
      });
    };
    fetchNotifications();
  }, [viewingReadNotifications]);
  
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
  
  const handleMarkAllRead = async () =>
  {
    await httpClient.post("http://localhost:8080/mark_all_read");
    setNotifications([]);
  };

  
  const handleDeleteAllRead = async () =>
  {
      await httpClient.post("http://localhost:8080/delete_all_read");
      setNotifications([]);
  };

  const changeNotifType = () =>
  {
    setViewingReadNotifications(!viewingReadNotifications);
  }

  const createExpandables = () => {
    if (notifications.length > 0) {
      return notifications.map((notification, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            flexDirection: 'row', 
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '20px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: 'white',
            position: 'relative',
          }}
        >
          <Expandable
            style={{ flex: 1, }}
            preview={notification['message']}
            content={
              <>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '10px',
                  }}
                >
                  {notificationSnapshots[index] && (
                    <img
                      src={notificationSnapshots[index]}
                      alt="snapshot"
                      style={{ width: '500px', borderRadius: '3px', marginLeft: '100px' }}
                    />
                  )}
                  <Box
                    sx={{
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      marginTop: '8px',
                      marginLeft: '100px'
                    }}
                  >
                    {notification['timestamp']}
                  </Box>
                </div>
            </>
          }
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop:'10px'
          }}
        >
          {viewingReadNotifications ?
            <Tooltip title="Mark As Unread">
              <Button onClick={() => handleMarkUnread(index)}>
                <MarkAsUnreadIcon sx={{ color: 'grey' }} />
              </Button>
            </Tooltip> 
          : <Tooltip title="Mark As Read">
            <Button onClick={() => handleMarkRead(index)}>
              <MarkEmailReadIcon sx={{ color: 'grey' }} />
            </Button>
          </Tooltip> 
          }

          <Tooltip title="Delete">
            <Button onClick={() => handleDelete(index)}>
              <Close sx={{ fontSize: 28, color: 'grey' }} />
            </Button>
          </Tooltip>
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

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} marginRight="40px">
        <h2>Notifications Feed</h2>

        <div style={{ display: 'flex', 
          gap: '10px', marginBottom: '15px', marginTop: '15px' }}>
          
          {viewingReadNotifications ? (
              <Button 
              variant="contained"
              color="error"
              onClick={handleDeleteAllRead}
              >
                Delete All
              </Button>
          ) : (
          <Button
          variant="contained"
          color="primary"
          onClick={handleMarkAllRead}
          >
            Mark All Read
          </Button>
          )}

          <Button
          variant="contained"
          color="primary"
          onClick={changeNotifType}
          >
            {viewingReadNotifications ? "View Unread Notifications" : "View Read Notifications"}
          </Button>
        </div>
      </Box>

      {createExpandables()}
    </div>
  );
};

export default NotificationDeck;
