const currentYear = new Date().getFullYear();

const systemMessage = `
You are an expert at structured data extraction. Extract event information from unstructured text.

Extract the event start and end times. 

Return all dates as YYYY-MM-DD and times as HH:MM in 24-hour format.
If you cannot determine an exact value, return null.

If no year is specified in the text, assume the year is ${currentYear}.
If a state, city, or region is mentioned, convert it to the correct IANA time zone. 
For example:
- "Wyoming" → "America/Denver"
- "New York" → "America/New_York"
- "Los Angeles" → "America/Los_Angeles"
If no information is present, return null for the timezone.
`;

const timeZones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Tokyo',
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
  additionalProperties: false,
};

function isValidDate(dateString, nullable = false) {
  if (nullable && dateString === null) return true;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
  return dateRegex.test(dateString);
}

function isValidTime(timeString, nullable = false) {
  if (nullable && timeString === null) return true;

  const timeRegex = /^\d{2}:\d{2}$/; // HH:MM (24-hour)
  return timeRegex.test(timeString);
}

async function extractEventInfo(text, apiKey) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
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
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'event_extraction',
          schema: calendarEventJsonSchema,
          strict: true,
        },
      },
    }),
  });

  const data = await response.json();

  console.log('Raw response data: ', data);

  return JSON.parse(data.output[0].content[0].text);
}

function validateEventFormat(eventInfo) {
  if (typeof eventInfo !== 'object' || eventInfo === null) {
    throw new Error('Event info is not an object.');
  }

  if (eventInfo.title.length < 1) {
    throw new Error('Event title is empty.');
  }

  if (!isValidDate(eventInfo.start_date)) {
    throw new Error('Event start date is invalid.');
  }

  if (!isValidTime(eventInfo.start_time)) {
    throw new Error('Event start time is invalid.');
  }

  if (!isValidDate(eventInfo.end_date, true)) { // end_date can be null
    throw new Error('Event end date is invalid.');
  }

  if (!isValidTime(eventInfo.end_time, true)) { // end_time can be null
    throw new Error('Event end time is invalid.');
  }

  if (eventInfo.time_zone === '') {
    throw new Error('Unknown time zone should be `null`, not empty string.');
  }

  if (eventInfo.location === '') {
    throw new Error('Unknown location should be `null`, not empty string.');
  }
}

export default async function parseEvent(text, apiKey) {
  const response = await extractEventInfo(text, apiKey);
  validateEventFormat(response); // will throw if invalid
  return response;
}
