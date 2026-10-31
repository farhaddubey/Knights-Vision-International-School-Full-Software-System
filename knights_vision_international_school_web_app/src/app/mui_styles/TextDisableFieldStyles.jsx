


const textDisabledFieldStyles = {
  "& .MuiInputBase-root": {
    color: "#fff !important", // Force white text
    backgroundColor: "#111", // Dark background
    opacity: 1, // Override default opacity
  },
  "& .MuiInputLabel-root": {
    color: "#0091ea", // White label text
  },
  "& .Mui-disabled": {
    color: "#fff !important", // Ensures text color remains white when disabled
    WebkitTextFillColor: "#fff !important", // Fixes some browser inconsistencies
    opacity: 1, // Ensures full visibility
  },
  "& .MuiOutlinedInput-root": {
        "& textarea": {
          padding: "10px",
        },
        "& fieldset": {
          borderColor: "#1976d2",
        },
        "&:hover fieldset": {
          borderColor: "#1565c0",
        },
        "&.Mui-focused fieldset": {
          borderColor: "#0d47a1",
          borderWidth: "2px",
        },
      },
      "& label": {
        color: "#0d47a1",
        fontWeight: 500,
      },
};

export default textDisabledFieldStyles;