import React from 'react';
import './index.css';
import HomeNavBar from '../../components/HomeNavBar.jsx'
import temp_team_photo from '../../assets/images/team_photo.png'
import product_photo from '../../assets/images/product_photo.png'
import { useAuth } from "../../context/AuthContext";

const AboutUs = () => {
    const { isLoggedIn } = useAuth();

    return (
        <div className='about_us'>
            <div>
                {!isLoggedIn && <HomeNavBar />}
            </div >

            <div className='product_section'>
                <h2 className='product_h2'> The Product </h2>
                <div className='content'>
                    <p>
                        The SeeThru project is an innovative residential security system featuring thermal cameras.
                        The system has four major features: person, pistol, package, and fire detection.
                        SeeThru comes with a hardware component consisting of two cameras, allowing for standard and
                        thermal vision for real-time monitoring of your doorstep. <br /> <br />

                        With cutting-edge technology, SeeThru allows homeowners to monitor their property
                        with enhanced safety features. <br /> <br />

                        Keep your family secure without concern and with a peaceful mind.
                    </p>
                    <img
                        alt='Product Photo'
                        src={product_photo}
                    />
                </div>
            </div>

            <div className='team_section'>
                <h2 className='team_h2'> Meet The Team </h2>
                <div className='content'>
                    <img
                        alt='Team Photo'
                        src={temp_team_photo}
                    />
                    <p>
                        We are Team 02: SeeThru, a dedicated group of students from the University of Nevada, Reno.
                        Pictured from left to right are Nikola Tunguz, Diego Borne, Joel Molina, and Reni Wu. <br /> <br />
                        Our diverse backgrounds and shared passion for innovation drive us to create impactful solutions.
                        Together, we aim to make residential security accessible and effective, ensuring safety and peace of mind for all.
                    </p>
                </div>
            </div>
            <div className='contact_section'>
                <p className='contact_text'>
                    Have questions or feedback? Reach out to us at <a href='mailto:seethrucapstone@gmail.com'>seethrucapstone@gmail.com</a>.
                    We'd love to hear from you!
                </p>
            </div>
        </div>
    );
};

export default AboutUs;