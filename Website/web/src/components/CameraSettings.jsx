import React from "react";
import { Box, Typography, Button, Switch, OutlinedInput, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteCamera from "./DeleteCamera.jsx";
import { useNavigate } from 'react-router-dom';
import httpClient from "../pages/httpClient";
import "../App.css";
import { showSuccess, showError } from "./ToastUtils";

const CameraSettings = ({ camera, setOpenDialog }) => {
    const [cameraToggleSwitch, setCameraSwitchState] = React.useState({});
    const [cameraToDelete, setCameraToDelete] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const [editButton, setEditingState] = React.useState(false);
    const [deviceName, setDeviceName] = React.useState(camera.device_name);

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

    const handleEditButton = () => {
        setEditingState(!editButton);
    };


    const handleEditName = async () => {
        try {
            await httpClient.post("/api/update_camera_name",
                {
                    device_id: camera.device_id,
                    new_device_name: deviceName,
                });
          
            camera.device_name = deviceName;
            setEditingState(false);

            //update name in camera dashboard (callback)
            if (nameChange) {
                nameChange(camera.device_id, deviceName);
            }
            showSuccess("Camera name updated successfully!");
        }
        catch (e) {
            showError(e.response?.data?.error || "Failed to update camera name.");
        }
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


            <Box
                style={{
                    display: "flex",
                    alignItems: "center",
                }}>
                {editButton ? (
                    <>
                        <OutlinedInput
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                        />

                        <IconButton
                            onClick={handleEditName}
                            color="primary"
                        >
                            <SaveIcon />
                        </IconButton>
                    </>)
                    :
                    (
                        <Typography variant="body1">Device Name: {camera.device_name}</Typography>
                    )}
                <IconButton
                    onClick={handleEditButton}
                    color="primary"
                    sx={{ ml: 1 }}
                >
                    <EditIcon />
                </IconButton>
            </Box>

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
