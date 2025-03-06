import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, IconButton, Box, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CameraSettings from "./CameraSettings";
import "../App.css";
import httpClient from "../pages/httpClient";

import temp_team_photo from '../assets/images/team_photo.jpg'

const LiveStream = ({ camera }) => {
    const [open, setOpen] = useState(false);
    const [thumbnail, setThumbnail] = useState(temp_team_photo);
    const peerConnectionRef = useRef(null);
    const signalingSocketRef = useRef(null);

    async function startStream() {
        signalingSocketRef.current = await new WebSocket("ws://localhost:8765");

        signalingSocketRef.current.onmessage = async (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "answer") {
                delete message.target_id;
                await peerConnectionRef.current.setRemoteDescription(message);
            }
        };

        const config = {
            sdpSemantics: 'unified-plan'
        };

        peerConnectionRef.current = new RTCPeerConnection(config);

        peerConnectionRef.current.addEventListener('track', (evt) => {
            if (evt.track.kind === 'video') {
                document.getElementById('video').srcObject = evt.streams[0];
            } else {
                document.getElementById('audio').srcObject = evt.streams[0];
            }
        });
        await sendOffer(camera.device_id);
    };

    const handleOpen = async () => {
        await startStream();
        setOpen(true);
    };

    const handleClose = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }
        if (signalingSocketRef.current) {
            signalingSocketRef.current.close();
        }
        setOpen(false);
    };

    async function sendOffer(targetId) {
        peerConnectionRef.current.addTransceiver('video', { direction: 'recvonly' });
        peerConnectionRef.current.addTransceiver('audio', { direction: 'recvonly' });
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);

        await new Promise((resolve) => {
            if (peerConnectionRef.current.iceGatheringState === 'complete') {
                resolve();
            } else {
                const checkState = () => {
                    if (peerConnectionRef.current.iceGatheringState === 'complete') {
                        peerConnectionRef.current.removeEventListener('icegatheringstatechange', checkState);
                        resolve();
                    }
                };
                peerConnectionRef.current.addEventListener('icegatheringstatechange', checkState);
            }
        });

        const offer_alt = peerConnectionRef.current.localDescription;
        signalingSocketRef.current.send(JSON.stringify({
            type: offer_alt.type,
            target_id: targetId,
            sdp: offer_alt.sdp,
        }));
    }

    useEffect(() => {
        getThumbnail();  // Fetch thumbnail when component mounts
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            getThumbnail();
        }, 5000); // Fetch every 5 seconds (adjust as needed)

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    const getThumbnail = async () => {
        try {
            const response = await httpClient.get(`http://localhost:8080/get_thumbnail`, {
                params: { device_id: camera.device_id }
            });

            console.log("Thumbnail response:", response.data);

            if (response.data.thumbnail) {
                setThumbnail(`data:image/jpeg;base64,${response.data.thumbnail}`);
            }
        } catch (error) {
            console.error("Error fetching thumbnail:", error);
        }
    };


    return (
        <>
            <img
                src={thumbnail}
                alt="Live Stream"
                className="camera-display"
                onClick={handleOpen}
                style={{ cursor: "pointer" }}
            />

            <Dialog fullScreen open={open} onClose={handleClose}>
                <DialogContent
                    style={{
                        backgroundColor: "#dbe6ef",
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        height: "100vh",
                        padding: "20px"
                    }}
                >
                    <Tooltip title="Close live stream">
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleClose}
                            aria-label="close"
                            style={{ position: "absolute", top: 10, right: 10, color: "black" }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>

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
                        <video id="video" autoPlay playsInline></video>
                    </Box>

                    <Box style={{ marginLeft: "20px", display: "flex", alignItems: "center" }}>
                        <CameraSettings camera={camera} setOpenDialog={setOpen} />
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default LiveStream;
