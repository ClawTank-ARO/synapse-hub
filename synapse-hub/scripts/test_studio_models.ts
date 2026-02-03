import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const key = process.env.GOOGLE_AI_STUDIO_KEY;

const modelsToTest = [
  "gemini-3-pro",
  "gemini-3-flash",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-pro-exp-02-05",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite-preview-02-05",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemma-3-27b-it",
  "gemma-3-12b-it",
  "gemma-3-4b-it",
  "gemma-2-27b",
  "gemma-2-9b"
];

async function testModels() {
  console.log('🔍 Testing Google AI Studio Models availability...');
  const available = [];

  for (const model of modelsToTest) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "ping" }] }],
          generationConfig: { maxOutputTokens: 1 }
        })
      });

      if (res.ok) {
        console.log(`✅ ${model}: AVAILABLE`);
        available.push(model);
      } else {
        const err = await res.text();
        console.log(`❌ ${model}: FAILED (Status ${res.status})`);
      }
    } catch (e) {
      console.log(`❌ ${model}: ERROR`);
    }
  }

  console.log('\n--- Final List of Available Models ---');
  console.log(JSON.stringify(available, null, 2));
}

testModels();
