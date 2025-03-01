import React from "react";
import { Box, Typography, Button, Switch } from "@mui/material";
import DeleteCamera from "./DeleteCamera.jsx";
import { useNavigate } from 'react-router-dom';
import "../App.css";

const CameraSettings = ({ camera, setOpenDialog }) => {
    const [cameraToggleSwitch, setCameraSwitchState] = React.useState({});
    const [cameraToDelete, setCameraToDelete] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();

    const handleToggle = (camera) => {
        setCameraSwitchState((prev) => ({
            ...prev,
            [camera.device_id]: !prev[camera.device_id],
        }));
    };

    const handleDelete = (camera) => {
        setCameraToDelete({ camera: camera });
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
                backgroundColor: "white",
                color: "black",
                border: "3px solid white",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginLeft: "10px",
                paddingTop: "10px",
            }}
        >
            <Typography variant="h4" gutterBottom> Camera Settings </Typography>

            <Typography variant="body1">Device Name: {camera.device_name}</Typography>
            <Typography variant="body1" gutterBottom>Device ID: {camera.device_id}</Typography>

            <Box
                style={{
                    display: "flex",
                    alignItems: "center",
                    width: "90%",
                    marginTop: "20px",
                }}
            >
                <Typography variant="body1">Thermal View</Typography>
                <Switch
                    checked={cameraToggleSwitch[camera.device_id] || false}
                    onChange={() => handleToggle(camera)}
                    color="primary"
                />
            </Box>

            <Box style={{ flexGrow: 1 }} />

            <Button
                variant="contained"
                color="error"
                onClick={() => handleDelete(camera)}
                style={{
                    width: "80%",
                    marginBottom: "20px",
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
                        navigate(0);
                    }}
                />
            )}
        </Box>
    );
};

export default CameraSettings;
