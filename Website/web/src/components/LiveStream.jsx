import React, { useEffect, useRef } from 'react';
import '../App.css';

const LiveStream = () => {
  return (
    <div>
      <img src="http://localhost:5000/video_feed" alt="Live Stream"/>
    </div>
  );
};

export default LiveStream;
