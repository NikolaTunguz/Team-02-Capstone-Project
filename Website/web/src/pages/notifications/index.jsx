import React from 'react'
import NotificationDeck from '../../components/NotificationDeck.jsx';
// import httpClient from "../httpClient";

// const triggerMockNotification = async () => {
//     try {
//         const response = await httpClient.post("http://localhost:8080/mock_notification", {
//             device_id: 14,
//             message: "Test Alert"
//         });
//         console.log(response.data);
//     } catch (error) {
//         console.error("Error triggering mock notification:", error);
//     }
// };

export default function Notifications({ }) {
    return (
        <>
            <div>
                {/* <button onClick={triggerMockNotification}>Send Mock Notification</button> */}
                <NotificationDeck />
            </div>
        </>
    )

}
