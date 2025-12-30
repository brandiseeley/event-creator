class CalendarEvent {
  constructor({
    title,
    startDate,
    startTime,
    endDate,
    endTime,
    timeZone,
  }) {
    this.title = title;
    this.startDateStr = startDate;
    this.startTimeStr = startTime;
    this.endDateStr = endDate;
    this.endTimeStr = endTime;
    this.timeZone = timeZone;
    this.startDateObj = this.#startDateObj();
    this.endDateObj = this.#endDateObj();
  }

  // Build the full Google Calendar event link
  get link() {
    const baseUrl = 'https://calendar.google.com/calendar/u/0/r/eventedit';
    const params = new URLSearchParams({
      text: this.title,
      ctz: this.timeZone,
      dates: `${this.#formatStartDateTime()}/${this.#formatEndDateTime()}`,
    });
    return `${baseUrl}?${params.toString()}`;
  }

  // Parse a date + time string into a local Date object
  static #parseDateTime(dateStr, timeStr) {
    return new Date(`${dateStr}T${timeStr}`);
  }

  // Format a Date object as YYYYMMDDTHHMMSS (no Z) for Google Calendar
  static #formatForCalendar(date) {
    const pad = (num) => String(num).padStart(2, '0');
    const year = date.getFullYear().toString();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  }

  #startDateObj() {
    return CalendarEvent.#parseDateTime(this.startDateStr, this.startTimeStr);
  }

  #endDateObj() {
    if (this.endDateStr && this.endTimeStr) {
      return CalendarEvent.#parseDateTime(this.endDateStr, this.endTimeStr);
    }
    return new Date(this.startDateObj.getTime() + 60 * 60 * 1000);
  }

  #formatStartDateTime() {
    return CalendarEvent.#formatForCalendar(this.startDateObj);
  }

  #formatEndDateTime() {
    return CalendarEvent.#formatForCalendar(this.endDateObj);
  }
}

// Example usage:
const parsedEvent = new CalendarEvent({
  title: "LS Women's Group | Fundamentals at Work",
  startDate: '2025-12-21',
  startTime: '14:00',
  endDate: null,
  endTime: null,
  timeZone: 'America/New_York',
});

console.log(parsedEvent.link);
console.log('Passing: ', parsedEvent.link === 'https://calendar.google.com/calendar/u/0/r/eventedit?text=LS+Women%27s+Group+%7C+Fundamentals+at+Work&ctz=America%2FNew_York&dates=20251221T140000%2F20251221T150000');
