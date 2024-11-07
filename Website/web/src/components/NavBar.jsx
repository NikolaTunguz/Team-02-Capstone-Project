import React from 'react';
import { Link } from 'react-router-dom';
import AccountMenu from './AccountMenu';
import '../App.css';
import templogo from '../assets/images/templogo.png';

const NavBar = () => {
  return (
    <nav>
      <div>
        <h1>SeeThru</h1>
        <img alt="logo" src={templogo} style={{ width: "80px" }} />
      </div>
      <div>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/notifications">Notifications</Link>
        <AccountMenu/>
      </div>
    </nav>
  );
};

export default NavBar;
