import './App.css'
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './pages/dashboard/index';
import Notifications from './pages/notifications/index'; 
import Login from './pages/Login';
import NavBar from './components/NavBar.jsx'
import Account from './pages/account/index'

function App() {
  // set to true until login is fully implemented
  const [authorized, setAuthorized] = React.useState(true);
  return (
    <Router>
        {authorized && <NavBar/>}
        <Routes>
        <Route 
          path="/dashboard" 
          element={authorized ? <Dashboard/> : <Navigate to="/"/>} 
        />
        <Route 
          path="/notifications" 
          element={authorized ? <Notifications/> : <Navigate to="/"/>} 
        />
        <Route 
          path="/account" 
          element={authorized ? <Account/> : <Navigate to="/"/>} 
        />
        <Route 
          path="/" 
          element={!authorized && <Login/>} 
        />
      </Routes>
    </Router>
  );
}

export default App;