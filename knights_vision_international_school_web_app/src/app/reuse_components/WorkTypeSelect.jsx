import axios from "axios";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { TextField, MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import textFieldStyles from "../../../mui_styles/TextFieldStyles";
import textDisabledFieldStyles from "../../../mui_styles/TextDisableFieldStyles";

const ReusableWorkTypeSelect = ({ value, selectedFactory, setSelectedFactory}) => {
  const [factories, setFactories] = useState([]);
  const token = Cookies.get("token");

  const fetchFactories = async () => {
    try {
      const response = await axios.get(`/api/work_type/id_name`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      console.log(data);  
      if (!Array.isArray(data)) {
        throw new Error("Invalid API response structure");
      }

      const formatted = data.map((item) => ({
        id: item.id, // Ensure this matches your backend data
        name: item.type_name,
      }));

      setFactories(formatted);
    } catch (error) {
      console.error("Error fetching factories:", error);
    }
  };
  useEffect(() => {
    fetchFactories();
  }, [token]);

  return (
       <FormControl sx={textDisabledFieldStyles} fullWidth margin="normal">
              <InputLabel>Assigned Work Type</InputLabel>
              <Select value={selectedFactory} onChange={(e) => setSelectedFactory(e.target.value)}>
                  {factories.map((factory) => (
                    <MenuItem key={factory.id} value={factory.id}>
                      {factory.name}
                    </MenuItem>
                  ))}
              </Select>
        </FormControl>
  );
};

export default ReusableWorkTypeSelect;
