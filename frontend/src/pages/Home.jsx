import React from "react";
import MapComponent from "../components/MapComponent";
import { useAuth } from "../storeing-data/auth"; // Import the useAuth hook
import styles from "./Home.module.css"; // Import the CSS module for styling

const Home = () => {
  const { user } = useAuth(); // Get the user data from the context

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Welcome to the Ambulance Tracker</h1>
        {user ? (
          <p className={styles.userGreeting}>Welcome, {user.name}!</p>
        ) : (
          <p className={styles.loadingText}>Available Ambulance in your nearby :</p>
        )}
      </header>

      <section className={styles.infoSection}>
        <p className={styles.infoText}>Track the real-time location of drivers in your area.</p>
      </section>

      {/* Render MapComponent inside the container */}
      <section className={styles.mapContainer}>
        <MapComponent />
      </section>
    </div>
  );
};

export default Home;
