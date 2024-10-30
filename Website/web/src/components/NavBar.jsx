import React from 'react';
import '../App.css'
import templogo from '../assets/images/templogo.png';

const NavBar = () => {
  return (
    <nav>
      <img alt={'logo'} src={templogo} style={{ width: "300px" }} />
      <div>
        <a href="/dashboard">Dashboard</a>
        <a href="/notifications">Notifications</a>
        <a href="/account">Account</a>
      </div>
    </nav>
  );
};

export default NavBar; 