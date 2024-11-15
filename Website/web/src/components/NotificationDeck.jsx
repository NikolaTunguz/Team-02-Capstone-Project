import React from 'react';
import '../App.css';
import Expandable from './Expandable.jsx'
import httpClient from '../pages/httpClient';

const NotificationDeck = () => {

  // const [notifications, setNotifications] = React.useState();

  // React.useEffect(() => {
  //   const fetchNotifications = async () => {
  //       const response = await httpClient.get('http://localhost:8080/notifications');
  //   };
  //   fetchNotifications();
  // }, []);

  return (
    <div>
      NotificationDeck:
      <Expandable preview='preview' content='content'/>
    </div>
  );
};

export default NotificationDeck;
