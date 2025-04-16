import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, IconButton, Box, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CameraSettings from "./CameraSettings";
import { useNavigate } from 'react-router-dom';
import "../App.css";
import httpClient from '../pages/httpClient';
import temp_team_photo from '../assets/images/team_photo.png'

const LiveStream = ({ camera }) => {
    const [open, setOpen] = useState(false);
    const [originalName, setOriginalName] = useState(camera.device_name);
    const navigate = useNavigate();
    const [cameraToggleSwitch, setCameraToggleSwitch] = useState(false)

    const peerConnectionRef = useRef(null);
    const signalingSocketRef = useRef(null);
    const [thumbnail, setThumbnail] = useState(temp_team_photo);

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
            sdpSemantics: 'unified-plan'
        };

        config.iceServers = [{ urls: ['stun:stun.l.google.com:19302'] }];

        peerConnectionRef.current = new RTCPeerConnection(config);


        let counter = 0;
        peerConnectionRef.current.addEventListener('track', (evt) => {
            if (evt.track.kind === 'video') {
                // document.getElementById('video').srcObject = evt.streams[0];
                if (counter == 0) {
                    document.getElementById('video').srcObject = new MediaStream([evt.track])
                    counter += 1;
                } else if (counter > 0) {
                    document.getElementById('thermal').srcObject = new MediaStream([evt.track])
                    
                }
            }
                
            // } else {
            //     document.getElementById('audio').srcObject = evt.streams[0];
            // }
        });

        
        await sendOffer(camera.device_id);
    };

    const handleOpen = async () => {
        await startStream();
        setOriginalName(camera.device_name);
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

        if (camera.device_name !== originalName) {
            navigate(0);
        }
    };

    async function sendOffer(targetId) {
        peerConnectionRef.current.addTransceiver('video', { direction: 'recvonly' });
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

    const handleToggle = (value) => {
        setCameraToggleSwitch(value)
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
                        <video 
                            id="video" 
                            autoPlay 
                            playsInline 
                            style={{ display: !cameraToggleSwitch ? 'block' : 'none' }}>
                        </video>
                        <video 
                            id="thermal" 
                            autoPlay 
                            playsInline 
                            style={{ display: cameraToggleSwitch ? 'block' : 'none' }}>
                        </video>
                    </Box>

                    <Box style={{ marginLeft: "20px", display: "flex", alignItems: "center" }}>
                        <CameraSettings camera={camera} setOpenDialog={setOpen} sendToggle={handleToggle} />
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default LiveStream;
