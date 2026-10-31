  const textFieldStyles = {
      "& .MuiInputBase-root": {
        color: "#fff !important", // Force white text
        backgroundColor: "#111", // Dark background
        opacity: 1, // Override default opacity
      },
      "& .MuiInputLabel-root": {
        color: "#fff", // White label text
      },
      "& .Mui-disabled": {
        color: "#fff !important", // Ensures text color remains white when disabled
        WebkitTextFillColor: "#fff !important", // Fixes some browser inconsistencies
        opacity: 1, // Ensures full visibility
      },
    };

    export default textFieldStyles;


    