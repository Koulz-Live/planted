"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ai_1 = __importDefault(require("./routes/ai"));
const aiEnhanced_1 = __importDefault(require("./routes/aiEnhanced"));
const profile_1 = __importDefault(require("./routes/profile"));
const content_1 = __importDefault(require("./routes/content"));
const saved_1 = __importDefault(require("./routes/saved"));
const firestoreContent_1 = require("./services/firestoreContent");
const app = (0, express_1.default)();
const port = process.env.PORT ?? 3000;
const clientOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim());
app.use((0, cors_1.default)({ origin: clientOrigins }));
app.use(express_1.default.json({ limit: '5mb' }));
(0, firestoreContent_1.seedContentIfNeeded)().catch((error) => {
    console.warn('[Planted] Unable to seed Firestore content', error);
});
app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
});
app.use('/api/ai', ai_1.default);
app.use('/api/ai-enhanced', aiEnhanced_1.default);
app.use('/api/profile', profile_1.default);
app.use('/api/content', content_1.default);
app.use('/api/saved', saved_1.default);
app.use((err, _req, res, next) => {
    console.error('Unexpected error', err);
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({ ok: false, message: 'Unexpected server error' });
});
app.listen(port, () => {
    console.log(`Planted API listening on port ${port}`);
});
