import { useLoaderData } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import "../css/style.css";
import JoinForm from "../components/SpeakerJoinForm.js";
import PeerTiles from "../components/PeerTiles.js";
import ScreenShare from "../components/ScreenShearing.js";
import Controls from "../components/Controls.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import MainDiv from "../components/MainDiv.js";

import {
  HMSReactiveStore,
  selectPeers,
  selectIsConnectedToRoom,
  selectIsSomeoneScreenSharing,
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
  const [someoneSharing, setSomeoneSharing] = useState(false);
  const [messages, setMessages] = useState([]);
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

    const unsubSomeone = hmsStore.subscribe(
      setSomeoneSharing,
      selectIsSomeoneScreenSharing
    );
    const unsubMessages = hmsStore.subscribe(setMessages, selectHMSMessages);

    return () => {
      unsubPeers();
      unsubConnection();
      unsubSomeone();
      unsubMessages();
    };
  }, []);

  const leaveRoom = async () => {
    await hmsActions.leave();
    setPeers([]);
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
    <div className="speaker-page">
      {loading ? (
        <p>Loading speaker details...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : !speakerDetails?.success ? (
        <p>No speaker found.</p>
      ) : !connected ? (
        <JoinForm spekerDetails={speakerDetails} hmsActions={hmsActions} />
      ) : (
        <div className="speaker-conference">
          <PeerTiles hmsActions={hmsActions} hmsStore={hmsStore} />
          <MainDiv hmsStore={hmsStore} hmsActions={hmsActions} />
          <Controls hmsStore={hmsStore} hmsActions={hmsActions} />

          {/* <div className="chat">
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
          </div> */}
        </div>
      )}
    </div>
  );
}

export default SpeakerJoin;
