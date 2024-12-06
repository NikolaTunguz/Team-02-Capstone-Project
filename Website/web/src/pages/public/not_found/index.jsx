import React from 'react'
import NotFoundNavBar from '../../../components/not_found_nav_bar/index.jsx'
import './index.css'
import { useAuth } from '../../../context/AuthContext';
import HeaderContent from '../../../layout/Header'

const NotFound = () => {
    const { isLoggedIn } = useAuth();

    return (
        <div>
            <div>
                {!isLoggedIn ? <NotFoundNavBar /> : <HeaderContent />}
            </div>
            <div className='not_found_info'>
                <h1> 404: Page Not Found </h1>
                <p> The page you are looking for does not exist. < br />
                    Please return to Home and try again.
                </p>
            </div>
        </div>
    )
}

export default NotFound; 