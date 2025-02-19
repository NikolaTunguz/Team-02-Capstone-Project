import React from 'react'
import AccountSettings from '../../components/AccountSettings.jsx';
import EmergencyContactSettings from '../../components/EmergencyContactSettings.jsx';
import NotificationSettings from '../../components/NotificationSettings.jsx';

export default function Account({ }) {
    return (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: "40px", zIndex: "1000" }}>
            <div style={{ maxWidth: "800px", width: "100%", padding: "20px", backgroundColor: "#dbe6ef", borderRadius: "8px" }}>
                <h3> Update Account Information </h3>
                <AccountSettings />
                <br />
                <h3> Emergency Contacts </h3>
                <EmergencyContactSettings />
                <br /><br />
                <NotificationSettings />
            </div>
        </div>
    )
}