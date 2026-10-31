
const formatLocalTimeOnly = (timeString) => {
  if (!timeString) return "N/A";
  return new Date(timeString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // or false for 24-hour format
  });
};
export default formatLocalTimeOnly; 
