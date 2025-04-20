import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, IconButton, Box, Tooltip, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CameraSettings from "./CameraSettings";
import { useNavigate } from 'react-router-dom';
import "../App.css";
import httpClient from '../pages/httpClient';
import default_thumbnail from '../assets/images/default_thumbnail.png'

const LiveStream = ({ camera }) => {
    const [open, setOpen] = useState(false);
    const [originalName, setOriginalName] = useState(camera.device_name);
    const navigate = useNavigate();

    const peerConnectionRef = useRef(null);
    const signalingSocketRef = useRef(null);
    const [thumbnail, setThumbnail] = useState(default_thumbnail);
    const [loading, setLoading] = useState(false);

    function websocketConnect() {
        return new Promise((resolve) => {
            signalingSocketRef.current = new WebSocket("ws://localhost:8765");
            signalingSocketRef.current.onopen = () => {
                console.log('WebSocket connection established');
                resolve(signalingSocketRef.current);
            };
        });
    }

    async function startStream() {
        await websocketConnect();

        signalingSocketRef.current.onmessage = async (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "answer") {
                delete message.target_id;
                await peerConnectionRef.current.setRemoteDescription(message);
            }
        };

        const config = {
            sdpSemantics: 'unified-plan',
            iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
        };

        peerConnectionRef.current = new RTCPeerConnection(config);

        peerConnectionRef.current.addEventListener('track', (evt) => {
            const videoEl = document.getElementById(evt.track.kind);
            if (videoEl) {
                videoEl.srcObject = evt.streams[0];
            }
        });


        await sendOffer(camera.device_id);

        return;
    }

    const handleOpen = async () => {
        setLoading(true);
        setOpen(true);
        setOriginalName(camera.device_name);
        try {
            await startStream();
        } catch (e) {
            console.error("Failed to start stream:", e);
        }
    };

    const handleClose = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }
        if (signalingSocketRef.current) {
            signalingSocketRef.current.close();
        }
        setOpen(false);

        if (camera.device_name !== originalName) {
            navigate(0);
        }
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
        setLoading(false);
    }

    async function fetchThumbnail(deviceId) {
        try {
            const response = await httpClient.get(`http://localhost:8080/get_thumbnail/${deviceId}`, {
                responseType: "blob",
                withCredentials: true,
                headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0"
                }
            });
            const blob = response.data;
            const imageURL = URL.createObjectURL(blob);
            setThumbnail(imageURL);
        } catch (error) {
            console.error("Error fetching thumbnail:", error);
        }
    }

    useEffect(() => {
        const interval = setInterval(async () => {
            fetchThumbnail(camera.device_id);
        }, 30000);

        fetchThumbnail(camera.device_id);

        return () => clearInterval(interval);
    }, [camera.device_id]);

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
                        {loading ? (
                            <>
                                <CircularProgress />
                                <p> Live stream loading...</p>
                            </>
                        ) : (
                            <video id="video" autoPlay playsInline></video>

                        )}
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