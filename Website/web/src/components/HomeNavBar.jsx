import React from 'react';
import { Link } from 'react-router-dom';

import './Components.css'; 
import templogo from '../assets/images/templogo.png';

const HomeNavBar = () => {
  return (
    <nav className = 'home_nav'>
      <div className = 'home_nav_logo'>
        <h1> SeeThru </h1>
        <img className = 'home_logo'
          alt = 'logo'
          src = {templogo}
        />
      </div>
      <div className = 'home_nav_links'>
        <Link to = '/register' className = "home_nav_button"> Register </Link>
        <Link to = '/login' className = "home_nav_button"> Login </Link>
      </div>
    </nav>
  );
};

export default HomeNavBar;