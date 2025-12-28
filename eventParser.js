async function getOpenaiApiKey() {
  const { apiKey } = await chrome.storage.local.get(['apiKey']);
  return apiKey;
}

async function extractEventInfo(text, apiKey) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-2024-08-06',
      input: [
        {
          role: 'system',
          content: 'You are an expert at structured data extraction. Extract event information from unstructured text.',
        },
        {
          role: 'user',
          content: text,
        }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'event_extraction',
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              start_date: { type: 'string' },
              start_time: { type: 'string' },
              end_date: { type: 'string' },
              end_time: { type: 'string' },
              location: { type: 'string' }
            },
            required: [
              'title',
              'start_date',
              'start_time',
              'end_date',
              'end_time',
              'location'
            ],
            additionalProperties: false
          },
          strict: true
        }
      }
    })
  });

  const data = await response.json();
  return JSON.parse(data.output[0].content[0].text)
}

export async function parseEvent(selectionText) {
  console.log('Parsing event with text:', selectionText);
  const openaiApiKey = await getOpenaiApiKey();
  const response = await extractEventInfo(selectionText, openaiApiKey);
  return response;
}
