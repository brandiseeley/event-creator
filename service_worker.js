/* global chrome */

import createCalendarLinkFromText from './createCalendarLinkFromText.js';

chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: 'create-event',
    title: 'Create Calendar Event',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== 'create-event') return;

  try {
    // Set status to loading and save text
    chrome.storage.local.set({
      status: 'loading',
      inputText: info.selectionText,
    });

    // Open popup to show loading status
    chrome.action.openPopup();

    // Generate event
    const url = await createCalendarLinkFromText(info.selectionText);

    // Set status to success
    chrome.storage.local.set({
      status: 'success',
      calendarUrl: url,
    });
  } catch (err) {
    console.error(err);
  }
});
