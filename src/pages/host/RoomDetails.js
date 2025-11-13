import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/HostComponents/Header";

function RtmpToggleSwitch({ roomInfo }) {
  const roomId = roomInfo.room_id;
  const streamKey = roomInfo.stream_key;
  const [isOn, setIsOn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch initial status from the API
  useEffect(() => {
    setIsOn(roomInfo.streaming_on_rtmp == 1);
    setLoading(false);
  }, []);

  // Handle toggle switch
  const handleToggle = async () => {
    setLoading(true);

    const newStatus = !isOn ? "start" : "stop";
    setIsOn(!isOn);

    try {
      await fetch(`${process.env.REACT_APP_API_URL}/rtmpStream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          roomId: roomId,
          streamKey: streamKey,
        }),
      });
      setLoading(false);
    } catch (error) {
      console.error("Error updating status:", error);
      // Optionally revert if request fails
      // setIsOn(isOn);
    }
  };

  if (loading) return <p>Loading status...</p>;

  return (
    <div className="rtmp-button">
      <div
        className="d-flex align-items-center"
        style={{ borderRight: "1px solid #191b23" }}
      >
        <span>RTMP: &nbsp;</span>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            checked={isOn}
            role="switch"
            onChange={handleToggle}
          />
        </div>
      </div>
      <div className="ps-2">
        {isOn ? (
          <span className="rtmp-live-on">On air</span>
        ) : (
          <span className="rtmp-live-off">Off</span>
        )}
      </div>
    </div>
  );
}

function StatusToggleSwitch({ roomInfo }) {
  const roomId = roomInfo.room_id;
  const streamKey = roomInfo.stream_key;
  const [isOn, setIsOn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch initial status from the API
  useEffect(() => {
    setIsOn(roomInfo.status == 1);
    setLoading(false);
  }, []);

  // Handle toggle switch
  const handleToggle = async () => {
    setLoading(true);

    const newStatus = !isOn ? "enabled" : "disabled";
    setIsOn(!isOn);

    try {
      await fetch(`${process.env.REACT_APP_API_URL}/changeRoomStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          streamKey: streamKey,
        }),
      });
      setLoading(false);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) return <p>Loading status...</p>;

  return (
    <div className="d-flex align-items-center">
      <span>Status: &nbsp;</span>
      <div className="form-check form-switch">
        <input className="form-check-input" type="checkbox" checked={isOn} role="switch" onChange={handleToggle}/>
      </div>
      <div className="ps-2">
        {isOn ? (
          <span className="badge text-bg-success">Enabled</span>
        ) : (
          <span className="badge text-bg-danger">Disabled</span>
        )}
      </div>
    </div>
  );
}

