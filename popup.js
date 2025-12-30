/* global chrome, document */

import parseEvent from './lib/eventParser/index.js';
import CalendarEvent from './lib/googleCalendar/index.js';

document.addEventListener('DOMContentLoaded', () => {
  const apiForm = document.getElementById('apiKeyForm');
  apiForm.addEventListener('submit', (event) => {
    event.preventDefault();
    chrome.storage.local.set({ apiKey: event.target.apiKey.value });

    chrome.storage.local.get('apiKey', ({ apiKey }) => {
      console.log('API Key stored as:', apiKey);
    });
  });

  const testButton = document.getElementById('testButton');
  testButton.addEventListener('click', async () => {
    console.log('Test button clicked');

    const { apiKey } = await chrome.storage.local.get('apiKey');
    console.log('API Key stored as:', apiKey);

    const eventDetails = await parseEvent("LS Women's Group | Fundamentals at Work | Sunday, December 21st | 2PM ET / 11AM PT / 8PM CET", apiKey);
    console.log('Event details: ', eventDetails);

    const eventUrl = new CalendarEvent(eventDetails).link;
    console.log('Event URL: ', eventUrl);
  });
});
