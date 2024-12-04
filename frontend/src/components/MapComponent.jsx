import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAuth } from "../storeing-data/auth"; // Import the AuthContext

const MapComponent = () => {
  const { authorizationToken } = useAuth(); // Access the authorizationToken from AuthContext
  const [drivers, setDrivers] = useState([]); // State to store the drivers' location
  const [userLocation, setUserLocation] = useState(null); // State to store the user's location
  const [isUserOnline, setIsUserOnline] = useState(false); // State to track user's online status
  const [mapCenter, setMapCenter] = useState([21.2168, 81.4292]); // Default map center

  const [lastLocationUpdate, setLastLocationUpdate] = useState(Date.now()); // Track last location update time
  const [locationTimeout, setLocationTimeout] = useState(null); // Timeout to check inactivity

  // Function to fetch drivers' locations
  const updateDriversLocation = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/get-drivers");
      const data = await response.json();
      if (data && data.drivers) {
        // Filter only online drivers
        const onlineDrivers = data.drivers.filter((driver) => driver.isOnline);
        setDrivers(onlineDrivers);
      } else {
        console.error("No drivers data found");
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  // Fetch drivers on initial load and update every 1 second
  useEffect(() => {
    updateDriversLocation();

    const intervalId = setInterval(updateDriversLocation, 300);

    return () => {
      clearInterval(intervalId);
    };
  }, []); // Runs once when the component mounts

  // Function to update user's location and send it to backend
  const updateUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("User location:", latitude, longitude); // Debugging log

          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]); // Update map center to user's location
          setIsUserOnline(true); // Mark user as online

          // Update the last location update time
          setLastLocationUpdate(Date.now());

          // Reset inactivity timer whenever a location is received
          if (locationTimeout) {
            clearTimeout(locationTimeout);
          }

          // Send updated location to the backend
          try {
            const response = await fetch('http://localhost:8080/api/auth/update-location', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': authorizationToken, // Pass the token directly without "Bearer" prefix
              },
              body: JSON.stringify({ lat: latitude, lng: longitude }),
            });

            const data = await response.json();
            if (response.ok) {
              console.log("Location updated successfully");
            } else {
              console.error("Failed to update location:", data.error);
            }
          } catch (error) {
            console.error("Error sending location to backend:", error);
          }
        },
        (error) => {
          console.error("Error getting geolocation: ", error);
        }
      );
    }
  };

  // Handle user inactivity (offline logic)
  useEffect(() => {
    // If the last location update was more than 1 minute ago, mark user as offline
    const checkInactivity = () => {
      if (Date.now() - lastLocationUpdate > 60000) { // 1 minute
        setIsUserOnline(false);
        console.log("User is offline");
      }
    };

    const timeoutId = setInterval(checkInactivity, 1000); // Check every second

    // Cleanup the interval when the component unmounts
    return () => {
      clearInterval(timeoutId);
    };
  }, [lastLocationUpdate]);

  // Update user's location every 1 second
  useEffect(() => {
    const locationIntervalId = setInterval(updateUserLocation, 1000);

    // Cleanup the interval when the component unmounts
    return () => {
      clearInterval(locationIntervalId);
    };
  }, [authorizationToken]); // Make sure to use authorizationToken as a dependency

  // Common marker icon for both user and drivers
  const commonMarkerIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
      />

      {/* Show user's location marker */}
      {userLocation && (
        <Marker position={userLocation} icon={commonMarkerIcon}>
          <Popup>
            <strong>Your Location</strong><br />
            Latitude: {userLocation[0]}<br />
            Longitude: {userLocation[1]}<br />
            Status: {isUserOnline ? "Online" : "Offline"}
          </Popup>
        </Marker>
      )}

      {/* Show drivers' location markers */}
      {drivers.length === 0 ? (
        <div>No online drivers found</div>
      ) : (
        drivers.map((driver) => {
          const driverLat = driver.location.coordinates[1];
          const driverLon = driver.location.coordinates[0];

          return (
            <Marker key={driver._id} position={[driverLat, driverLon]} icon={commonMarkerIcon}>
              <Popup>
                <strong>{driver.name}</strong><br />
                Phone: {driver.phone}
              </Popup>
            </Marker>
          );
        })
      )}
    </MapContainer>
  );
};

export default MapComponent;
