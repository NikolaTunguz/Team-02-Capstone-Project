import React from 'react';
import { useAuth } from './context/AuthContext';
import Router from './Router';
import NavBar from './components/NavBar';
import NotificationListener from './components/NotificationListener';

const App = () => {
  const { isLoggedIn } = useAuth();

  return (
    <>
      {isLoggedIn && <NotificationListener />}
      {isLoggedIn && <NavBar />}
      <Router />
    </>
  );
};

export default App;
