import React, { useState } from "react";
import { Dialog, DialogContent, IconButton, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CameraSettings from "./CameraSettings"; 
import "../App.css";

const LiveStream = ({ camera }) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <img 
                src="http://localhost:5000/video_feed" 
                alt="Live Stream" 
                className="camera-display" 
                onClick={handleOpen} 
                style={{ cursor: "pointer" }}
            />

            <Dialog fullScreen open={open} onClose={handleClose}>
                <DialogContent 
                    style={{ 
                        backgroundColor: "black", 
                        display: "flex", 
                        justifyContent: "flex-start", 
                        alignItems: "center",
                        height: "100vh",
                        padding: "20px" 
                    }}
                >
                    <IconButton 
                        edge="start" 
                        color="inherit" 
                        onClick={handleClose} 
                        aria-label="close"
                        style={{ position: "absolute", top: 10, right: 10, color: "white" }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <Box 
                        style={{ 
                            width: "70vw",  
                            height: "80vh",
                            border: "3px solid white", 
                            borderRadius: "4px", 
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            overflow: "hidden" 
                        }}
                    >
                        <img 
                            src="http://localhost:5000/video_feed" 
                            alt="Live Stream" 
                            style={{ 
                                width: "100%", 
                                height: "100%", 
                                objectFit: "cover", 
                            }}
                        />
                    </Box>

                    <Box style={{ marginLeft: "20px", display: "flex", alignItems: "center" }}>
                        <CameraSettings camera={camera} setOpenDialog={setOpen}/>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default LiveStream;
