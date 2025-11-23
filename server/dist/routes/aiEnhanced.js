"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const aiSuggestions_1 = require("../services/aiSuggestions");
const router = (0, express_1.Router)();
// Smart suggestions endpoint
const suggestionsSchema = zod_1.z.object({
    savedPlants: zod_1.z.array(zod_1.z.string()).optional(),
    savedRecipes: zod_1.z.array(zod_1.z.string()).optional(),
    dietaryPreferences: zod_1.z.array(zod_1.z.string()).optional(),
    culturalPreferences: zod_1.z.array(zod_1.z.string()).optional(),
    region: zod_1.z.string().optional(),
    season: zod_1.z.string().optional()
});
router.post('/suggestions', async (req, res) => {
    try {
        const body = suggestionsSchema.parse(req.body);
        const userId = req.headers['x-user-id'] || 'demo-user';
        const data = await (0, aiSuggestions_1.generateSmartSuggestions)(body, userId);
        const payload = { ok: true, data };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(400).json(payload);
    }
});
// Refine output endpoint
const refineSchema = zod_1.z.object({
    originalRequest: zod_1.z.any(),
    originalOutput: zod_1.z.any(),
    userFeedback: zod_1.z.string(),
    outputType: zod_1.z.enum(['plant-plan', 'recipe', 'nutrition', 'story'])
});
router.post('/refine', async (req, res) => {
    try {
        const body = refineSchema.parse(req.body);
        const userId = req.headers['x-user-id'] || 'demo-user';
        const data = await (0, aiSuggestions_1.refineOutput)(body.originalRequest, body.originalOutput, body.userFeedback, body.outputType, userId);
        const payload = { ok: true, data };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(400).json(payload);
    }
});
// Follow-up question endpoint
const followUpSchema = zod_1.z.object({
    originalContent: zod_1.z.any(),
    question: zod_1.z.string(),
    contentType: zod_1.z.enum(['plant-plan', 'recipe', 'nutrition', 'story'])
});
router.post('/follow-up', async (req, res) => {
    try {
        const body = followUpSchema.parse(req.body);
        const userId = req.headers['x-user-id'] || 'demo-user';
        const answer = await (0, aiSuggestions_1.answerFollowUpQuestion)(body.originalContent, body.question, body.contentType, userId);
        const payload = { ok: true, data: { answer } };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(400).json(payload);
    }
});
// Chat endpoint
const chatSchema = zod_1.z.object({
    message: zod_1.z.string(),
    conversationHistory: zod_1.z.array(zod_1.z.object({
        role: zod_1.z.enum(['user', 'assistant']),
        content: zod_1.z.string()
    })).optional()
});
router.post('/chat', async (req, res) => {
    try {
        const body = chatSchema.parse(req.body);
        const userId = req.headers['x-user-id'] || 'demo-user';
        const response = await (0, aiSuggestions_1.generateChatResponse)(body.message, body.conversationHistory || [], userId);
        const payload = { ok: true, data: { response } };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(400).json(payload);
    }
});
exports.default = router;
