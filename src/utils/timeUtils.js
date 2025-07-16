// src/utils/timeUtils.js

/**
 * Converts a time string (e.g., "07:00 AM", "01:30 PM") into total minutes from midnight.
 */
export const timeToMinutes = (timeStr) => {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

/**
 * Converts total minutes from midnight back into a formatted time string.
 */
export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMins = mins < 10 ? `0${mins}` : mins;
  return `${displayHours}:${displayMins} ${period}`;
};

/**
 * Generates an array of 30-min time slots from 7:00 AM to 9:00 PM.
 */
export const generateTimeSlots = () => {
  const slots = [];
  for (let i = timeToMinutes('07:00 AM'); i <= timeToMinutes('09:00 PM'); i += 30) {
    slots.push(minutesToTime(i));
  }
  return slots;
};

export const allTimeSlots = generateTimeSlots();