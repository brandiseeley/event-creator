const currentYear = new Date().getFullYear();

const systemMessage = `
You are an expert at structured data extraction. Extract event information from unstructured text.

Extract the event start and end times. 
If no year is specified in the text, assume the year is ${currentYear}.
If a state, city, or region is mentioned, convert it to the correct IANA time zone. 
For example:
- "Wyoming" → "America/Denver"
- "New York" → "America/New_York"
- "Los Angeles" → "America/Los_Angeles"
If no information is present, return null for the timezone.
`;

const timeZones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Asia/Tokyo",
];

const calendarEventJsonSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    start_date: { type: 'string' },
    start_time: { type: 'string' },
    end_date: { type: ['string', 'null'] },
    end_time: { type: ['string', 'null'] },
    time_zone: { type: ['string', 'null'], enum: [...timeZones, null] },
    location: { type: ['string', 'null'] },
  },
  required: [
    'title',
    'start_date',
    'start_time',
    'end_date',
    'end_time',
    'time_zone',
    'location',
  ],
  additionalProperties: false
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
          content: systemMessage,
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
          schema: calendarEventJsonSchema,
          strict: true,
        }
      }
    })
  });

  const data = await response.json();

  console.log('Raw response data: ', data);

  return JSON.parse(data.output[0].content[0].text)
}

export async function parseEvent(text, apiKey) {
  const response = await extractEventInfo(text, apiKey);
  return response;
}
