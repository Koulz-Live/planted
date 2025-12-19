// Smoke test for Planted AI endpoints (runs locally against production)
// Usage: node scripts/smoke-ai.mjs https://planted.africa

const base = (process.argv[2] || 'https://planted.africa').replace(/\/$/, '');
const apiBase = `${base}/api`;

async function post(path, body) {
  const url = `${apiBase}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      // server falls back to demo-user if omitted, but we set it for consistency
      'x-user-id': 'smoke-test-user',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { nonJsonBody: text.slice(0, 500) };
  }
  return { status: res.status, ok: res.ok, url, json };
}

async function get(path) {
  const url = `${apiBase}${path}`;
  const res = await fetch(url, {
    headers: { 'x-user-id': 'smoke-test-user' },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { nonJsonBody: text.slice(0, 500) };
  }
  return { status: res.status, ok: res.ok, url, json };
}

function summarize(result) {
  const out = {
    url: result.url,
    status: result.status,
    ok: result.ok,
    okField: result.json?.ok,
    message: result.json?.message,
    // avoid dumping full AI payloads
    dataKeys: result.json?.data ? Object.keys(result.json.data).slice(0, 10) : undefined,
  };
  return out;
}

async function main() {
  const results = [];

  // Health
  results.push(await get('/health'));

  // Core AI endpoints
  results.push(
    await post('/ai/plant-plan', {
      plantName: 'Tomato',
      growthStage: 'vegetative',
      climate: { country: 'South Africa', avgTempC: 24 },
      biodiversityConcerns: ['aphids'],
      observations: [{ note: 'Leaves slightly curling' }],
    })
  );

  results.push(
    await post('/ai/recipes', {
      dietaryNeeds: ['high-protein'],
      availableIngredients: ['tomato', 'onion', 'beans', 'spinach'],
      culturalPreferences: ['South African'],
      season: 'summer',
    })
  );

  results.push(
    await post('/ai/nutrition', {
      householdSize: 2,
      focusAreas: ['balanced meals', 'more vegetables'],
      timeAvailablePerDay: 30,
    })
  );

  results.push(
    await post('/ai/storytelling', {
      dishName: 'Tomato bean stew',
      region: 'Southern Africa',
    })
  );

  // Enhanced AI endpoints
  results.push(
    await post('/ai-enhanced/suggestions', {
      savedPlants: ['Tomato'],
      dietaryPreferences: ['high-protein'],
      region: 'South Africa',
      season: 'summer',
    })
  );

  results.push(
    await post('/ai-enhanced/chat', {
      message: 'Give me a quick tip for watering tomatoes in hot weather.',
      conversationHistory: [],
    })
  );

  // Learning pathways (GET)
  results.push(await get('/ai/learning-pathways?country=South%20Africa'));

  console.log('Planted AI smoke test against:', base);
  for (const r of results) {
    console.log(JSON.stringify(summarize(r)));
  }

  // exit non-zero if any request failed hard
  const failures = results.filter(r => !r.ok);
  if (failures.length) {
    console.error(`\nFAILED: ${failures.length} request(s). First failure:`);
    console.error(JSON.stringify(failures[0], null, 2));
    process.exit(1);
  }

  // soft check: API should return { ok: true } for the feature endpoints
  const okFieldFailures = results
    .filter(r => r.url.includes('/api/ai') || r.url.includes('/api/ai-enhanced'))
    .filter(r => r.json?.ok !== true);

  if (okFieldFailures.length) {
    console.error(`\nWARNING: ${okFieldFailures.length} AI endpoint(s) returned ok!=true. First:`);
    console.error(JSON.stringify(okFieldFailures[0], null, 2));
    process.exit(2);
  }

  console.log('\nPASS: AI endpoints reachable and returned ok:true');
}

main().catch(err => {
  console.error('Smoke test crashed:', err);
  process.exit(1);
});
