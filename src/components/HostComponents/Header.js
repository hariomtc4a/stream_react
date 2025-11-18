import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function LogoutModal({ open, onClose, logout }) {
  if (!open) return null;

  return (
    <div className="header-host-toggle active">
      <div className="header-host-toggle-content">
        <div>
          <button className="th-btn btn-th-primary setting-button" onClick={onClose}><i className="bi bi-gear"></i> Settings</button>
        </div>
        <div>
          <button className="th-btn btn-th-danger logout-button" onClick={logout}><i className="bi bi-box-arrow-right"></i> Logout</button>
        </div>
      </div>
    </div>
  );
}

function Header({ title, user }) {
  const navigate = useNavigate();
  const [host, setHost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false); // for logout modal

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/hostAuthUnset`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        navigate("/host/login", { replace: true });
      } else {
        console.error("Server error:", data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getHostDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/getHostDetail`,
        {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      if (data.success) {
        setHost(data.data);
      } else {
        setError("Failed to load room details");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getHostDetail();
  }, []);

  if (loading) return <p>Loading the part...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
      <header>
        <div className="left">
          <div className="logo">
            <img
              src="https://medicallearninghub.com/assets/img/logo-white.png"
              alt="Logo"
            />
          </div>
          <div className="title">
            <h3>{title}</h3>
          </div>
        </div>

        <div className="center"></div>

        <div className="right">
          <div
            className="avatar cursor-pointer"
            onClick={() => setOpen(true)} // 👉 OPEN LOGOUT MODAL
          >
            <i className="bi bi-person-circle"></i>
          </div>

          <h6 className="user-name">
            Hi, {host.first_name + " " + host.last_name}
          </h6>
          <LogoutModal open={open} onClose={() => setOpen(false)} logout={handleLogout}/>
        </div>
      </header>

      {/* Logout Modal */}
    </>
  );
}

export default Header;
