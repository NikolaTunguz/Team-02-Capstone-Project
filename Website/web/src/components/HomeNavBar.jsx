import React from 'react';
import { Link } from 'react-router-dom';

import '../App.css';
import templogo from '../assets/images/templogo.png';

const HomeNavBar = () => {
  return (
    <>
      <nav>
        <div>
          <h1> SeeThru </h1>
          <img 
            alt = 'logo' 
            src = { templogo } 
            style = {{ width: "80px" }} 
            />
        </div>
        <div>
          <Link to = '/register'> Register </Link>
          <Link to = '/login'> Login </Link>
        </div>
      </nav>
    </>
  );
};

export default HomeNavBar;