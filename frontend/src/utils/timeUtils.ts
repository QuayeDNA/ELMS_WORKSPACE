/**
 * Time utility functions for handling time formats in the exam timetable
 */

/**
 * Extracts time in HH:MM format from an ISO datetime string
 * @param isoDateTime - ISO datetime string (e.g., "2026-03-10T09:00:00.000Z")
 * @returns Time in HH:MM format (e.g., "09:00")
 */
export function extractTimeFromISO(isoDateTime: string | null | undefined): string {
  if (!isoDateTime) return '';

  try {
    const date = new Date(isoDateTime);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Error extracting time from ISO:', error);
    return '';
  }
}

/**
 * Formats time from HH:MM to 12-hour format with AM/PM
 * @param time - Time in HH:MM format (e.g., "09:00" or "14:30")
 * @returns Time in 12-hour format (e.g., "9:00 AM" or "2:30 PM")
 */
export function formatTimeToAMPM(time: string | null | undefined): string {
  if (!time) return '';

  try {
    const [hours, minutes] = time.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes)) return time;

    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for midnight

    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Error formatting time to AM/PM:', error);
    return time;
  }
}

/**
 * Converts HH:MM time to ISO datetime string by combining with a date
 * @param date - Date string in YYYY-MM-DD format
 * @param time - Time in HH:MM format
 * @returns ISO datetime string (e.g., "2026-03-10T09:00:00.000Z")
 */
export function combineDateTime(date: string, time: string): string {
  if (!date || !time) return '';

  try {
    // Parse the date and time
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);

    // Create a date object in local timezone
    const dateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

    // Return ISO string
    return dateTime.toISOString();
  } catch (error) {
    console.error('Error combining date and time:', error);
    return '';
  }
}

/**
 * Calculates end time based on start time and duration
 * @param startTime - Start time in HH:MM format
 * @param durationMinutes - Duration in minutes
 * @returns End time in HH:MM format
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  if (!startTime || !durationMinutes) return '';

  try {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;

    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;

    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error calculating end time:', error);
    return '';
  }
}
