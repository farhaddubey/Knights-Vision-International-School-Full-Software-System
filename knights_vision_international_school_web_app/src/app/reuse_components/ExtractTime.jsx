const extractTime = (dateString) => {
  if (!dateString) return "N/A";

  const timePart = dateString.split("T")[1]; // e.g., "07:00:00.000Z"
  if (!timePart) return "N/A";

  const [hourStr, minuteStr] = timePart.split(":"); // ["07", "00"]
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (isNaN(hour) || isNaN(minute)) return "N/A";

  const isPM = hour >= 12;
  const formattedHour = hour % 12 || 12; // Convert to 12-hour format
  const formattedMinute = minute < 10 ? `0${minute}` : `${minute}`; // ✅ FIX HERE
  const ampm = isPM ? "PM" : "AM";

  return `${formattedHour}:${formattedMinute} ${ampm}`;
};

export default extractTime;
