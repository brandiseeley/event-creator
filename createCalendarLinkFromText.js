/* global chrome */

import parseEvent from './lib/eventParser/index.js';
import CalendarEvent from './lib/googleCalendar/index.js';

export default async function createCalendarLinkFromText(text) {
  const { apiKey } = await chrome.storage.local.get('apiKey');

  if (!apiKey) {
    throw new Error('Missing API key');
  }

  const eventDetails = await parseEvent(text, apiKey);
  return new CalendarEvent(eventDetails).link;
}
