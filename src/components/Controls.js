import { useState, useEffect, useRef } from "react";
import {
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectIsLocalScreenShared,
} from "@100mslive/hms-video-store";

function Controls({ hmsStore, hmsActions }) {
    
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [peers, setPeers] = useState([]);

  useEffect(() => {
    const unsubAudio = hmsStore.subscribe(
      setAudioEnabled,
      selectIsLocalAudioEnabled
    );

    const unsubVideo = hmsStore.subscribe(
      setVideoEnabled,
      selectIsLocalVideoEnabled
    );

    const unsubScreen = hmsStore.subscribe(
      setIsScreenSharing,
      selectIsLocalScreenShared
    );

    return () => {
      unsubAudio();
      unsubVideo();
      unsubScreen();
    };
  });

  // Toggle audio/video
  const toggleAudio = async () => {
    await hmsActions.setLocalAudioEnabled(!audioEnabled);
  };

  // Toggle video
  const toggleVideo = async () => {
    await hmsActions.setLocalVideoEnabled(!videoEnabled);
  };

  // Screen sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      await hmsActions.setScreenShareEnabled(false);
    } else {
      await hmsActions.setScreenShareEnabled(true);
    }
  };

  // Leave Room
  const leaveRoom = async () => {
    await hmsActions.leave();
    setPeers([]);
  };

  return (
    <div className="controls">
      <div className="media-controls">
        {audioEnabled ? (
          <button className="control-button active" onClick={toggleAudio}>
            <i className="bi bi-mic-fill"></i>
          </button>
        ) : (
          <button className="control-button" onClick={toggleAudio}>
            <i className="bi bi-mic-mute-fill"></i>
          </button>
        )}
        {videoEnabled ? (
          <button className="control-button active" onClick={toggleVideo}>
            <i className="bi bi-camera-video-fill"></i>
          </button>
        ) : (
          <button className="control-button" onClick={toggleVideo}>
            <i className="bi bi-camera-video-off-fill"></i>
          </button>
        )}
      </div>

      <div className="main-controls">
        {isScreenSharing ? (
          <button className="control-button active" onClick={toggleScreenShare}>
            <i className="bi bi-box-arrow-in-up"></i>
          </button>
        ) : (
          <button className="control-button" onClick={toggleScreenShare}>
            <i className="bi bi-box-arrow-in-up"></i>
          </button>
        )}
      </div>

      <div className="leave-controls">
        <button className="control-button leave-button" onClick={leaveRoom}>
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </div>
    </div>
  );
}

export default Controls;
