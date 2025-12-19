/**
 * Vercel Serverless Function - Health Check
 * URL: /api/health
 */

export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    version: '1.0.0',
    environment: 'vercel',
    timestamp: new Date().toISOString(),
    message: 'Planted API is healthy 🌱'
  });
}
