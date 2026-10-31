"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const textFieldStyles = {
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "#aaa" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#555" },
    "&:hover fieldset": { borderColor: "#777" },
    "&.Mui-focused fieldset": { borderColor: "#00c853" },
  },
  backgroundColor: "#333",
  borderRadius: "4px",
};

const ClassSubjectSelect = ({ schoolId, branchId, value, onChange }) => {
  const [classSubjects, setClassSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = Cookies.get("token");

  useEffect(() => {
    const fetchClassSubjects = async () => {
      if (!schoolId || !branchId || !token) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/class-subjects/select_by_sch_branch_id`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { schoolId, branchId },
        });

        if (!Array.isArray(response.data)) {
          throw new Error("Invalid API response structure");
        }

        const formatted = response.data.map((item) => ({
          id: item.id,
          name: `${item.class.name}${item.class.section ? ` - ${item.class.section}` : ''} - ${item.subject.name}`,
        }));

        setClassSubjects(formatted);
      } catch (error) {
        console.error("Error fetching class subjects:", error);
        toast.error("❌ Error fetching class subjects.");
      } finally {
        setLoading(false);
      }
    };

    fetchClassSubjects();
  }, [schoolId, branchId, token]);

  return (
    <FormControl sx={textFieldStyles} fullWidth margin="normal" disabled={loading}>
      <InputLabel>Select Class Subject</InputLabel>
      <Select value={value || ""} onChange={onChange}>
        <MenuItem value="" disabled>Select a class and subject</MenuItem>
        {classSubjects.map((classSubject) => (
          <MenuItem key={classSubject.id} value={classSubject.id}>
            {classSubject.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ClassSubjectSelect;
