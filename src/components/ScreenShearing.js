import { useEffect, useRef, useState } from "react";
import React from "react";
import PeerTiles from "./PeerTiles";
import {
  selectPeerScreenSharing,
  selectScreenShareByPeerID,
  selectIsLocalScreenShared,
  selectIsSomeoneScreenSharing,
} from "@100mslive/hms-video-store";

function ScreenShare({ hmsStore, hmsActions }) {
  const [presenter, setPresenter] = useState(null);
  const [screenTrack, setScreenTrack] = useState(null);
  const [isSomeoneSharing, setIsSomeoneSharing] = useState(false);
  const [isLocalSharing, setIsLocalSharing] = useState(false);
  const videoRef = useRef(null);

  // Subscribe to changes in who is sharing
  useEffect(() => {
    const unsubSomeone = hmsStore.subscribe(
      setIsSomeoneSharing,
      selectIsSomeoneScreenSharing
    );

    const unsubPresenter = hmsStore.subscribe(
      (peer) => setPresenter(peer),
      selectPeerScreenSharing
    );

    const unsubLocalSharing = hmsStore.subscribe(
      setIsLocalSharing,
      selectIsLocalScreenShared
    );


    return () => {
      unsubSomeone();
      unsubPresenter();
      unsubLocalSharing();
    };
  }, [hmsStore]);

  // Get the screen track whenever the presenter changes
  useEffect(() => {
    if (presenter) {
      const track = hmsStore.getState(selectScreenShareByPeerID(presenter.id));
      setScreenTrack(track);
    } else {
      setScreenTrack(null);
    }
  }, [presenter, hmsStore]);

  // Attach or detach video when track changes
  useEffect(() => {
    if (screenTrack && videoRef.current) {
      hmsActions.attachVideo(screenTrack.id, videoRef.current);
    } else if (videoRef.current) {
      hmsActions.detachVideo(videoRef.current);
    }
  }, [screenTrack, hmsActions]);

  if (isSomeoneSharing) {
    if(isLocalSharing){
      return (
        <div className="screeen-sharing-container">
          <h3 style={{marginBottom: "8px", fontWeight: "500", fontSize: "16px",float: "left",}}> {" "}
            {/* {presenter?.name ? `${presenter.name} is sharing screen` : "Someone is sharing their screen"} */}
          </h3>          
          {/* <video ref={videoRef} autoPlay playsInline muted className="screeen-sharing" /> */}
          <div className="screeen-sharing-label"><h3>You are sharing</h3></div>
        </div>
      );
    } else {
      return (
        <div className="screeen-sharing-container">
          <h3 style={{marginBottom: "8px", fontWeight: "500", fontSize: "16px",float: "left",}}> {" "}
            {presenter?.name ? `${presenter.name} is sharing screen` : "Someone is sharing their screen"}
          </h3>
          <video ref={videoRef} autoPlay playsInline muted className="screeen-sharing" />
        </div>
      );
    }
  } else {
    return "";
  }
}

export default ScreenShare;
