import { useState } from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import textDisabledFieldStyles from "@/src/app/mui_styles/TextDisableFieldStyles";

const departments = [
  "ACADEMIC",
  "ADMINISTRATION",
  "DISTRICT_CONTROLLER",
  "STATE_CONTROLLER",
  "EXTRACURRICULAR",
  "SPECIAL_EDUCATION",
  "VOCATIONAL_TRAINING",
  "GUIDANCE_COUNSELING",
  "LIBRARY_SERVICES",
  "TECHNICAL_SUPPORT",
  "STUDENT_WELFARE",
  "INTERN_FACULTY",
];
const DepartmentSelect = ({ selectedDepartment, setSelectedDepartment, setSelectedRole }) => {
  return (
    <FormControl sx={textDisabledFieldStyles} fullWidth margin="normal">
      <InputLabel>Department</InputLabel>
      <Select
        value={selectedDepartment}
        onChange={(e) => {
          setSelectedDepartment(e.target.value);
          setSelectedRole(""); // Reset role when department changes
        }}
        label="Department"
      >
        <MenuItem value="">
          <em>Select a department</em>
        </MenuItem>
        {Object.keys(departments).map((dept) => (
          <MenuItem key={dept} value={departments[dept]}>
            {departments[dept]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
export default DepartmentSelect;
