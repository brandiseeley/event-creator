/* global chrome */

import createCalendarLinkFromText from './createCalendarLinkFromText.js';

// Create new context-menu option
chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: 'create-event',
    title: 'Create Calendar Event',
    contexts: ['selection'],
  });
});

// Handle 'create-event' context-menu click
chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== 'create-event') return;

  try {
    // Set status to loading and save text
    chrome.storage.local.set({
      status: 'loading',
      inputText: info.selectionText,
      error: null,
    });

    // Open popup to show loading status
    chrome.action.openPopup();

    // Generate event
    const url = await createCalendarLinkFromText(info.selectionText);

    // Set status to success
    chrome.storage.local.set({
      status: 'success',
      calendarUrl: url,
      error: null,
    });
  } catch (err) {
    // Set status to error with user-friendly message
    chrome.storage.local.set({
      status: 'error',
      error: err.message || 'An unexpected error occurred',
      calendarUrl: null,
    });
  }
});
