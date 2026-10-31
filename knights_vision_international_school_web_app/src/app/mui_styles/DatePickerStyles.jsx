const datePickerStyles = {
  "& .MuiInputBase-input": {
    color: "#00c757", // green text (typed date or value)
  },
  "& input": {
    color: "#00c757", // force date visibility
  },
  "& .MuiInputLabel-root": {
    color: "#aaa",
  },
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#222",
    "& fieldset": {
      borderColor: "#555",
    },
    "&:hover fieldset": {
      borderColor: "#777",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#00c757",
    },
  },
  "& .MuiSvgIcon-root": {
    color: "#fff",
  },
  "& .MuiInputAdornment-root": {
    color: "#fff",
  },
};

export default datePickerStyles; 