function AddSpeakerModal({ roomInfo, fetchRoomDetails }) {
  const [open, setOpen] = useState(false);
  const [speaker, setSpeaker] = useState({ name: "", email: "" });
  const [formErrors, setFormError] = useState([]);

  const handleChange = (e) => {
    setSpeaker({ ...speaker, [e.target.name]: e.target.value });
    setFormError([]);
  };

  const handleSubmit = async () => {
    let fError = [];
    if (speaker.name === "") fError.push("name is required");
    if (speaker.email === "") fError.push("email is required");

    if (fError.length > 0) {
      setFormError(fError);
    } else {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/addSpeaker`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              streamKey: roomInfo.stream_key,
              name: speaker.name,
              email: speaker.email,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Response from server:", data);
        if (data.success) {
          await fetchRoomDetails(roomInfo.stream_key);
          // await fetchRoomDetails(roomInfo.stream_key);
        } else {
          fError.push("Something went wrong");
          setFormError(fError);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
        return { success: false, message: error.message };
      }
      console.log("Speaker submitted:", speaker, "Room:", roomInfo);
      setOpen(false);
      setSpeaker({ name: "", email: "" });
      setFormError([]);
    }
  };

  return (
    <>
      &nbsp;&nbsp;
      <span className="th-btn" onClick={() => setOpen(true)}>
        <i className="bi bi-plus-lg"></i>
      </span>
      <div
        className={`modal fade ${open ? "show d-block" : ""}`}
        tabIndex="-1"
        role="dialog"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-body">
              <div className="d-flex px-2 py-1 justify-content-end">
                <button
                  type="button"
                  className="th-btn close"
                  onClick={() => setOpen(false)}
                >
                  <span>&times;</span>
                </button>
              </div>

              <h5 className="py-2">Speaker details</h5>

              <div className="th-input-group">
                <label className="th-form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  value={speaker.name}
                  onChange={handleChange}
                  className="th-form-control"
                />
              </div>

              <div className="th-input-group">
                <label className="th-form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={speaker.email}
                  onChange={handleChange}
                  className="th-form-control"
                />
              </div>

              <div className="px-2 py-3">
                <ul>
                  {formErrors.map((error, index) => (
                    <li key={index} className="text-danger">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="d-flex px-2 py-1 justify-content-end gap-2">
                <button
                  type="button"
                  className="th-btn btn-th-primary"
                  onClick={handleSubmit}
                >
                  Done
                </button>
                <button
                  type="button"
                  className="th-btn"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function EditRoomModal({ roomInfo, fetchRoomDetails }) {
  const [open, setOpen] = useState(false);
  const [room, setRoom] = useState({
    streamKey: roomInfo?.stream_key || "",
    title: roomInfo?.title || "",
    startTime: roomInfo?.start_time || "",
    endTime: roomInfo?.end_time || "",
  });
  const [formErrors, setFormErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setRoom({ ...room, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const errors = [];
    if (!room.title.trim()) errors.push("Title is required");
    if (!room.startTime.trim()) errors.push("Start time is required");
    if (!room.endTime.trim()) errors.push("End time is required");

    const start = new Date(room.startTime);
    const end = new Date(room.endTime);
    if (room.startTime.trim() && room.endTime.trim() && start >= end) {
      errors.push("Start time must be earlier than end time");
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/updateRoom`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: room.id,
            title: room.title,
            start_time: room.startTime,
            end_time: room.endTime,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setOpen(false);
        setFormErrors([]);
        await fetchRoomDetails(roomInfo.stream_key);
      } else {
        setFormErrors(["Something went wrong, please try again"]);
        console.error("Server error:", data);
      }
    } catch (error) {
      console.error("Error updating room:", error);
      setFormErrors([error.message]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setRoom({
      id: roomInfo?.id || "",
      title: roomInfo?.title || "",
      startTime: roomInfo?.start_time || "",
      endTime: roomInfo?.end_time || "",
    });
    setOpen(true);
  };

  return (
    <>
      <span className="th-btn" onClick={openModal}>
        <i className="bi bi-pencil"></i>
      </span>

      <div
        className={`modal fade ${open ? "show d-block" : ""}`}
        tabIndex="-1"
        role="dialog"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-body">
              <div className="d-flex px-2 py-1 justify-content-end">
                <button
                  type="button"
                  className="th-btn close"
                  onClick={() => setOpen(false)}
                >
                  <span>&times;</span>
                </button>
              </div>

              <h5 className="py-2">Edit Room</h5>

              <div className="th-input-group">
                <label className="th-form-label">Title</label>
                <input
                  type="text"
                  name="title"
                  value={room.title}
                  onChange={handleChange}
                  className="th-form-control"
                />
              </div>

              <div className="th-input-group">
                <label className="th-form-label">Start Time</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={room.startTime}
                  onChange={handleChange}
                  className="th-form-control"
                />
              </div>

              <div className="th-input-group">
                <label className="th-form-label">End Time</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={room.endTime}
                  onChange={handleChange}
                  className="th-form-control"
                />
              </div>

              {formErrors.length > 0 && (
                <div className="px-2 py-3">
                  <ul>
                    {formErrors.map((error, index) => (
                      <li key={index} className="text-danger">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="d-flex px-2 py-1 justify-content-end gap-2">
                <button
                  type="button"
                  className="th-btn btn-th-primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="th-btn"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function RoomDetails() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchRoomDetails(roomId) {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/getRooms`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ streamKey: roomId }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setRoom(data);
        setLoading(false);
      } else {
        setError("Failed to load room details");
        console.error("Error fetching room:", error);
      }
    } catch (error) {
      setError("Failed to load room details");
      console.error("Error fetching room:", error);
      return { success: false, message: error.message };
    }
  }

  useEffect(() => {
    fetchRoomDetails(roomId);
  }, [roomId]);


  console.log(process.env.REACT_APP_URL);
  

  const surl = `${process.env.REACT_APP_URL || "http://localhost:3000"}`;
  const stream_url = `${surl}/play-stream?p_id=${roomId}`;

  
  // const stream_url = `http://localhost:3000/play-stream?p_id=${roomId}`;


  if (loading) {
    return <p>Loading room details...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!room?.success || !room?.data) {
    return <p>No details found for this room.</p>;
  }

  const roomInfo = room.data;
  const sdate = new Date(roomInfo.start_time);
  const startDate = sdate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const edate = new Date(roomInfo.end_time);
  const endDate = edate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const cdate = new Date(roomInfo.created_at);
  const createdDate = cdate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="hostPanel">
      <Header title={`Room`} user={"Hariom"} />

      <div className="host-content">
        <button className="th-btn" onClick={() => window.history.back()}>
          <i className="bi bi-arrow-left"></i> Back
        </button>
        <div className="host-room-details-page">
          <div className="d-flex">
            <div className="w-50">
              <div className="d-flex">
                <h2>{roomInfo.title} </h2>
                <EditRoomModal
                  roomInfo={roomInfo}
                  fetchRoomDetails={fetchRoomDetails}
                />
              </div>
              <p>
                <strong>Stream Key:</strong> {roomInfo.stream_key}
              </p>
            </div>
            <div className="w-50">
              <div style={{ float: "right" }}>
                <StatusToggleSwitch roomInfo={roomInfo} />
              </div>
            </div>
          </div>

          <div className="w-100 d-flex justify-content-center">
            <div className="w-50">
              <iframe
                className="stream-iframe"
                src={stream_url}
                title="description"
              ></iframe>
            </div>
            <div className="w-50 ps-2">
              <div>
                <h6 className="py-4">
                  <strong>{stream_url}</strong>
                </h6>
                <RtmpToggleSwitch roomInfo={roomInfo} />
                <p>
                  <strong>Start Time:</strong> {startDate}
                </p>
                <p>
                  <strong>End Time:</strong> {endDate}
                </p>
                <p>
                  <strong>Created On:</strong> {createdDate}
                </p>
                <p>
                  <strong>Description:</strong> {roomInfo.description || "N/A"}
                </p>
              </div>
              <div className="speaker pt-5">
                <strong>SPEAKERS</strong>
                <AddSpeakerModal
                  roomInfo={roomInfo}
                  fetchRoomDetails={fetchRoomDetails}
                />
                {/* <span className="th-btn">
                  <i className="bi bi-plus-lg"></i>
                </span> */}

                {roomInfo.speakers &&
                Object.entries(roomInfo.speakers).length > 0 ? (
                  Object.entries(roomInfo.speakers).map(
                    ([speakerId, speakerInfo]) => (
                      <div className="pt-3" key={speakerId}>
                        <strong>{speakerInfo.name}</strong>
                        <span>({speakerInfo.email})</span>
                        <p>
                          {surl}/speaker-join?s_id={speakerInfo.s_id}
                        </p>
                      </div>
                    )
                  )
                ) : (
                  <p className="pt-3 text-muted">No speakers added yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}

export default RoomDetails;
