# Vercel Serverless Functions

This directory contains Vercel serverless functions (API routes) for the Planted app.

## Available Endpoints

### `/api/ai/identify-plant`

**Purpose:** AI-powered plant identification from photos using OpenAI GPT-4o Vision

**Method:** `POST`

**Request Body:**
```json
{
  "photoUrl": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "commonName": "Monstera",
    "scientificName": "Monstera deliciosa",
    "confidence": 86,
    "suggestions": ["Monstera adansonii"],
    "warnings": ["Multiple plants detected"]
  }
}
```

**Environment Variables Required:**
- `OPENAI_API_KEY` - Get from https://platform.openai.com/api-keys

**Usage Example:**
```javascript
const response = await fetch('/api/ai/identify-plant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ photoUrl: base64ImageData })
});

const { ok, data } = await response.json();
if (ok) {
  console.log(`Identified: ${data.commonName} (${data.confidence}%)`);
}
```

## Local Development

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Create `.env` file with your OpenAI API key:
   ```bash
   OPENAI_API_KEY=sk-proj-your_key_here
   ```

3. Run dev server:
   ```bash
   vercel dev
   ```

4. Test endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/ai/identify-plant \
     -H "Content-Type: application/json" \
     -d '{"photoUrl": "data:image/jpeg;base64,..."}'
   ```

## Deployment

Serverless functions are automatically deployed to Vercel when you push to GitHub.

**Important:** Add `OPENAI_API_KEY` to Vercel environment variables:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `OPENAI_API_KEY` with your OpenAI API key
3. Redeploy if needed

## Function Details

### identify-plant.js

- **Runtime:** Node.js 18.x
- **Timeout:** 30s (Vercel default)
- **Memory:** 1024MB (default)
- **Region:** Global (auto-deployed to all edge regions)

**Features:**
- Uses OpenAI GPT-4o Vision model (`gpt-4o-2024-08-06`)
- Expert botanist system prompt
- Structured JSON responses
- Confidence scoring (0-100)
- Alternative plant suggestions
- Helpful warnings for photo quality
- Graceful error handling with fallback

**Error Handling:**
- OpenAI API unavailable → Returns fallback response
- Invalid image → Returns low confidence
- Network error → Returns error message
- No API key → Returns fallback with warning

## Cost Monitoring

OpenAI GPT-4o Vision pricing:
- ~$0.01 per image identification
- Free tier: $5 credit for testing
- Monitor usage at: https://platform.openai.com/usage

Recommended limits:
- Development: 100 identifications/day
- Production: Monitor and set usage alerts

## Future API Routes

Planned serverless functions:
- `/api/ai/generate-care-plan` - AI-generated care plans
- `/api/ai/diagnose-plant` - Plant disease diagnosis
- `/api/notifications/send` - Push notifications
- `/api/community/moderate` - Content moderation
