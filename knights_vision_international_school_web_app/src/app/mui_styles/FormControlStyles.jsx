const formControlStyles = {
  "& .MuiInputBase-root": {
    color: "#fff", // Input text color
    backgroundColor: "#222", // Input background color
  },
  "& .MuiInputLabel-root": {
    color: "#fff", // Label text color
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#666", // Border color
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#bbb", // Border color on hover
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#2196F3", // Highlight border color when focused
  },
};

export default formControlStyles;
