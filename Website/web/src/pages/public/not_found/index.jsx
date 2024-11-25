import React from 'react'
import NotFoundNavBar from '../../../components/not_found_nav_bar/index.jsx'
import './index.css'

const NotFound = () => {
    return (
        <div>
            <div>
                <NotFoundNavBar/>
            </div>
            <div className = 'not_found_info'>
                <h1> 404: Page Not Found </h1>
                <p> The page you are looking for does not exist. < br />
                    Please return to Home and try again.
                </p>
            </div>
        </div>
    )
}

export default NotFound; 