import React, { useState } from "react";
import { Dialog, DialogContent, IconButton, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CameraSettings from "./CameraSettings"; 
import "../App.css";

const LiveStream = ({ camera }) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const signalingSocket = new WebSocket("ws://192.168.1.68:8765");

    var peerConnection = null;

    signalingSocket.onmessage = async (event) => {
        const message = JSON.parse(event.data);

        if (message.type === "answer") {
            delete message.target_id
            console.log(message)
            await peerConnection.setRemoteDescription(message);
        }
    };

    async function sendOffer(targetId) {
        peerConnection.addTransceiver('video', { direction: 'recvonly' });
        peerConnection.addTransceiver('audio', { direction: 'recvonly' });
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
    
        await new Promise((resolve) => {
            if (peerConnection.iceGatheringState === 'complete') {
                resolve();
            } else {
                const checkState = () => {
                    if (peerConnection.iceGatheringState === 'complete') {
                        console.log("COMPLETE");
                        peerConnection.removeEventListener('icegatheringstatechange', checkState);
                        resolve();
                    }
                };
                peerConnection.addEventListener('icegatheringstatechange', checkState);
            }
        });
    
        var offer_alt = peerConnection.localDescription;
        console.log("INITIAL OFFER: " + offer_alt.sdp)
        console.log(peerConnection.iceGatheringState)
        signalingSocket.send(JSON.stringify({
            type: offer_alt.type,
            target_id: targetId,
            sdp: offer_alt.sdp,
        }));
    }

    React.useEffect(() => {
        const startup = async () => {
            var config = {
                sdpSemantics: 'unified-plan'
            };
        
            // if (document.getElementById('use-stun').checked) {
            //     config.iceServers = [{ urls: ['stun:stun.l.google.com:19302'] }];
            // }
        
            peerConnection = new RTCPeerConnection(config);
        
            peerConnection.addEventListener('track', (evt) => {
                if (evt.track.kind == 'video') {
                    document.getElementById('video').srcObject = evt.streams[0];
                } else {
                    document.getElementById('audio').srcObject = evt.streams[0];
                }
            });
        
            // document.getElementById('start').style.display = 'none';
            await sendOffer('2236119122624');
            // document.getElementById('stop').style.display = 'inline-block';
        };
        startup();
    }, []);


    return (
        <>
            {/* <img 
                src="http://localhost:5000/video_feed" 
                alt="Live Stream" 
                className="camera-display" 
                onClick={handleOpen} 
                style={{ cursor: "pointer" }}
            /> */}

            <video id="video" autoplay="true" playsinline="true"></video>

            {/* <Dialog fullScreen open={open} onClose={handleClose}>
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
            </Dialog> */}
        </>
    );
};

export default LiveStream;
