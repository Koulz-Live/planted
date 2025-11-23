"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firestoreAI_1 = require("../services/firestoreAI");
const router = (0, express_1.Router)();
// ===== Plant Plans Endpoints =====
router.get('/plant-plans', async (req, res) => {
    try {
        const userId = req.query.userId;
        const data = await (0, firestoreAI_1.listPlantPlans)(userId);
        const payload = { ok: true, data };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(500).json(payload);
    }
});
router.get('/plant-plans/:id', async (req, res) => {
    try {
        const data = await (0, firestoreAI_1.getPlantPlan)(req.params.id);
        if (!data) {
            const payload = { ok: false, message: 'Plant plan not found' };
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
router.post('/plant-plans', async (req, res) => {
    try {
        const { request, plan, userId } = req.body;
        const data = await (0, firestoreAI_1.savePlantPlan)(request, plan, userId);
        const payload = { ok: true, data };
        res.status(201).json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(400).json(payload);
    }
});
router.put('/plant-plans/:id', async (req, res) => {
    try {
        const { request, plan } = req.body;
        const data = await (0, firestoreAI_1.updatePlantPlan)(req.params.id, { request, plan });
        if (!data) {
            const payload = { ok: false, message: 'Plant plan not found' };
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
router.delete('/plant-plans/:id', async (req, res) => {
    try {
        const success = await (0, firestoreAI_1.deletePlantPlan)(req.params.id);
        if (!success) {
            const payload = { ok: false, message: 'Plant plan not found' };
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
// ===== Recipes Endpoints =====
router.get('/recipes', async (req, res) => {
    try {
        const userId = req.query.userId;
        const data = await (0, firestoreAI_1.listRecipes)(userId);
        const payload = { ok: true, data };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(500).json(payload);
    }
});
router.get('/recipes/:id', async (req, res) => {
    try {
        const data = await (0, firestoreAI_1.getRecipe)(req.params.id);
        if (!data) {
            const payload = { ok: false, message: 'Recipe not found' };
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
router.post('/recipes', async (req, res) => {
    try {
        const { request, recipe, userId } = req.body;
        const data = await (0, firestoreAI_1.saveRecipe)(request, recipe, userId);
        const payload = { ok: true, data };
        res.status(201).json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(400).json(payload);
    }
});
router.put('/recipes/:id', async (req, res) => {
    try {
        const { recipe, isFavorite } = req.body;
        const data = await (0, firestoreAI_1.updateRecipe)(req.params.id, { recipe, isFavorite });
        if (!data) {
            const payload = { ok: false, message: 'Recipe not found' };
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
router.delete('/recipes/:id', async (req, res) => {
    try {
        const success = await (0, firestoreAI_1.deleteRecipe)(req.params.id);
        if (!success) {
            const payload = { ok: false, message: 'Recipe not found' };
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
// ===== Nutrition Plans Endpoints =====
router.get('/nutrition-plans', async (req, res) => {
    try {
        const userId = req.query.userId;
        const data = await (0, firestoreAI_1.listNutritionPlans)(userId);
        const payload = { ok: true, data };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(500).json(payload);
    }
});
router.get('/nutrition-plans/:id', async (req, res) => {
    try {
        const data = await (0, firestoreAI_1.getNutritionPlan)(req.params.id);
        if (!data) {
            const payload = { ok: false, message: 'Nutrition plan not found' };
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
router.post('/nutrition-plans', async (req, res) => {
    try {
        const { request, plan, userId } = req.body;
        const data = await (0, firestoreAI_1.saveNutritionPlan)(request, plan, userId);
        const payload = { ok: true, data };
        res.status(201).json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(400).json(payload);
    }
});
router.put('/nutrition-plans/:id', async (req, res) => {
    try {
        const { request, plan } = req.body;
        const data = await (0, firestoreAI_1.updateNutritionPlan)(req.params.id, { request, plan });
        if (!data) {
            const payload = { ok: false, message: 'Nutrition plan not found' };
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
router.delete('/nutrition-plans/:id', async (req, res) => {
    try {
        const success = await (0, firestoreAI_1.deleteNutritionPlan)(req.params.id);
        if (!success) {
            const payload = { ok: false, message: 'Nutrition plan not found' };
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
// ===== Generated Stories Endpoints =====
router.get('/generated-stories', async (req, res) => {
    try {
        const userId = req.query.userId;
        const data = await (0, firestoreAI_1.listGeneratedStories)(userId);
        const payload = { ok: true, data };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(500).json(payload);
    }
});
router.get('/generated-stories/:id', async (req, res) => {
    try {
        const data = await (0, firestoreAI_1.getGeneratedStory)(req.params.id);
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
router.post('/generated-stories', async (req, res) => {
    try {
        const { dishName, region, story, userId } = req.body;
        const data = await (0, firestoreAI_1.saveGeneratedStory)(dishName, region, story, userId);
        const payload = { ok: true, data };
        res.status(201).json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(400).json(payload);
    }
});
router.delete('/generated-stories/:id', async (req, res) => {
    try {
        const success = await (0, firestoreAI_1.deleteGeneratedStory)(req.params.id);
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
// ===== User Preferences Endpoints =====
router.get('/preferences/:userId', async (req, res) => {
    try {
        const data = await (0, firestoreAI_1.getUserPreferences)(req.params.userId);
        if (!data) {
            const payload = { ok: false, message: 'User preferences not found' };
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
router.post('/preferences', async (req, res) => {
    try {
        const { userId, ...preferences } = req.body;
        const data = await (0, firestoreAI_1.createUserPreferences)(userId, preferences);
        const payload = { ok: true, data };
        res.status(201).json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(400).json(payload);
    }
});
router.put('/preferences/:userId', async (req, res) => {
    try {
        const data = await (0, firestoreAI_1.updateUserPreferences)(req.params.userId, req.body);
        if (!data) {
            const payload = { ok: false, message: 'User preferences not found' };
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
router.delete('/preferences/:userId', async (req, res) => {
    try {
        const success = await (0, firestoreAI_1.deleteUserPreferences)(req.params.userId);
        if (!success) {
            const payload = { ok: false, message: 'User preferences not found' };
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
