/* global document chrome */

import createCalendarLinkFromText from './createCalendarLinkFromText.js';

const testButton = document.getElementById('testButton');

testButton.addEventListener('click', async () => {
  const text = "LS Women's Group | Fundamentals at Work | Sunday, December 21st | 2PM ET / 11AM PT / 8PM CET";

  try {
    const eventUrl = await createCalendarLinkFromText(text);
    const anchorElement = document.getElementById('link');
    anchorElement.textContent = 'Create Google Calendar Event';
    anchorElement.href = eventUrl;
    anchorElement.addEventListener('click', (event) => {
      event.preventDefault();
      chrome.tabs.create({ url: eventUrl });
    });
  } catch (err) {
    console.error(err);
  }
});
