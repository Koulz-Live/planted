"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const aiTools_1 = require("../services/aiTools");
const router = (0, express_1.Router)();
const plantSchema = zod_1.z.object({
    plantName: zod_1.z.string(),
    growthStage: zod_1.z.enum(['seedling', 'vegetative', 'fruiting', 'dormant']),
    climate: zod_1.z.object({
        country: zod_1.z.string(),
        hardinessZone: zod_1.z.string().optional(),
        rainfallPattern: zod_1.z.string().optional(),
        avgTempC: zod_1.z.number().optional()
    }),
    biodiversityConcerns: zod_1.z.array(zod_1.z.string()),
    observations: zod_1.z
        .array(zod_1.z.object({
        photoUrl: zod_1.z.string().url().optional(),
        note: zod_1.z.string().optional(),
        symptomTags: zod_1.z.array(zod_1.z.string()).optional()
    }))
        .optional()
});
const recipeSchema = zod_1.z.object({
    dietaryNeeds: zod_1.z.array(zod_1.z.string()),
    availableIngredients: zod_1.z.array(zod_1.z.string()),
    culturalPreferences: zod_1.z.array(zod_1.z.string()),
    pantryPhotoUrls: zod_1.z.array(zod_1.z.string().url()).optional(),
    season: zod_1.z.string().optional()
});
const nutritionSchema = zod_1.z.object({
    householdSize: zod_1.z.number().int().positive(),
    focusAreas: zod_1.z.array(zod_1.z.string()),
    timeAvailablePerDay: zod_1.z.number().positive(),
    mealPhotoUrls: zod_1.z.array(zod_1.z.string().url()).optional()
});
const storySchema = zod_1.z.object({
    dishName: zod_1.z.string(),
    region: zod_1.z.string(),
    foodPhotoUrls: zod_1.z.array(zod_1.z.string().url()).optional()
});
router.post('/plant-plan', async (req, res) => {
    try {
        const body = plantSchema.parse(req.body);
        // Extract userId from header or use demo-user as fallback
        const userId = req.headers['x-user-id'] || 'demo-user';
        const data = await (0, aiTools_1.generatePlantPlan)(body, userId);
        const payload = { ok: true, data };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(400).json(payload);
    }
});
router.post('/recipes', async (req, res) => {
    try {
        const body = recipeSchema.parse(req.body);
        const userId = req.headers['x-user-id'] || 'demo-user';
        const data = await (0, aiTools_1.generateRecipes)(body, userId);
        const payload = { ok: true, data };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(400).json(payload);
    }
});
router.post('/nutrition', async (req, res) => {
    try {
        const body = nutritionSchema.parse(req.body);
        const userId = req.headers['x-user-id'] || 'demo-user';
        const data = await (0, aiTools_1.generateNutritionCoachPlan)(body, userId);
        const payload = { ok: true, data };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(400).json(payload);
    }
});
router.get('/learning-pathways', async (req, res) => {
    try {
        const country = req.query.country ?? 'global';
        const userId = req.headers['x-user-id'] || 'demo-user';
        const data = await (0, aiTools_1.generateLearningPathways)(country, userId);
        const payload = { ok: true, data };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(500).json(payload);
    }
});
router.post('/storytelling', async (req, res) => {
    try {
        const body = storySchema.parse(req.body);
        const userId = req.headers['x-user-id'] || 'demo-user';
        const data = await (0, aiTools_1.generateStorytelling)(body, userId);
        const payload = { ok: true, data };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(400).json(payload);
    }
});

// Recipe Detail Generation
router.post('/recipe-detail', async (req, res) => {
    try {
        const { recipeTitle, recipeDescription, existingIngredients, category, prepTime, cookTime, servings } = req.body;
        
        if (!recipeTitle) {
            return res.status(400).json({ 
                ok: false, 
                message: 'Recipe title is required' 
            });
        }

        const userId = req.headers['x-user-id'] || 'demo-user';
        console.log('🤖 Generating detailed recipe for:', recipeTitle);

        // Import the recipe-detail handler from root api directory
        const path = require('path');
        const apiPath = path.resolve(__dirname, '../../../api/ai/recipe-detail.js');
        const recipeDetailHandler = require(apiPath);
        
        // Call the Vercel function handler directly
        const mockReq = { method: 'POST', body: req.body, headers: req.headers };
        const mockRes = {
            status: (code) => ({
                json: (data) => res.status(code).json(data),
                end: () => res.status(code).end()
            }),
            json: (data) => res.json(data),
            setHeader: () => {},
            end: () => res.end()
        };
        
        await recipeDetailHandler.default(mockReq, mockRes);
    }
    catch (error) {
        console.error('❌ Recipe detail error:', error);
        const payload = { ok: false, message: error.message };
        res.status(500).json(payload);
    }
});

// Recipe Search
router.post('/recipe-search', async (req, res) => {
    try {
        const path = require('path');
        const apiPath = path.resolve(__dirname, '../../../api/ai/recipe-search.js');
        const recipeSearchHandler = require(apiPath);
        const mockReq = { method: 'POST', body: req.body, headers: req.headers };
        const mockRes = {
            status: (code) => ({
                json: (data) => res.status(code).json(data),
                end: () => res.status(code).end()
            }),
            json: (data) => res.json(data),
            setHeader: () => {},
            end: () => res.end()
        };
        await recipeSearchHandler.default(mockReq, mockRes);
    }
    catch (error) {
        console.error('❌ Recipe search error:', error);
        res.status(500).json({ ok: false, message: error.message });
    }
});

// Recipe Images
router.post('/recipe-images', async (req, res) => {
    try {
        const path = require('path');
        const apiPath = path.resolve(__dirname, '../../../api/ai/recipe-images.js');
        const recipeImagesHandler = require(apiPath);
        const mockReq = { method: 'POST', body: req.body, headers: req.headers };
        const mockRes = {
            status: (code) => ({
                json: (data) => res.status(code).json(data),
                end: () => res.status(code).end()
            }),
            json: (data) => res.json(data),
            setHeader: () => {},
            end: () => res.end()
        };
        await recipeImagesHandler.default(mockReq, mockRes);
    }
    catch (error) {
        console.error('❌ Recipe images error:', error);
        res.status(500).json({ ok: false, message: error.message });
    }
});

exports.default = router;
