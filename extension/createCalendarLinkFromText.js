const TEXT_LENGTH_LIMIT = 4000;

export default async function createCalendarLinkFromText(text, id) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Please provide text to parse into a calendar event.');
  }

  if (text.length > TEXT_LENGTH_LIMIT) {
    throw new Error('Selected text is too long, please make a smaller selection.');
  }

  try {
    const response = await fetch('http://localhost:5001/parse-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-UUID': id,
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Backend error: ${response.status}`);
    }

    const data = await response.json();
    return data.calendar_link; // <-- just return the URL directly
  } catch (err) {
    throw new Error(`Failed to create calendar event: ${err.message}`);
  }
}
