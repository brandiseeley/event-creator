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

const status = document.getElementById('status');
const calendarUrl = document.getElementById('calendarUrl');
const error = document.getElementById('error');

function hideAll() {
  status.textContent = '';
  calendarUrl.textContent = '';
  calendarUrl.href = '#';
  error.textContent = '';
}

function showLoading() {
  status.textContent = 'Loading. Please wait...';
}

function showSuccess(Url) {
  status.textContent = 'Success!';
  calendarUrl.textContent = 'Google Calendar URL';
  calendarUrl.href = Url;

  calendarUrl.addEventListener('click', (event) => {
    event.preventDefault();
    chrome.tabs.create({ url: Url });
  });
}

function showError(message) {
  error.textContent = message;
}

function showIdle() {
  hideAll();
}

// Status may be: loading, success, error, idle
function render({ status, calendarUrl, error }) {
  hideAll();

  switch (status) {
    case 'loading':
      showLoading();
      break;
    case 'success':
      showSuccess(calendarUrl);
      break;
    case 'error':
      showError(error);
      break;
    default:
      showIdle();
  }
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;

  if (changes.status) {
    chrome.storage.local.get([
      'status',
      'calendarUrl',
      'error',
    ]).then(render);
  }
});

// Initial render
chrome.storage.local.get([
  'status',
  'calendarUrl',
  'error',
]).then(render);
