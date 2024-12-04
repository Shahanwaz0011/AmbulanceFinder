import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../storeing-data/auth"; // Assuming you have an auth context or hook
import styles from "./Nav.module.css"; // Import styling for the Nav
import ToggleStatus from "./ToggleStatus";

const Navbar = () => {
  const { user } = useAuth(); // Assuming useAuth provides user and login/logout functions

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/" className={styles.logoText}>
          Ambulance Tracker
        </Link>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginRight: "1em" }}>
        <div className={styles.menu}>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/services">Services</Link>
            </li>
          </ul>
        </div>
        <div className={styles.btn}>
          {/* Check if the user type is driver, then show ToggleStatus */}
          {user && user.type === "driver" && <ToggleStatus user={user} />}
          
          {user ? (
            <Link to="/logout" className={styles.navLink}>
              <button className={styles.loginButton}>Logout</button>
            </Link>
          ) : (
            <Link to="/login" className={styles.navLink}>
              <button className={styles.loginButton}>Login</button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
