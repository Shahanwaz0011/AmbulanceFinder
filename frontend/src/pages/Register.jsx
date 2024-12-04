import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Register = () => {
  const [user, setUser] = useState({
    name: "",
    phone: "",
    password: "",
    type: "user", // Default type; can be changed via dropdown
  });

  const handleInput = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        // Reset form and navigate to login
        setUser({ name: "", phone: "", password: "", type: "user" });
        navigate("/login");
      } else {
        const data = await response.json();
        console.error("Registration error:", data.message);
        alert(data.message); // Provide feedback to the user
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="parent-center">
      <section className="container">
        <div>
          <h2 style={{ margin: "0.3em 0" }}>Register Here</h2>
          <form onSubmit={handleSubmit}>
          <select
              name="type"
              value={user.type}
              onChange={handleInput}
              required
            >
              <option value="user">User</option>
              <option value="driver">Driver</option>
            </select>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              autoComplete="off"
              value={user.name}
              onChange={handleInput}
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              autoComplete="off"
              value={user.phone}
              onChange={handleInput}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="off"
              value={user.password}
              onChange={handleInput}
              required
            />
           
            <button style={{ marginTop: "2em" }} type="submit">
              Register
            </button>
          </form>
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "1em" }}>
          <p>Already have an account?</p>
          <p className="bld">
            <Link className="li" to="/login">
              Login
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Register;
