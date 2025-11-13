import { useEffect, useRef, useState, useMemo } from "react";
import ScreenShare from "./ScreenShearing";
import {
  selectPeers,
  selectDominantSpeaker,
  selectVideoTrackByID,
  selectIsSomeoneScreenSharing,
} from "@100mslive/hms-video-store";

function MainDiv({ hmsStore, hmsActions }) {
  const [mainPeer, setMainPeer] = useState(null);
  const [isSomeoneSharing, setIsSomeoneSharing] = useState(false);

  // --- Subscribe for screen share and dominant speaker ---
  useEffect(() => {
    const unsubScreen = hmsStore.subscribe(setIsSomeoneSharing, selectIsSomeoneScreenSharing);

    const unsubSpeaker = hmsStore.subscribe((dominant) => {
      if (dominant && dominant.id !== mainPeer?.id) {
        setMainPeer(dominant);
      }
    }, selectDominantSpeaker);

    return () => {
      unsubScreen();
      unsubSpeaker();
    };
  }, [hmsStore, mainPeer?.id]);

  // --- Set initial random peer if none selected ---
  useEffect(() => {
    if (!mainPeer) {
      const peers = hmsStore.getState(selectPeers);
      if (peers.length > 0) {
        const randomPeer = peers[Math.floor(Math.random() * peers.length)];
        setMainPeer(randomPeer);
      }
    }
  }, [hmsStore, mainPeer]);

  // --- Video render component ---
  const MainPeer = ({ peer }) => {
    const videoRef = useRef(null);

    const track = useMemo(
      () => hmsStore.getState(selectVideoTrackByID(peer.videoTrack)),
      [peer.videoTrack, hmsStore]
    );

    useEffect(() => {
      if (!track || !videoRef.current) return;

      if (track.enabled) {
        hmsActions.attachVideo(track.id, videoRef.current);
      }

      const unsubTrack = hmsStore.subscribe((updatedTrack) => {
        if (!videoRef.current) return;
        if (updatedTrack?.enabled) {
          hmsActions.attachVideo(updatedTrack.id, videoRef.current);
        } else {
          hmsActions.detachVideo(updatedTrack.id, videoRef.current);
        }
      }, selectVideoTrackByID(peer.videoTrack));

      return () => {
        if (track && videoRef.current) {
          hmsActions.detachVideo(track.id, videoRef.current);
        }
        unsubTrack();
      };
    }, [track, peer.videoTrack, hmsStore, hmsActions]);

    return (
      <div className="main-peer-tile">
        {track && track.enabled ? (
          <video
            ref={videoRef}
            autoPlay
            muted={peer.isLocal}
            playsInline
            className="peer-video"
          />
        ) : (
          <div className="peer-video-placeholder">
            <div className="peer-video-placeholder-label">
              {peer.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          </div>
        )}
        <div className="peer-name">{peer.name}</div>
      </div>
    );
  };

  // --- Conditional rendering ---
  if (isSomeoneSharing) {
    return <div className="main-div"><ScreenShare hmsStore={hmsStore} hmsActions={hmsActions} /></div>;
  }

  return (
    <div className="main-div">
      {mainPeer ? (
        <MainPeer key={mainPeer.id} peer={mainPeer} />
      ) : (
        <p>Loading peers...</p>
      )}
    </div>
  );
}

export default MainDiv;