import { parseEvent } from "./eventParser.js";

chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: "create-event",
    title: "Create Calendar Event",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === "create-event") { 
    console.log("Selected text:", info.selectionText);
    const event = await parseEvent(info.selectionText);
    console.log("Event created:", event);
  }
});
