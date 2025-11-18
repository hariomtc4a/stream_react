import { useLoaderData } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
// import "../css/css/style.css";
// import "../css/App.css";
import JoinForm from "../components/SpeakerJoinForm.js";
import {
  HMSReactiveStore,
  selectPeers,
  selectIsConnectedToRoom,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectIsLocalScreenShared,
  selectIsSomeoneScreenSharing,
  selectVideoTrackByID,
  selectHMSMessages,
} from "@100mslive/hms-video-store";

const hmsManager = new HMSReactiveStore();
hmsManager.triggerOnSubscribe();
const hmsStore = hmsManager.getStore();
const hmsActions = hmsManager.getActions();

async function getSpeakerDetail(s_id) {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/getSpeaker`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sId: s_id }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse JSON response
    const data = await response.json();
    console.log("Response from server:", data);
    return data;
  } catch (error) {
    console.error("Error posting data:", error);
  }
}

function SpeakerJoin() {
  const { s_id } = useLoaderData();
  const [speakerDetails, setSpeakerDetails] = useState(null);
  const [connected, setConnected] = useState(false);
  const [peers, setPeers] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [someoneSharing, setSomeoneSharing] = useState(false);
  const [messages, setMessages] = useState([]);
  // const [roomCode, setRoomCode] = useState("");
  // const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mainRef = useRef();

  // Subscribe to HMS store state changes
  useEffect(() => {
    const unsubPeers = hmsStore.subscribe(setPeers, selectPeers);
    const unsubConnection = hmsStore.subscribe(
      setConnected,
      selectIsConnectedToRoom
    );
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
    const unsubSomeone = hmsStore.subscribe(
      setSomeoneSharing,
      selectIsSomeoneScreenSharing
    );
    const unsubMessages = hmsStore.subscribe(setMessages, selectHMSMessages);

    return () => {
      unsubPeers();
      unsubConnection();
      unsubAudio();
      unsubVideo();
      unsubScreen();
      unsubSomeone();
      unsubMessages();
    };
  }, []);

  // Join Room
  // const joinRoom = async () => {
  //   const authToken = await hmsActions.getAuthTokenByRoomCode({ roomCode });
  //   await hmsActions.join({ userName, authToken });
  // };

  // Leave Room
  const leaveRoom = async () => {
    await hmsActions.leave();
    setPeers([]);
  };

  // Toggle audio/video
  const toggleAudio = async () => {
    await hmsActions.setLocalAudioEnabled(!audioEnabled);
  };

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

  // Render each peer tile
  const PeerTile = ({ peer }) => {
    const videoRef = useRef();

    useEffect(() => {
      const unsubTrack = hmsStore.subscribe((track) => {
        if (track && track.enabled) {
          hmsActions.attachVideo(track.id, videoRef.current);
        } else if (track) {
          hmsActions.detachVideo(track.id, videoRef.current);
        }
      }, selectVideoTrackByID(peer.videoTrack));

      return () => unsubTrack();
    }, [peer.videoTrack]);

    return (
      <div className="peer-tile">
        <video
          ref={videoRef}
          autoPlay
          muted={peer.isLocal}
          playsInline
          className="peer-video"
        />
        <div className="peer-name">{peer.name}</div>
      </div>
    );
  };

  // Render messages
  const renderMessages = messages.map((msg, i) => (
    <div key={i} className="message-tile">
      <strong>{msg.senderName}</strong>
      <div className="message-content">
        {msg.message}
        <span className="message-timestamp">
          {new Date(msg.time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  ));

  // Send message
  const [chatMessage, setChatMessage] = useState("");
  const sendMessage = async () => {
    if (chatMessage.trim() !== "") {
      await hmsActions.sendBroadcastMessage(chatMessage);
      setChatMessage("");
    }
  };

  // Auto-leave on unload
  useEffect(() => {
    window.onbeforeunload = leaveRoom;
  }, []);

  useEffect(() => {
    const fetchSpeakerDetails = async () => {
      try {
        const details = await getSpeakerDetail(s_id);
        setSpeakerDetails(details);
      } catch (err) {
        setError("Failed to load speaker details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpeakerDetails();
  }, [s_id]);

  return (
    <div>
      {loading ? (
        <p>Loading speaker details...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : !speakerDetails?.success ? (
        <p>No speaker found.</p>
      ) : (
        <div className="speaker-details">
          {!connected ? (
            <div>
              <JoinForm spekerDetails={speakerDetails} />
            </div>
          ) : (
            <div className="conference">
              <div className="controls">
                <button onClick={toggleAudio}>
                  {audioEnabled ? "Mute Audio" : "Unmute Audio"}
                </button>
                <button onClick={toggleVideo}>
                  {videoEnabled ? "Stop Video" : "Start Video"}
                </button>
                <button onClick={toggleScreenShare}>
                  {isScreenSharing ? "Stop Sharing" : "Share Screen"}
                </button>
                <button onClick={leaveRoom}>Leave</button>
              </div>

              <div className="peers-container">
                {peers.map((peer) => (
                  <PeerTile key={peer.id} peer={peer} />
                ))}
              </div>

              <div ref={mainRef} className="main-screen">
                {someoneSharing && !isScreenSharing && (
                  <p>Someone is sharing screen</p>
                )}
              </div>

              <div className="chat">
                <div className="messages">{renderMessages}</div>
                <div className="chat-input">
                  <input
                    type="text"
                    placeholder="Type message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <button onClick={sendMessage}>Send</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  var speakerInfo = speakerDetails ? JSON.parse(speakerDetails) : {};
  // console.log(speakerDetails);

  // return (
  //   <div className="hms-container">
  //     {speakerDetails.success ? (
  //       <div className="speaker-details">
  //         {!connected ? (
  //           <div className="join-form">
  //             <input
  //               type="text"
  //               placeholder="Room Code"
  //               // value={speakerInfo.data.room.stream_key || ""}
  //               onChange={(e) => setRoomCode(e.target.value)}
  //             />
  //             <input
  //               type="text"
  //               placeholder="Your Name"
  //               // value={speakerInfo.data.name || ""}
  //               onChange={(e) => setUserName(e.target.value)}
  //             />
  //             <button onClick={joinRoom}>Join</button>
  //           </div>
  //         ) : (
  //           <div className="conference">
  //             <div className="controls">
  //               <button onClick={toggleAudio}>
  //                 {audioEnabled ? "Mute Audio" : "Unmute Audio"}
  //               </button>
  //               <button onClick={toggleVideo}>
  //                 {videoEnabled ? "Stop Video" : "Start Video"}
  //               </button>
  //               <button onClick={toggleScreenShare}>
  //                 {isScreenSharing ? "Stop Sharing" : "Share Screen"}
  //               </button>
  //               <button onClick={leaveRoom}>Leave</button>
  //             </div>

  //             <div className="peers-container">
  //               {peers.map((peer) => (
  //                 <PeerTile key={peer.id} peer={peer} />
  //               ))}
  //             </div>

  //             <div ref={mainRef} className="main-screen">
  //               {someoneSharing && !isScreenSharing && (
  //                 <p>Someone is sharing screen</p>
  //               )}
  //             </div>

  //             <div className="chat">
  //               <div className="messages">{renderMessages}</div>
  //               <div className="chat-input">
  //                 <input
  //                   type="text"
  //                   placeholder="Type message..."
  //                   value={chatMessage}
  //                   onChange={(e) => setChatMessage(e.target.value)}
  //                   onKeyDown={(e) => e.key === "Enter" && sendMessage()}
  //                 />
  //                 <button onClick={sendMessage}>Send</button>
  //               </div>
  //             </div>
  //           </div>
  //         )}
  //       </div>
  //     ) : (
  //       <p>Loading speaker details...</p>
  //     )}
  //   </div>
  // );
}

export default SpeakerJoin;
