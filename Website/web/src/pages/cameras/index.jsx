import React, { useState, useEffect } from "react";
import LiveStream from "../../components/LiveStream.jsx";
import "./index.css";
import httpClient from "../httpClient";
import AddCamera from "../../components/AddCamera.jsx";
import { Typography, Box } from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function Cameras() {
    const [cameras, setCameras] = useState([]);

    const getCameras = async () => {
        try {
            const response = await httpClient.get("http://localhost:8080/get_user_cameras");
            setCameras(response.data.cameras || []);
        } catch (error) {
            console.error("Error fetching cameras:", error);
        }
    };

    useEffect(() => {
        getCameras();
    }, []);

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const reorderedCameras = [...cameras];
        const [movedCamera] = reorderedCameras.splice(result.source.index, 1);
        reorderedCameras.splice(result.destination.index, 0, movedCamera);

        setCameras(reorderedCameras);
    };

    return (
        <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} marginRight="40px">
                <h2>Camera Feeds</h2>
                <AddCamera onCameraAdded={getCameras} />
            </Box>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="camera-list" direction="vertical">
                    {(provided) => (
                        <div className="camera-grid" {...provided.droppableProps} ref={provided.innerRef}>
                            {cameras.map((camera, index) => (
                                <Draggable key={camera.device_id || index} draggableId={String(camera.device_id || index)} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`camera-item ${snapshot.isDragging ? "dragging" : ""}`}
                                        >
                                            <Typography variant="h6" sx={{ fontFamily: "BlinkMacSystemFont", fontSize: "20px" }}>
                                                {camera.device_name}
                                            </Typography>
                                            <LiveStream camera={camera} className="camera-display" />
                                            <Typography
                                                sx={{
                                                    fontFamily: "BlinkMacSystemFont",
                                                    fontSize: "12px",
                                                    color: "black"
                                                }}
                                            >
                                                Last Updated: {new Date(camera.last_updated).toLocaleString()}
                                            </Typography>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder && <div className="droppable-placeholder">{provided.placeholder}</div>}
                        </div>
                    )}
                </Droppable>

            </DragDropContext>
        </>
    );
}
