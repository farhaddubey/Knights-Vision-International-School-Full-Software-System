import axios from "axios";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const ReusableDriverSelect = ({ selectedDriver, setSelectedDriver, drivers }) => {
  const [driverList, setDriverList] = useState([]);
  const token = Cookies.get("token");

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await axios.get("/api/users/driver-role", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;
        if (!Array.isArray(data)) {
          throw new Error("Invalid API response structure");
        }

        const formatted = data.map((item) => ({
          id: item.id,
          username: item.username,
        }));

        setDriverList(formatted);
      } catch (error) {
        console.error("Error fetching drivers:", error);
        toast.error("Failed to fetch drivers.");
      }
    };

    // Use provided drivers prop if available, otherwise fetch from API
    if (drivers && drivers.length > 0) {
      setDriverList(drivers.map((item) => ({
        id: item.id,
        username: item.username,
      })));
    } else {
      fetchDrivers();
    }
  }, [token, drivers]);

  return (
    <FormControl
      fullWidth
      margin="normal"
      sx={{
        "& .MuiInputLabel-root": { color: "#fff" }, // White label text
        "& .MuiInputLabel-root.Mui-focused": { color: "#fff" }, // White label text when focused
        "& .MuiOutlinedInput-root": {
          color: "#fff", // White input text
          "& fieldset": { borderColor: "#555" }, // Dark border
          "&:hover fieldset": { borderColor: "#888" }, // Lighter border on hover
          "&.Mui-focused fieldset": { borderColor: "#888" }, // Lighter border when focused
          backgroundColor: "#282828", // Dark background
        },
        "& .MuiSelect-icon": { color: "#fff" }, // White dropdown icon
      }}
    >
      <InputLabel>Driver Assigned</InputLabel>
      <Select
        value={selectedDriver?.id || ""}
        onChange={(e) => {
          const selectedId = e.target.value;
          const selected = driverList.find((driver) => driver.id === selectedId);
          setSelectedDriver(selected || null);
        }}
        sx={{ color: "#fff" }} // White text for selected value
      >
        {driverList.map((driver) => (
          <MenuItem key={driver.id} value={driver.id}>
            {driver.username}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ReusableDriverSelect;