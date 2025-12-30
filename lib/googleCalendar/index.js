class CalendarEvent {
  constructor({ title, start_date, start_time, end_date, end_time, time_zone }) {
    this.title = title;
    this.startDateStr = start_date;
    this.startTimeStr = start_time;
    this.endDateStr = end_date;
    this.endTimeStr = end_time;
    this.timeZone = time_zone;
  }

  // Parse a date + time string into a local Date object
  parseDateTime(dateStr, timeStr) {
    return new Date(`${dateStr}T${timeStr}`);
  }

  // Format a Date object as YYYYMMDDTHHMMSS (no Z) for Google Calendar
  formatForCalendar(date) {
    const pad = (num) => String(num).padStart(2, "0");
    return (
      date.getFullYear().toString() +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      "T" +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds())
    );
  }

  // Get start Date object
  get start() {
    return this.parseDateTime(this.startDateStr, this.startTimeStr);
  }

  // Get end Date object, defaults to 1 hour after start if not provided
  get end() {
    if (this.endDateStr && this.endTimeStr) {
      return this.parseDateTime(this.endDateStr, this.endTimeStr);
    }
    return new Date(this.start.getTime() + 60 * 60 * 1000);
  }

  // Build the full Google Calendar event link
  get link() {
    const baseUrl = "https://calendar.google.com/calendar/u/0/r/eventedit";
    const params = new URLSearchParams({
      text: this.title,
      ctz: this.timeZone,
      dates: `${this.formatForCalendar(this.start)}/${this.formatForCalendar(this.end)}`,
    });
    return `${baseUrl}?${params.toString()}`;
  }
}

// Example usage:
const parsedEvent = new CalendarEvent({
  title: "LS Women's Group | Fundamentals at Work",
  start_date: "2025-12-21",
  start_time: "14:00",
  end_date: null,
  end_time: null,
  time_zone: "America/New_York"
});

console.log(parsedEvent.link);
