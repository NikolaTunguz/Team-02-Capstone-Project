import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../App.css';
import templogo from '../assets/images/templogo.png';

const NavBar = () => {
  const location = useLocation();
  const hideNavBar = location.pathname === "/" || location.pathname === "/register" || location.pathname === "/login";

  return (
    <>
    {!hideNavBar && 
      <nav className="navbar"> 
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <h1>SeeThru</h1>
          <img alt="logo" src={templogo} style={{ width: "55px" }} />
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/notifications">Notifications</Link>
        </div>
      </nav>
    }
    </>
  );
};

export default NavBar;
