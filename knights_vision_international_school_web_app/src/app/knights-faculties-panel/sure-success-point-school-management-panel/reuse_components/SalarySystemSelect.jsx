import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useState } from "react";
import textDisabledFieldStyles from "../../../mui_styles/TextDisableFieldStyles";

const salarySystems = [
  "Daily Wage",
  "Weekly Wage",
  "Bi-Weekly Payment",
  "Monthly Salary",
  "Per Shift Basis",
  "Hourly Rate",
  "Project-Based",
  "Commission-Based",
  "Fixed + Commission",
  "Performance Based",
  "Incentive Driven",
  "Freelancer Pay",
  "Internship Stipend",
  "Profit Sharing",
  "Stock Options",
  "Royalty Based",
  "Bonus Only",
  "Contractual Fixed",
  "Task-Based Pay",
  "Hybrid Model"
];

const ReusableSalaryTypeSelect = ({ selectedSalaryType, setSelectedSalaryType }) => {
  return (
    <FormControl sx={textDisabledFieldStyles} fullWidth margin="normal">
      <InputLabel>Salary Type</InputLabel>
      <Select
        value={selectedSalaryType}
        onChange={(e) => setSelectedSalaryType(e.target.value)}
        label="Salary Type"
      >
        {salarySystems.map((type, index) => (
          <MenuItem key={index} value={type}>
            {type}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ReusableSalaryTypeSelect;
