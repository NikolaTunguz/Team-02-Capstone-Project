import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../App.css';
import templogo from '../assets/images/templogo.png';
import { Info, Dashboard, Notifications } from '@mui/icons-material';

const NavBar = () => {
  const location = useLocation();
  const hideNavBar = location.pathname === "/register" || location.pathname === "/login";
  const isSelected = (path) => location.pathname === path;

  return (
    <>
      {!hideNavBar &&
        <nav className="navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <h1>SeeThru</h1>
            <img alt="logo" src={templogo} style={{ width: "55px" }} />
          </div>
          <div className="nav-links">
            <Link
              to="/cameras"
              className={isSelected("/cameras") ? "active-link" : ""}
            >
              <Dashboard style={{ marginRight: "5px" }} /> Cameras
            </Link>
            <Link
              to="/notifications"
              className={isSelected("/notifications") ? "active-link" : ""}
            >
              <Notifications style={{ marginRight: "5px" }} /> Notifications
            </Link>
            <Link
              to="/"
              className={isSelected("/") ? "active-link" : ""}
            >
              <Info style={{ marginRight: "5px" }} /> About Us
            </Link>
          </div>
        </nav>
      }
    </>
  );
};

export default NavBar;