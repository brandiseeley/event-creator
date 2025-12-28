document.addEventListener("DOMContentLoaded", () => {
  const apiForm = document.getElementById("apiKeyForm");
  apiForm.addEventListener("submit", (event) => {
    event.preventDefault();
    chrome.storage.local.set({ apiKey: event.target.apiKey.value });

    chrome.storage.local.get("apiKey", ({ apiKey }) => {
      console.log("API Key stored as:", apiKey);
    });
  });
});
