import React from 'react';
import './index.css'; 
import HomeNavBar from '../../components/HomeNavBar.jsx'
import temp_team_photo from '../../assets/images/team_photo.jpg'
import temp_team_photo_png from '../../assets/images/temp_team_photo_png.png'
import temp_product_photo_png from '../../assets/images/temp_product_photo_png.png'

const AboutUs = () => {
    return (
        <div className = 'about_us'>
            <div>
                <HomeNavBar/>
            </div >
            
            <div className = 'product_section'>
                <h2 className = 'product_h2'> The Product </h2>
                <div className = 'content'>
                    <p>
                    The SeeThru project is an innovative residential security system featuring thermal cameras.
                    The system has three major features: person, concealed pistol, and package detection.
                    SeeThru comes with a hardware component consisting of two cameras, allowing for standard and 
                    thermal vision for real-time monitoring of your doorstep. <br/> <br/>

                    With cutting-edge technology, SeeThru allows homeowners real-time monitoring of their property 
                    with enhanced safety features. <br/> <br/>

                    Keep your family secure without concern and with a peaceful mind.
                    </p>
                    <img 
                        alt = 'Product Photo'
                        src = {temp_product_photo_png}
                    />
                </div>
            </div>

            <div className = 'team_section'>
                <h2 className = 'team_h2'> Meet The Team </h2>
                <div className = 'content'>
                    <img 
                        alt = 'Team Photo'
                        src = {temp_team_photo}  
                    />
                    <p>
                    We are Team 02: SeeThru, a dedicated group of students from the University of Nevada, Reno. <br/> <br/>
                    Our diverse backgrounds and shared passion for innovation drive us to create impactful solutions. 
                    Together, we aim to make residential security accessible and effective, ensuring safety and peace of mind for all.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;