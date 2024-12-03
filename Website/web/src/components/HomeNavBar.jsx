import React from 'react';
import { Link } from 'react-router-dom';

import './Components.css'; 
import templogo from '../assets/images/templogo.png';

import { useAuth } from '../context/AuthContext'

const HomeNavBar = () => {
  const { isLoggedIn } = useAuth()

  return (
    <nav className = 'home_nav'>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <h1>SeeThru</h1>
        <img alt="logo" src={templogo} style={{ width: "55px" }} />
      </div>
      {!isLoggedIn && (<div className = 'home_nav_links'>
        <Link to = '/register' className = "home_nav_button"> Register </Link>
        <Link to = '/login' className = "home_nav_button"> Login </Link>
      </div>)}
      {isLoggedIn && (<div className = 'home_nav_links'>
        <Link to = '/dashboard' className = "home_nav_button"> Back </Link>
      </div>)}
    </nav>
  );
};

export default HomeNavBar;