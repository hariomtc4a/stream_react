import { useLoaderData } from "react-router-dom";
import Hls from "hls.js";
import React, { useEffect, useRef, useState } from "react";
// import style from "../css/PlayStream.module.css";

async function getStreamDetail(p_id) {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/getRooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ streamKey: p_id }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    console.log("Stream API Response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching stream details:", error);
    throw error;
  }
}

function VideoStream({ streamDetailsData }) {
  const videoRef = useRef(null);

  useEffect(() => {    
    if (!streamDetailsData?.stream_key) return;
    const video = videoRef.current;
    const streamServerUrl = process.env.REACT_APP_STREAM_SERVER_URL || "http://localhost:8088";
    // const streamServerUrl = "http://128.199.16.212";
    const videoSrc = `${streamServerUrl}/hls/${streamDetailsData.stream_key}.m3u8`;
    console.log(videoSrc);
    
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((err) => console.warn("Autoplay blocked:", err));
      });
      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSrc;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
    }
  }, [streamDetailsData]);

  return (
    <video ref={videoRef} controls autoPlay muted className="video-ele"/>
  );
}

function PlayStream() {
  const { p_id } = useLoaderData();
  const [streamDetails, setStreamDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStreamDetails = async () => {
      try {
        const details = await getStreamDetail(p_id);
        setStreamDetails(details);
      } catch (err) {
        setError("Failed to load stream details");
      } finally {
        setLoading(false);
      }
    };
    fetchStreamDetails();
  }, [p_id]);

  if (loading) return <p>Loading stream details...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!streamDetails?.success) return <p>Something went wrong.</p>;

  const streamData = streamDetails.data;
  const now = new Date();
  const startTime = new Date(streamData.start_time);

  console.log(streamData);
  

  // Only play if stream has started
  if(streamData.status == 0){
    return (
      <div className="play-stream-page">
        <p>
          Stream not available or disabled
        </p>
      </div>
    );
  } else if (now <= startTime) {
    return (
      <div className="play-stream-page">
        <p>
          Stream will start at: {startTime.toLocaleString()} (Current time:{" "}
          {now.toLocaleString()})
        </p>
      </div>
    );
  } else {
    return (
      <div className="play-stream-page">
        <VideoStream streamDetailsData={streamData}/>
      </div>
    );
  }
}

export default PlayStream;
