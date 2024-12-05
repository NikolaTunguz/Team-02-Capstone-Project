import React from "react";
import LiveStream from "../../components/LiveStream.jsx";
import "./index.css";
import httpClient from "../httpClient";
import AddCamera from "../../components/AddCamera.jsx";
import DeleteCamera from "../../components/DeleteCamera.jsx";
import { Typography, Box, IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";

export default function Dashboard() {
    const [cameras, setCameras] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [cameraToDelete, setCameraToDelete] = React.useState(null);

    const getCameras = async () => {
        try {
            const response = await httpClient.get("http://localhost:8080/get_user_cameras");
            setCameras(response.data.cameras || []);
        } catch (error) {
            console.error("Error fetching cameras:", error);
        }
    };

    const handleDelete = (camera, cameraNum) => {
        setCameraToDelete({camera: camera, cameraNum: cameraNum});
        setOpen(true);
    };

    const handleCloseModal = () => {
        setOpen(false);
        setCameraToDelete(null);
    };

    React.useEffect(() => {
        getCameras();
    }, []);

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
                <AddCamera onCameraAdded={getCameras} />
            </Box>
            
            <div className="dashboard-container">
            
            <div className="camera-grid">
                {cameras.map((camera, index) => (
                    <div key={camera.device_id || index}>
                        {/* <Box
                            display="flex"
                            alignItems="center"
                            mb={2}
                        > */}
                            <Typography variant="h6">Camera {index + 1}</Typography>
                            <IconButton
                                color="error"
                                onClick={() => handleDelete(camera, index + 1)}
                                className="delete-icon"
                            >
                                <Delete />
                            </IconButton>
                        {/* </Box> */}
                        <LiveStream camera={camera} />
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
