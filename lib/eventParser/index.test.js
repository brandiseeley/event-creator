import 'dotenv/config';
import parseEvent from './index.js';

async function parseEventVerbose(unstructuredText, apiKey) {
  console.log('----------');
  console.log(`Parsing event with text: ${unstructuredText}`);

  const result = await parseEvent(unstructuredText, apiKey);

  console.log('----------');
  console.log(`Parsed event info: ${JSON.stringify(result, null, 2)}`);
  console.log('----------');
}

function fetchApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not found in environment variables');
  }

  return apiKey;
}

function testEvent1() {
  const testText = "LS Women's Group | Fundamentals at Work | Sunday, December 21st | 2PM ET / 11AM PT / 8PM CET";
  const apiKey = fetchApiKey();

  parseEventVerbose(testText, apiKey);
}

testEvent1();
