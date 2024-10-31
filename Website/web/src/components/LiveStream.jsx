import React, { useEffect, useRef } from 'react';
import '../App.css';

const LiveStream = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const startStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing the camera:", error);
      }
    };

    startStream();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        let stream = videoRef.current.srcObject;
        let tracks = stream.getTracks();

        tracks.forEach((track) => {
          track.stop();
        });
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  return (
    <>
      <h3 className="live-stream-title">Live Feed</h3>
      <div className="live-stream-container">
        <div className="video-wrapper">
          <video ref={videoRef} autoPlay playsInline className="video-stream" />
        </div>
      </div>
    </>
  );
};

export default LiveStream;
