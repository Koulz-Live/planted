"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const firebaseAdmin_1 = require("../config/firebaseAdmin");
const router = (0, express_1.Router)();
const userPreferencesSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    dietaryRequirements: zod_1.z.array(zod_1.z.string()),
    culturalPreferences: zod_1.z.array(zod_1.z.string()),
    allergens: zod_1.z.array(zod_1.z.string()).optional(),
    favoriteIngredients: zod_1.z.array(zod_1.z.string()).optional()
});
router.get('/:userId', async (req, res) => {
    try {
        const doc = await firebaseAdmin_1.db.collection('users').doc(req.params.userId).get();
        if (!doc.exists) {
            return res.status(404).json({ ok: false, message: 'User not found' });
        }
        const payload = { ok: true, data: doc.data() ?? {} };
        res.json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(500).json(payload);
    }
});
router.post('/', async (req, res) => {
    try {
        const body = userPreferencesSchema.parse(req.body);
        await firebaseAdmin_1.db.collection('users').doc(body.userId).set(body, { merge: true });
        const payload = { ok: true, data: body };
        res.status(201).json(payload);
    }
    catch (error) {
        const payload = { ok: false, message: error.message };
        res.status(400).json(payload);
    }
});
exports.default = router;
