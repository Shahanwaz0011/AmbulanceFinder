import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../storeing-data/auth";

const Login = () => {
  const [user, setUser] = useState({
    phone: "",
    password: "",
  });
  const [error, setError] = useState(null); // Track errors
  const navigate = useNavigate();
  const { storeTokenInLocalMem } = useAuth();

  const handleInput = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user.phone.trim() || !user.password.trim()) {
      setError("Phone number and password are required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const resData = await response.json();

      if (response.ok) {
        storeTokenInLocalMem(resData.token); // Store the received token
        setUser({ phone: "", password: "" }); // Clear form
        navigate("/"); // Redirect to home page
      } else {
        setError(resData.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.log(error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="parent-center">
      <section className="container">
        <h2 style={{ margin: "0.3em 0" }}>Welcome back!</h2>
        {error && <p style={{ color: "red" }}>{error}</p>} {/* Show error message */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={user.phone}
            onChange={handleInput}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={user.password}
            onChange={handleInput}
          />
          <button type="submit" style={{ marginTop: "2em" }}>
            Login
          </button>
        </form>
        <div style={{ display: "flex", flexDirection: "row", gap: "1em" }}>
          <p>Don't have an account?</p>
          <p className="bld">
            <Link className="li" to="/register">
              Register
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;
