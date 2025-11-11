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
 * @param date - Date string in YYYY-MM-DD format or ISO string
 * @param time - Time in HH:MM format
 * @returns ISO datetime string (e.g., "2026-03-10T09:00:00.000Z")
 */
export function combineDateTime(date: string, time: string): string {
  if (!date || !time) {
    console.warn('combineDateTime: Missing date or time', { date, time });
    return '';
  }

  try {
    // If date is an ISO string, extract just the date part (YYYY-MM-DD)
    let dateStr = date;
    if (date.includes('T')) {
      // Extract date part from ISO string (e.g., "2026-01-08T00:00:00.000Z" -> "2026-01-08")
      dateStr = date.split('T')[0];
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      console.error('combineDateTime: Invalid date format', { date, dateStr, expected: 'YYYY-MM-DD' });
      return '';
    }

    // Validate time format (HH:MM)
    if (!/^\d{1,2}:\d{2}$/.test(time)) {
      console.error('combineDateTime: Invalid time format', { time, expected: 'HH:MM' });
      return '';
    }

    // Parse the date and time
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);

    // Validate parsed values
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
      console.error('combineDateTime: Invalid numeric values', { year, month, day, hours, minutes });
      return '';
    }

    if (month < 1 || month > 12) {
      console.error('combineDateTime: Invalid month', { month });
      return '';
    }

    if (day < 1 || day > 31) {
      console.error('combineDateTime: Invalid day', { day });
      return '';
    }

    if (hours < 0 || hours > 23) {
      console.error('combineDateTime: Invalid hours', { hours });
      return '';
    }

    if (minutes < 0 || minutes > 59) {
      console.error('combineDateTime: Invalid minutes', { minutes });
      return '';
    }

    // Create a date object in local timezone
    const dateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

    // Check if the date is valid
    if (isNaN(dateTime.getTime())) {
      console.error('combineDateTime: Invalid date object created', { year, month, day, hours, minutes });
      return '';
    }

    // Return ISO string
    return dateTime.toISOString();
  } catch (error) {
    console.error('Error combining date and time:', error, { date, time });
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
