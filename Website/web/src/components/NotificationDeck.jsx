import React from 'react';
import '../App.css';
import Expandable from './Expandable.jsx'
import httpClient from '../pages/httpClient';
import templogo from '../assets/images/templogo.png';


const NotificationDeck = () => {

  const [notifications, setNotifications] = React.useState();
  const [loading, setLoading] = React.useState(true);

  // Fetches notification data upon initial page load.
  React.useEffect(() => {
    const fetchNotifications = async () => {
        const response = await httpClient.get('http://localhost:8080/notifications');
        setNotifications(response.data);
        setLoading(false)
      };
    fetchNotifications();
  }, []);

  // Maps notification data to expandable elements.
  const createExpandables = () => {
    let elementArray = []
    if(notifications.length > 0){
      for(let i = 0; i < notifications.length; i++){
        elementArray.push(<Expandable key={i} preview='Person detected at camera.' content={notifications[i]} />);
      }
      return elementArray;
    } else {
      return '<div> No data available. </div>';
    }
  }

  if(loading) return <div> Loading... </div>;

  return (
    <div>
      <h2>Notifications Feed</h2>
      {createExpandables()}
    </div>
  );
};

export default NotificationDeck;