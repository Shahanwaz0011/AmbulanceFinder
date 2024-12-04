import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../storeing-data/auth"; // Use Auth Context for token
import styles from "./ToggleStatus.module.css"; // Import CSS for styling

const ToggleStatus = ({ user }) => {
  const { authorizationToken } = useAuth(); // Get token from AuthContext
  const [isOnline, setIsOnline] = useState(user.isOnline); // Initialize state with user.isOnline
  const [loading, setLoading] = useState(false); // Track API call status
  const [error, setError] = useState(null); // Track errors

  const handleToggle = async () => {
    setLoading(true);
    setError(null);

    try {
      // Send the new status to the backend
      const response = await axios.patch(
        `http://localhost:8080/api/auth/driver/set-status/${user._id}`, // Use user._id
        { isOnline: !isOnline }, // Toggle the status
        {
          headers: {
            Authorization: authorizationToken, // Authorization header with token
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setIsOnline(!isOnline); // Update the state based on the response
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      setError("Failed to update status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.toggleContainer}>
      <label className={styles.toggleLabel}>
        <div className={styles.switch}>
          <input
            type="checkbox"
            checked={isOnline}
            onChange={handleToggle}
            disabled={loading}
            className={styles.toggleInput}
          />
          <span className={styles.slider}></span>
        </div>
      </label>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default ToggleStatus;
