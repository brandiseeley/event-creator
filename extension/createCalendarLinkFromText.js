/* global chrome */

import parseEvent from './lib/eventParser/index.js';
import CalendarEvent from './lib/googleCalendar/index.js';

export default async function createCalendarLinkFromText(text) {
  // Validate Input
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Please provide text to parse into a calendar event.');
  }

  const { apiKey } = await chrome.storage.local.get('apiKey');
  if (!apiKey) {
    throw new Error('Missing API key. Please enter your OpenAI API key.');
  }

  try {
    const eventDetails = await parseEvent(text, apiKey);
    return new CalendarEvent(eventDetails).link;
  } catch (err) {
    throw new Error(`Failed to create calendar event: ${err.message}`);
  }
}
