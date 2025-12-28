document.addEventListener("DOMContentLoaded", () => {
  const apiForm = document.getElementById("apiKeyForm");
  apiForm.addEventListener("submit", (event) => {
    event.preventDefault();
    chrome.storage.local.set({ apiKey: event.target.apiKey.value });

    chrome.storage.local.get("apiKey", ({ apiKey }) => {
      console.log("API Key stored as:", apiKey);
    });
  });

  const testButton = document.getElementById("testButton");
  testButton.addEventListener("click", async() => {
    console.log("Test button clicked");
    console.log(await parseEvent("LS Women's Group | Fundamentals at Work | Sunday, December 21st | 12PM ET / 9AM PT / 6PM CET"));
  });
});
