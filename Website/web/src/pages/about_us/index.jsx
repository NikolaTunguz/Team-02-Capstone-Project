import React from 'react';
import './index.css'; 
import HomeNavBar from '../../components/HomeNavBar.jsx'
import temp_team_photo from '../../assets/images/team_photo.jpg'

const Home = () => {
    return (
        <div className = "home">
        <div>
            <HomeNavBar/>
        </div >
        <div className = "about_us">
            <h2 > About Us </h2>
            <p>
                We are Team 02: SeeThru. <br />
                From the University of Nevada, Reno.<br />
                Our goals are to enhance residential security at an affordable price.
            </p>
            <img className = 'team_photo'
                alt = 'Team Photo'
                src = {temp_team_photo}  
            />
        </div>
        </div>
    );
};

export default Home;