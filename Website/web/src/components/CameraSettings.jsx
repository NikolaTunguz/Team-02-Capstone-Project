import React, { useState } from "react";
import {
    Box,
    Typography,
    Button,
    Switch,
    OutlinedInput,
    IconButton,
    Tooltip,
    Modal,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteCamera from "./DeleteCamera.jsx";
import { useNavigate } from 'react-router-dom';
import httpClient from "../pages/httpClient";
import "../App.css";
import { showSuccess, showError } from "./ToastUtils";

const CameraSettings = ({ camera, setOpenDialog }) => {
    const [cameraToggleSwitch, setCameraSwitchState] = useState({});
    const [cameraToDelete, setCameraToDelete] = useState(null);
    const [open, setOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deviceName, setDeviceName] = useState(camera.device_name);

    const navigate = useNavigate();

    const handleToggle = (value) => {
        setCameraSwitchState(!value)
        sendToggle(cameraToggleSwitch);
    };

    const handleDelete = (camera) => {
        setCameraToDelete({ camera: camera });
        setOpen(true);
    };

    const handleCloseModal = () => {
        setOpen(false);
        setCameraToDelete(null);
    };

    const handleEditName = async () => {
        try {
            await httpClient.post("http://localhost:8080/update_camera_name", {
                device_id: camera.device_id,
                new_device_name: deviceName,
            });
            camera.device_name = deviceName;
            setEditModalOpen(false);
            showSuccess("Camera name updated successfully!");
        } catch (e) {
            showError(e.response?.data?.error || "Failed to update camera name.");
        }
    };

    const openEditModal = () => {
        setDeviceName(camera.device_name);
        setEditModalOpen(true);
    };

    return (
        <>
            <Box
                sx={{
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
                    pt: 2,
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Camera Settings
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body1">
                        Device Name: {camera.device_name}
                    </Typography>
                    <Tooltip title="Edit device name">
                        <IconButton onClick={openEditModal} color="primary" sx={{ ml: 1 }}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Typography variant="body1" gutterBottom>
                    Device ID: {camera.device_id}
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "90%",
                        mt: 3,
                    }}
                >
                <Typography variant="body1">Thermal View</Typography>
                <Switch
                    checked={cameraToggleSwitch || false}
                    onChange={() => handleToggle(cameraToggleSwitch)}
                    color="primary"
                />
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(camera)}
                    sx={{ width: "80%", mb: 2 }}
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

            <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "white",
                        boxShadow: 24,
                        p: 3,
                        borderRadius: 3,
                        width: 400,
                    }}
                >
                    <Tooltip title="Close">
                        <IconButton
                            onClick={() => setEditModalOpen(false)}
                            sx={{ position: "absolute", top: 8, right: 8 }}
                        >
                            <CancelIcon />
                        </IconButton>
                    </Tooltip>
                    <Typography variant="h6" mb={2}>
                        Edit Camera Name
                    </Typography>
                    <OutlinedInput
                        fullWidth
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                    />
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
                        <Button
                            onClick={handleEditName}
                            variant="contained"
                            sx={{ width: "100%" }}
                        >
                            Save
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default CameraSettings;
