async function getOpenaiApiKey() {
  const { apiKey } = await chrome.storage.local.get(['apiKey']);
  return apiKey;
}

async function parseEvent(selectionText) {
  console.log('Parsing event with text:', selectionText);
  const openaiApiKey = await getOpenaiApiKey();

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-5.2',
      input: 'Write a short bedtime story about a unicorn.',
    }),
  });

  const result = await response.json();
  return result;
}
