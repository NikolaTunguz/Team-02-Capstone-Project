import React from 'react';
import './index.css'; 
import HomeNavBar from '../../components/HomeNavBar.jsx'
import temp_team_photo from '../../assets/images/team_photo.jpg'

const Home = () => {
    return (
        <div className = "home">
        <div>
            <HomeNavBar/>
        </div>
            <h1> SeeThru </h1>
            <p>
                This is our team, please don't be rude.
            </p>
            <img 
                alt = 'Team Photo'
                src = {temp_team_photo}  
                className = 'team_photo'
            />
        </div>
    );
};

export default Home;