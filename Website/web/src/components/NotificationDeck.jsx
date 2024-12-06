// import React from 'react';
// import '../App.css';
// import Expandable from './Expandable.jsx'
// import httpClient from '../pages/httpClient';
// import templogo from '../assets/images/templogo.png';
// import { Button } from "@mui/material";


// const NotificationDeck = () => {

//   const [notifications, setNotifications] = React.useState();
//   const [loading, setLoading] = React.useState(true);

//   // Fetches notification data upon initial page load.
//   React.useEffect(() => {
//     const fetchNotifications = async () => {
//         const response = await httpClient.get('http://localhost:8080/notifications');
//         setNotifications(response.data);
//         console.log(response.data)
//         setLoading(false)
//       };
//     fetchNotifications();
//   }, []);

//   // Maps notification data to expandable elements.
//   const createExpandables = () => {
//     let elementArray = []
//     if(notifications.length > 0){
//       for(let i = 0; i < notifications.length; i++){
//         elementArray.push(<Expandable key={i} preview={notifications[i]['message']} content={notifications[i]['timestamp']} />);
//         // <Button key={i}>
//         //   OnClick={console.log("wasd")}
//         // </Button>
//       }
//       return elementArray;
//     } else {
//       return 'No data available.';
//     }
//   }

//   if(loading) return <div> Loading... </div>;

//   return (
//     <div>
//       <h2>Notifications Feed</h2>
//       {createExpandables()}
//     </div>
//   );
// };

// export default NotificationDeck;

import React from 'react';
import '../App.css';
import Expandable from './Expandable.jsx';
import httpClient from '../pages/httpClient';
import { Button, } from "@mui/material";
import { Cancel } from "@mui/icons-material";

const NotificationDeck = () => {

  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // Fetches notification data upon initial page load.
  React.useEffect(() => {
    const fetchNotifications = async () => {
      const response = await httpClient.get('http://localhost:8080/notifications');
      setNotifications(response.data);
      console.log(response.data)
      setLoading(false)
    };
    fetchNotifications();
  }, []);

  // Deletes a notification from the state
  const handleDelete = async (index) => {
    const updatedNotifications = notifications.filter((_, i) => i !== index);
    const data = {
      device_id:notifications[index]['device_id'],
      timestamp:notifications[index]['timestamp']
    };
    await httpClient.post("http://localhost:8080/remove_notification", data)
    setNotifications(updatedNotifications);
  };

  // Maps notification data to expandable elements with delete buttons.
  const createExpandables = () => {
    if (notifications.length > 0) {
      return notifications.map((notification, index) => (
        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <Button 
            onClick={() => handleDelete(index)}
          >
            <Cancel sx={{ fontSize: 28, color: 'gray'}} />
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
      {createExpandables()}
    </div>
  );
};

export default NotificationDeck;
