import React from 'react';
import { useAuth } from './context/AuthContext';
import Router from './Router';
import NavBar from './components/NavBar';

const App = () => {
  const { isLoggedIn } = useAuth();

  return (
    <>
      {isLoggedIn && <NavBar />}
      <Router />
    </>
  );
};

export default App;
