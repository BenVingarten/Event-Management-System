export const getCurrTime = () => {
    const date = new Date();
    const options = {
      timeZone: "Asia/Jerusalem",
      hour12: false, // Ensure 24-hour format
      timeZoneName: "short", // Include time zone abbreviation
    };
    const myDate = date.toLocaleString("en-US", options);
    return new Date(myDate);
}