import React from "react";
import { 
    Modal, 
    Box, 
    Typography, 
    Button, 
    IconButton
} from "@mui/material";
import httpClient from ".././pages/httpClient";
import { Cancel } from "@mui/icons-material";

export default function DeleteCamera({ open, onClose, camera, onCameraDeleted }) {
    const handleDeleteCamera = async () => {
        try {
            const response = await httpClient.post("/api/delete_user_camera", {
                device_id: camera.device_id || camera.camera.device_id,
            });
            if (response.status === 200) {
                onCameraDeleted(); 
                onClose(); 
            }
        } catch (error) {
            console.error("Error deleting camera:", error);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
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
                    width: 420,
                }}
            >
                <Typography variant="h5" mb={2}>
                    Are you sure you want to delete Camera: {camera.camera.device_name}{" "}
                    with device ID: {camera.camera.device_id}?
                </Typography>
                <IconButton
                    onClick={onClose}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                >
                    <Cancel/>
                </IconButton>
                <br/>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteCamera}
                        style={{ marginLeft: "auto" }}
                    >
                        Delete
                    </Button>
                </div>

                </Box>
        </Modal>
    );
}
