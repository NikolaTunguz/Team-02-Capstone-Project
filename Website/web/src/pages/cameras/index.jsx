//React imports
import React from "react";
import LiveStream from "../../components/LiveStream.jsx";
import "./index.css";
import httpClient from "../httpClient";
import AddCamera from "../../components/AddCamera.jsx";
import DeleteCamera from "../../components/DeleteCamera.jsx";
import { Typography, Box, IconButton, Switch } from "@mui/material";
import { Delete } from "@mui/icons-material";

//React hooks
export default function Cameras() {
    const [cameras, setCameras] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [cameraToDelete, setCameraToDelete] = React.useState(null);
    const [cameraToggleSwitch, setCameraSwitchState] = React.useState({}); //True & False, no null in a switch.

    const getCameras = async () => {
        try {
            const response = await httpClient.get("http://localhost:8080/get_user_cameras");
            setCameras(response.data.cameras || []);
        } catch (error) {
            console.error("Error fetching cameras:", error);
        }
    };

    //handle switch toggle
    const handleToggle = (camera, cameraNum) => {
        setCameraSwitchState((prev) => ({
            ...prev,
            [`${camera.device_id || cameraNum}`]: !prev[`${camera.device_id || cameraNum}`],
        }));
        setOpen(true);
    };

    //handle delete camera
    const handleDelete = (camera, cameraNum) => {
        setCameraToDelete({camera: camera, cameraNum: cameraNum});
        setOpen(true);
    };

    //closes the add camera modal
    const handleCloseModal = () => {
        setOpen(false);
        setCameraToDelete(null);
    };

    //initial page load function
    React.useEffect(() => {
        getCameras();
    }, []);

    //React component to be returned.
    return (
        <>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
                marginRight="40px"
            >
                <h2>Camera Feeds</h2>
                <AddCamera onCameraAdded={getCameras}/>
            </Box>
            
            <div className="camera-container">
            
            <div className="camera-grid">
                {cameras.map((camera, index) => (
                    <div key={camera.device_id || index}>

                        <header className="device-header">
                            <Typography variant="h6" className="device-name">
                                {camera.device_name}
                            </Typography>

                            <IconButton
                                color="error"
                                onClick={() => handleDelete(camera, index + 1)}
                                className="delete-icon"
                            >
                                <Delete />
                            </IconButton>

                            <Switch
                                checked={cameraToggleSwitch?.[camera.device_id || index] || false}
                                onChange={() => handleToggle(camera, index)}
                                color="primary"
                                className="switch-icon"
                            />
                        </header>
            
                        <LiveStream camera={camera} className="camera-display"/>
                    </div>
                ))}
            </div>
            {cameraToDelete && (
                <DeleteCamera
                    open={open}
                    onClose={handleCloseModal}
                    camera={cameraToDelete}
                    onCameraDeleted={getCameras}
                />
            )}
        </div>
        </>
    );
}
