// import { useState, useEffect, useRef, useMemo } from "react";
// import { selectPeers, selectLocalPeer, selectVideoTrackByID } from "@100mslive/hms-video-store";
// import Slider from "react-slick";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// function PeerTiles({ screenSharing, hmsActions, hmsStore }) {
//   const [peers, setPeers] = useState([]);

//   const settings = {
//     dots: false,              // show navigation dots
//     infinite: false,          // loop infinitely
//     speed: 500,              // slide transition speed (ms)
//     slidesToShow: 7,         // number of slides visible at once
//     slidesToScroll: 1,       // slides to scroll per swipe/click
//     // autoplay: true,          // auto slide
//     // autoplaySpeed: 2000,     // time between slides
//   };

//   // Subscribe once to get all peers
//   useEffect(() => {
//     const updatePeers = () => {
//       const remotePeers = hmsStore.getState(selectPeers);
//       const localPeer = hmsStore.getState(selectLocalPeer);
//       setPeers([localPeer, ...remotePeers]);
//     };

//     // initial load
//     updatePeers();

//     const unsubPeers = hmsStore.subscribe(setPeers, selectPeers);
//     return () => unsubPeers();
//   }, [hmsStore]);

//   const PeerTile = ({ peer }) => {
//     const videoRef = useRef();

//     // Get current track snapshot
//     // const track = hmsStore.getState(selectVideoTrackByID(peer.videoTrack));

//      // Get the track snapshot
//     const track = useMemo(
//       () => hmsStore.getState(selectVideoTrackByID(peer.videoTrack)),
//       [peer.videoTrack, hmsStore]
//     );

// // Attach/detach the video track
//     useEffect(() => {
//       // Attach once immediately if already available
//       if (track && track.enabled && videoRef.current) {
//         hmsActions.attachVideo(track.id, videoRef.current);
//       }

//       const unsubTrack = hmsStore.subscribe((updatedTrack) => {
//         if (!videoRef.current || !updatedTrack) return;
//         if (updatedTrack.enabled) {
//           hmsActions.attachVideo(updatedTrack.id, videoRef.current);
//         } else {
//           hmsActions.detachVideo(updatedTrack.id, videoRef.current);
//         }
//       }, selectVideoTrackByID(peer.videoTrack));

//       return () => {
//         if (track && videoRef.current) {
//           hmsActions.detachVideo(track.id, videoRef.current);
//         }
//         unsubTrack();
//       };
//     }, [peer.videoTrack, hmsStore, hmsActions, track]);

//     console.log(track);

//     return (
//       <div className="peer-tile">
//         {track && track.enabled ? (
//           <video ref={videoRef} autoPlay muted={peer.isLocal} playsInline className="peer-video"/>
//         ) : (
//           <div className="peer-video-placeholder"> <div className="peer-video-placeholder-label"> {peer.name?.charAt(0)?.toUpperCase()} </div></div>
//         )}
//         <div className="peer-name">{peer.name}</div>
//       </div>
//     );
//   };

//   return (
//     <div className="peer-container">
//       <Slider {...settings}>
//         {peers.map((peer) => (
//           <PeerTile key={peer.id} peer={peer} />
//         ))}
//       </Slider>
//     </div>
//   );
// }

// export default PeerTiles;

import { useState, useEffect, useRef, useMemo } from "react";
import {
  selectPeers,
  selectLocalPeer,
  selectVideoTrackByID,
} from "@100mslive/hms-video-store";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function PeerTiles({ hmsActions, hmsStore }) {
  const [peers, setPeers] = useState([]);

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 7,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1600, settings: { slidesToShow: 5 } },
      { breakpoint: 1200, settings: { slidesToShow: 4 } },
      { breakpoint: 900, settings: { slidesToShow: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 2 } },
      { breakpoint: 400, settings: { slidesToShow: 1 } },
    ],
  };

  // Subscribe to peers (including local)
  useEffect(() => {
    const updatePeers = () => {
      const remotePeers = hmsStore.getState(selectPeers);
      // const localPeer = hmsStore.getState(selectLocalPeer);
      setPeers([...remotePeers]);
    };

    // initial load
    updatePeers();

    // subscribe for updates
    const unsubPeers = hmsStore.subscribe(updatePeers);
    return () => unsubPeers();
  }, [hmsStore]);

  const PeerTile = ({ peer }) => {
    const videoRef = useRef(null);

    // Get the track snapshot
    const track = useMemo(
      () => hmsStore.getState(selectVideoTrackByID(peer.videoTrack)),
      [peer.videoTrack, hmsStore]
    );

    // Attach/detach the video track
    useEffect(() => {
      // Attach once immediately if already available
      if (track && track.enabled && videoRef.current) {
        hmsActions.attachVideo(track.id, videoRef.current);
      }

      const unsubTrack = hmsStore.subscribe((updatedTrack) => {
        if (!videoRef.current || !updatedTrack) return;
        if (updatedTrack.enabled) {
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
    }, [peer.videoTrack, hmsStore, hmsActions, track]);

    return (
      <div className="peer-tile">
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

  return (
    <div className="peer-container">
      <Slider {...settings}>
        {peers.map((peer) => (
          <PeerTile key={peer.id} peer={peer} />
        ))}
      </Slider>
    </div>
  );
}

export default PeerTiles;
