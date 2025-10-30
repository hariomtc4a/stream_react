import React, { useState, useEffect } from "react";

async function fetchRooms() {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/getRooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Response from server:", data);
    return data;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return { success: false, message: error.message };
  }
}

function Rooms() {
  const [rooms, setRooms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getRooms = async () => {
      try {
        const details = await fetchRooms();
        setRooms(details);
      } catch (err) {
        console.error(err);
        setError("Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };

    getRooms();
  }, []);

  if (loading) {
    return <p>Loading rooms...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!rooms?.success || !rooms?.data || Object.keys(rooms.data).length === 0) {
    return <p>No rooms found.</p>;
  }

  return (
    <div className="hostPanel">
      <h1>Rooms List</h1>
      <ul>
        {Object.entries(rooms.data).map(([roomId, roomInfo]) => (
          <li key={roomId}>
            <strong>Room ID:</strong> {roomId}
            <br />
            <strong>Info:</strong> {JSON.stringify(roomInfo)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Rooms;
