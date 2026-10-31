import textFieldStyles from "./TextFieldStyles";

const selectStyles = {
  ...textFieldStyles,
  "& .MuiSelect-select": {
    color: "#fff",
  },
  "& .MuiMenuItem-root": {
    backgroundColor: "#222",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#333",
    },
    "&.Mui-selected": {
      backgroundColor: "#444",
      color: "#fff",
    },
  },
};
export default selectStyles; 


    