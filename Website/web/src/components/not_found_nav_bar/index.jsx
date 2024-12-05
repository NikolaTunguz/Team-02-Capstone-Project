import React from 'react';
import { Link } from 'react-router-dom';
import './index.css'
import templogo from '../../assets/images/templogo.png';

const NotFoundNavBar = () => {
  return (
    <nav className = 'not_found_nav'>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <h1>SeeThru</h1>
        <img alt="logo" src={templogo} style={{ width: "55px" }} />
      </div>
      <div className = 'not_found_nav_links'>
        <Link to = '/' className = 'not_found_nav_button'> Home </Link>
      </div>
    </nav>
  );
};

export default NotFoundNavBar;