import React from 'react' 
import AccountSettings from '../../components/AccountSettings.jsx';

export default function Account({}){
    return (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: "40px" }}>
            <div style={{ maxWidth: "600px", width: "100%", padding: "20px", backgroundColor: "#f4f4f4", borderRadius: "8px" }}>
            <h1> Account Settings </h1>
            <AccountSettings/>
            </div>
        </div>
    )
}