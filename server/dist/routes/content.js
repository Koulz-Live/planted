"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const firestoreContent_1 = require("../services/firestoreContent");
const router = (0, express_1.Router)();
const storySchema = zod_1.z.object({
    author: zod_1.z.string().min(2),
    country: zod_1.z.string().min(2),
    headline: zod_1.z.string().min(6),
    body: zod_1.z.string().min(20),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    progress: zod_1.z.number().min(0).max(100).default(50)
});
const learningSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    durationMinutes: zod_1.z.number().min(1),
    milestones: zod_1.z.array(zod_1.z.string()),
    ethicalFocus: zod_1.z.string().min(3)
});
const challengeSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    description: zod_1.z.string().min(10),
    countryFocus: zod_1.z.string().min(2),
    callToAction: zod_1.z.string().min(5),
    progressGoal: zod_1.z.number().min(0).max(100),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string()
});
// ===== Community Stories Endpoints =====
router.get('/community', async (_req, res) => {
    try {
        const data = await (0, firestoreContent_1.listCommunityStories)();
        const payload = { ok: true, data };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(500).json(payload);
    }
});
router.get('/community/:id', async (req, res) => {
    try {
        const data = await (0, firestoreContent_1.getCommunityStory)(req.params.id);
        if (!data) {
            const payload = { ok: false, message: 'Story not found' };
            return res.status(404).json(payload);
        }
        const payload = { ok: true, data };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(500).json(payload);
    }
});
router.post('/community', async (req, res) => {
    try {
        const body = storySchema.parse(req.body);
        const data = await (0, firestoreContent_1.addCommunityStory)(body);
        const payload = { ok: true, data };
        res.status(201).json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(400).json(payload);
    }
});
router.put('/community/:id', async (req, res) => {
    try {
        const body = storySchema.partial().parse(req.body);
        const data = await (0, firestoreContent_1.updateCommunityStory)(req.params.id, body);
        if (!data) {
            const payload = { ok: false, message: 'Story not found' };
            return res.status(404).json(payload);
        }
        const payload = { ok: true, data };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(400).json(payload);
    }
});
router.delete('/community/:id', async (req, res) => {
    try {
        const success = await (0, firestoreContent_1.deleteCommunityStory)(req.params.id);
        if (!success) {
            const payload = { ok: false, message: 'Story not found' };
            return res.status(404).json(payload);
        }
        const payload = { ok: true, data: { deleted: true } };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(500).json(payload);
    }
});
// ===== Learning Modules Endpoints =====
router.get('/learning', async (_req, res) => {
    try {
        const data = await (0, firestoreContent_1.listLearningModules)();
        const payload = { ok: true, data };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(500).json(payload);
    }
});
router.get('/learning/:title', async (req, res) => {
    try {
        const data = await (0, firestoreContent_1.getLearningModule)(decodeURIComponent(req.params.title));
        if (!data) {
            const payload = { ok: false, message: 'Learning module not found' };
            return res.status(404).json(payload);
        }
        const payload = { ok: true, data };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(500).json(payload);
    }
});
router.post('/learning', async (req, res) => {
    try {
        const body = learningSchema.parse(req.body);
        const data = await (0, firestoreContent_1.addLearningModule)(body);
        const payload = { ok: true, data };
        res.status(201).json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(400).json(payload);
    }
});
router.put('/learning/:title', async (req, res) => {
    try {
        const body = learningSchema.partial().parse(req.body);
        const data = await (0, firestoreContent_1.updateLearningModule)(decodeURIComponent(req.params.title), body);
        if (!data) {
            const payload = { ok: false, message: 'Learning module not found' };
            return res.status(404).json(payload);
        }
        const payload = { ok: true, data };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(400).json(payload);
    }
});
router.delete('/learning/:title', async (req, res) => {
    try {
        const success = await (0, firestoreContent_1.deleteLearningModule)(decodeURIComponent(req.params.title));
        if (!success) {
            const payload = { ok: false, message: 'Learning module not found' };
            return res.status(404).json(payload);
        }
        const payload = { ok: true, data: { deleted: true } };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(500).json(payload);
    }
});
// ===== Peace Challenges Endpoints =====
router.get('/challenges', async (_req, res) => {
    try {
        const data = await (0, firestoreContent_1.listPeaceChallenges)();
        const payload = { ok: true, data };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(500).json(payload);
    }
});
router.get('/challenges/:id', async (req, res) => {
    try {
        const data = await (0, firestoreContent_1.getPeaceChallenge)(req.params.id);
        if (!data) {
            const payload = { ok: false, message: 'Challenge not found' };
            return res.status(404).json(payload);
        }
        const payload = { ok: true, data };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(500).json(payload);
    }
});
router.post('/challenges', async (req, res) => {
    try {
        const body = challengeSchema.parse(req.body);
        const data = await (0, firestoreContent_1.addPeaceChallenge)(body);
        const payload = { ok: true, data };
        res.status(201).json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(400).json(payload);
    }
});
router.put('/challenges/:id', async (req, res) => {
    try {
        const body = challengeSchema.partial().parse(req.body);
        const data = await (0, firestoreContent_1.updatePeaceChallenge)(req.params.id, body);
        if (!data) {
            const payload = { ok: false, message: 'Challenge not found' };
            return res.status(404).json(payload);
        }
        const payload = { ok: true, data };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(400).json(payload);
    }
});
router.delete('/challenges/:id', async (req, res) => {
    try {
        const success = await (0, firestoreContent_1.deletePeaceChallenge)(req.params.id);
        if (!success) {
            const payload = { ok: false, message: 'Challenge not found' };
            return res.status(404).json(payload);
        }
        const payload = { ok: true, data: { deleted: true } };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(500).json(payload);
    }
});
exports.default = router;
