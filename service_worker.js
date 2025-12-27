chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: "create-event",
    title: "Create Calendar Event",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "create-event") { 
    console.log("Selected text:", info.selectionText);
    createEvent(info.selectionText);
  }
});

function createEvent(selectionText) {
  console.log('Creating event with text:', selectionText);
}