"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPlantPlans = listPlantPlans;
exports.getPlantPlan = getPlantPlan;
exports.savePlantPlan = savePlantPlan;
exports.updatePlantPlan = updatePlantPlan;
exports.deletePlantPlan = deletePlantPlan;
exports.listRecipes = listRecipes;
exports.getRecipe = getRecipe;
exports.saveRecipe = saveRecipe;
exports.updateRecipe = updateRecipe;
exports.deleteRecipe = deleteRecipe;
exports.listNutritionPlans = listNutritionPlans;
exports.getNutritionPlan = getNutritionPlan;
exports.saveNutritionPlan = saveNutritionPlan;
exports.updateNutritionPlan = updateNutritionPlan;
exports.deleteNutritionPlan = deleteNutritionPlan;
exports.listGeneratedStories = listGeneratedStories;
exports.getGeneratedStory = getGeneratedStory;
exports.saveGeneratedStory = saveGeneratedStory;
exports.deleteGeneratedStory = deleteGeneratedStory;
exports.getUserPreferences = getUserPreferences;
exports.createUserPreferences = createUserPreferences;
exports.updateUserPreferences = updateUserPreferences;
exports.deleteUserPreferences = deleteUserPreferences;
const crypto_1 = require("crypto");
const firebaseAdmin_1 = require("../config/firebaseAdmin");
const PLANT_PLANS_COLLECTION = 'plantPlans';
const RECIPES_COLLECTION = 'recipes';
const NUTRITION_PLANS_COLLECTION = 'nutritionPlans';
const STORIES_COLLECTION = 'generatedStories';
const USER_PREFS_COLLECTION = 'userPreferences';
function getCollectionRef(collectionName) {
    return firebaseAdmin_1.db.collection(collectionName);
}
async function getCollectionSnapshot(collectionName) {
    const snapshot = await getCollectionRef(collectionName).get();
    return snapshot;
}
// ===== Plant Plans CRUD =====
async function listPlantPlans(userId) {
    const snapshot = await getCollectionSnapshot(PLANT_PLANS_COLLECTION);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return userId ? docs.filter((d) => d.userId === userId) : docs;
}
async function getPlantPlan(id) {
    const snapshot = await getCollectionSnapshot(PLANT_PLANS_COLLECTION);
    const doc = snapshot.docs.find((d) => d.id === id);
    return doc ? { id: doc.id, ...doc.data() } : null;
}
async function savePlantPlan(request, plan, userId) {
    const now = Date.now();
    const docId = (0, crypto_1.randomUUID)();
    const payload = {
        userId,
        plantName: request.plantName,
        request,
        plan,
        createdAt: now,
        updatedAt: now
    };
    await getCollectionRef(PLANT_PLANS_COLLECTION).doc(docId).set(payload);
    return { id: docId, ...payload };
}
async function updatePlantPlan(id, updates) {
    const existing = await getPlantPlan(id);
    if (!existing) {
        return null;
    }
    const payload = {
        ...existing,
        ...updates,
        updatedAt: Date.now()
    };
    await getCollectionRef(PLANT_PLANS_COLLECTION)
        .doc(id)
        .set(payload, { merge: true });
    return payload;
}
async function deletePlantPlan(id) {
    const exists = await getPlantPlan(id);
    return exists !== null;
}
// ===== Recipes CRUD =====
async function listRecipes(userId) {
    const snapshot = await getCollectionSnapshot(RECIPES_COLLECTION);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return userId ? docs.filter((d) => d.userId === userId) : docs;
}
async function getRecipe(id) {
    const snapshot = await getCollectionSnapshot(RECIPES_COLLECTION);
    const doc = snapshot.docs.find((d) => d.id === id);
    return doc ? { id: doc.id, ...doc.data() } : null;
}
async function saveRecipe(request, recipe, userId) {
    const now = Date.now();
    const docId = (0, crypto_1.randomUUID)();
    const payload = {
        userId,
        title: recipe.title,
        recipe,
        request,
        isFavorite: false,
        createdAt: now,
        updatedAt: now
    };
    await getCollectionRef(RECIPES_COLLECTION).doc(docId).set(payload);
    return { id: docId, ...payload };
}
async function updateRecipe(id, updates) {
    const existing = await getRecipe(id);
    if (!existing) {
        return null;
    }
    const payload = {
        ...existing,
        ...updates,
        updatedAt: Date.now()
    };
    await getCollectionRef(RECIPES_COLLECTION)
        .doc(id)
        .set(payload, { merge: true });
    return payload;
}
async function deleteRecipe(id) {
    const exists = await getRecipe(id);
    return exists !== null;
}
// ===== Nutrition Plans CRUD =====
async function listNutritionPlans(userId) {
    const snapshot = await getCollectionSnapshot(NUTRITION_PLANS_COLLECTION);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return userId ? docs.filter((d) => d.userId === userId) : docs;
}
async function getNutritionPlan(id) {
    const snapshot = await getCollectionSnapshot(NUTRITION_PLANS_COLLECTION);
    const doc = snapshot.docs.find((d) => d.id === id);
    return doc ? { id: doc.id, ...doc.data() } : null;
}
async function saveNutritionPlan(request, plan, userId) {
    const now = Date.now();
    const docId = (0, crypto_1.randomUUID)();
    const payload = {
        userId,
        householdSize: request.householdSize,
        request,
        plan,
        createdAt: now,
        updatedAt: now
    };
    await getCollectionRef(NUTRITION_PLANS_COLLECTION).doc(docId).set(payload);
    return { id: docId, ...payload };
}
async function updateNutritionPlan(id, updates) {
    const existing = await getNutritionPlan(id);
    if (!existing) {
        return null;
    }
    const payload = {
        ...existing,
        ...updates,
        updatedAt: Date.now()
    };
    await getCollectionRef(NUTRITION_PLANS_COLLECTION)
        .doc(id)
        .set(payload, { merge: true });
    return payload;
}
async function deleteNutritionPlan(id) {
    const exists = await getNutritionPlan(id);
    return exists !== null;
}
// ===== Generated Stories CRUD =====
async function listGeneratedStories(userId) {
    const snapshot = await getCollectionSnapshot(STORIES_COLLECTION);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return userId ? docs.filter((d) => d.userId === userId) : docs;
}
async function getGeneratedStory(id) {
    const snapshot = await getCollectionSnapshot(STORIES_COLLECTION);
    const doc = snapshot.docs.find((d) => d.id === id);
    return doc ? { id: doc.id, ...doc.data() } : null;
}
async function saveGeneratedStory(dishName, region, story, userId) {
    const now = Date.now();
    const docId = (0, crypto_1.randomUUID)();
    const payload = {
        userId,
        dishName,
        region,
        story,
        createdAt: now,
        updatedAt: now
    };
    await getCollectionRef(STORIES_COLLECTION).doc(docId).set(payload);
    return { id: docId, ...payload };
}
async function deleteGeneratedStory(id) {
    const exists = await getGeneratedStory(id);
    return exists !== null;
}
// ===== User Preferences CRUD =====
async function getUserPreferences(userId) {
    const snapshot = await getCollectionSnapshot(USER_PREFS_COLLECTION);
    const doc = snapshot.docs.find((d) => d.data().userId === userId);
    return doc ? { id: doc.id, ...doc.data() } : null;
}
async function createUserPreferences(userId, preferences) {
    const now = Date.now();
    const docId = userId;
    const payload = {
        userId,
        dietaryRestrictions: preferences.dietaryRestrictions ?? [],
        favoriteIngredients: preferences.favoriteIngredients ?? [],
        culturalPreferences: preferences.culturalPreferences ?? [],
        climateProfile: preferences.climateProfile,
        notificationsEnabled: preferences.notificationsEnabled ?? true,
        createdAt: now,
        updatedAt: now
    };
    await getCollectionRef(USER_PREFS_COLLECTION).doc(docId).set(payload);
    return { id: docId, ...payload };
}
async function updateUserPreferences(userId, updates) {
    const existing = await getUserPreferences(userId);
    if (!existing) {
        return null;
    }
    const payload = {
        ...existing,
        ...updates,
        userId: existing.userId,
        updatedAt: Date.now()
    };
    await getCollectionRef(USER_PREFS_COLLECTION)
        .doc(userId)
        .set(payload, { merge: true });
    return payload;
}
async function deleteUserPreferences(userId) {
    const exists = await getUserPreferences(userId);
    return exists !== null;
}
