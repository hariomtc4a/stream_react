import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let fError = [];
    if (!email) fError.push("name is required");
    if (!password) fError.push("password is required");
    if (fError.length > 0) {
      setErrors(fError);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.token) {
        setErrors([]);
        navigate("/host/rooms", { replace: true });
      } else {
        setErrors([data.error]);
        console.error("Server error:", data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error updating room:", error);
      setErrors([error.message]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading form</p>;
  } else {
    return (
      <div className="hostPanel">
        <div className="host-login-page">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2 className="login-title">Host Login</h2>

            <div className="th-input-group">
              <label className="th-form-label">Email</label>
              <input
                type="text"
                placeholder="Enter email"
                value={email}
                className="th-form-control"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="th-input-group">
              <label className="th-form-label">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                className="th-form-control"
                onChange={(e) => setPassword(e.target.value)}
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

            <button className="th-btn btn-th-primary" type="submit">
              Login{" "}
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default LoginPage;
