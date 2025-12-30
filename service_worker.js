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
    const url = await createCalendarLinkFromText(info.selectionText);

    // Open the calendar immediately
    chrome.tabs.create({ url });
  } catch (err) {
    console.error(err);
  }
});
