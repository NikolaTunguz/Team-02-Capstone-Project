import React from "react";
import { Box, Typography, Button, Switch } from "@mui/material";
import DeleteCamera from "./DeleteCamera.jsx";
import { useNavigate } from 'react-router-dom';

const CameraSettings = ({ camera, setOpenDialog }) => {
    const [cameraToggleSwitch, setCameraSwitchState] = React.useState({}); //True & False, no null in a switch.
    const [cameraToDelete, setCameraToDelete] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();

    //handle switch toggle
    const handleToggle = (camera, cameraNum) => {
        setCameraSwitchState((prev) => ({
            ...prev,
            [camera.device_id]: !prev[camera.device_id],
        }));
    };

    const handleDelete = (camera) => {
        setCameraToDelete({camera: camera});
        setOpen(true);
    };

    const handleCloseModal = () => {
        setOpen(false);
        setCameraToDelete(null);
    };


    return (
        <Box 
            style={{ 
                width: "25vw",
                height: "80vh", 
                backgroundColor: "#222", 
                color: "white",
                border: "3px solid white", 
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginLeft: "10px"
            }}
        >
            <Typography variant="h6" gutterBottom>Camera Settings</Typography>
            <Typography variant="body1">Device Name: {camera.device_name}</Typography>
            <Typography variant="body1" gutterBottom>Device ID: {camera.device_id}</Typography>

            <Box 
                style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: "15px",
                    padding: "10px"
                }}
            >
                <Typography variant="body1">Thermal View</Typography>
                <Switch
                    checked={cameraToggleSwitch[camera.device_id] || false}
                    onChange={() => handleToggle(camera)}
                    color="primary"
                />
            </Box>
            <Button 
                variant="contained" 
                color="error" 
                onClick={() => handleDelete(camera)}
                style={{ 
                    marginTop: "500px",
                    bottom: "20px", 
                    width: "80%" 
                }}
            >
                Delete Camera
            </Button>
            {cameraToDelete && (
                <DeleteCamera
                    open={open}
                    onClose={handleCloseModal}
                    camera={cameraToDelete}
                    onCameraDeleted={() => {
                        setOpenDialog(false);
                        navigate(0)
                    }}
                />
            )}
        </Box>
    );
};

export default CameraSettings;
