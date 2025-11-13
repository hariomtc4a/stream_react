import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/HostComponents/Header";
import Footer from "../../components/HostComponents/Snackbar";

function AddRoomModal({ getRooms }) {
  const [open, setOpen] = useState(false);
  const [room, setRoom] = useState({
    title: "",
    startTime: "",
    endTime: ""
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
    if ((room.startTime.trim() && room.endTime.trim()) && start >= end) {
      errors.push("Start time must be earlier than end time");
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/createRoom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: room.title,
          startTime: room.startTime,
          endTime: room.endTime,
          hostId: 1
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setFormErrors(["Something went wrong, please try again"]);
        console.error("Server error:", data);
      } else {
        setOpen(false);
        setRoom({
          title: "",
          startTime: "",
          endTime: "",
          name: "",
          email: "",
        });
        setFormErrors([]);
        await getRooms(); // refresh room list

      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setFormErrors([error.message]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <span className="th-btn" onClick={() => setOpen(true)}>
        <i className="bi bi-plus-lg"></i> Room
      </span>

      <div className={`modal fade ${open ? "show d-block" : ""}`} tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-body">
              <div className="d-flex px-2 py-1 justify-content-end">
                <button type="button" className="th-btn close" onClick={() => setOpen(false)}>
                  <span>&times;</span>
                </button>
              </div>

              <h5 className="py-2">Room details</h5>

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
                  {loading ? "Saving..." : "Done"}
                </button>
                <button type="button" className="th-btn" onClick={() => setOpen(false)}>
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


const fetchRooms = async () => {
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
};

function Rooms() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [snack, setSnack] = useState({ open: false, message: "", type: "" });

  const showSnackbar = (message, type) => {
    setSnack({ open: true, message, type });
  };


  const getRoomDetails = (roomId) => {
    navigate(`/host-panel/room/${roomId}`);
  };

  const getRooms = async () => {
    try {
      const details = await fetchRooms();
      setRooms(details);
      showSnackbar("This is a warning!", "warning");
    } catch (err) {
      console.error(err);
      setError("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      <Header title={"Rooms"} user={"Hariom"} />
      <div className="host-content">
        <div className="host-room-page">

          <div className="d-flex justify-content-end p-3">
            <AddRoomModal getRooms={getRooms} />
          </div>

          <table>
            <thead>
              <tr>
                <th>Stream Key</th>
                <th>Schedule</th>
                <th>Created On</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(rooms.data).map(([roomId, roomInfo]) => {
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
                  <tr key={roomId}>
                    <td>
                      {roomInfo.title}
                      <br />
                      <small>{roomInfo.stream_key}</small>
                    </td>
                    <td>
                      From <strong>{startDate}</strong>
                      <br />
                      To <strong>{endDate}</strong>
                    </td>
                    <td>{createdDate}</td>
                    <td>{roomInfo.status ? <span className="badge text-bg-success">Enabled</span> : <span className="badge text-bg-danger">Disabled</span> }</td>
                    <td>
                      <button
                        onClick={() => getRoomDetails(roomInfo.stream_key)}
                      >
                        <i className="bi bi-arrow-up-right-square"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Rooms;
