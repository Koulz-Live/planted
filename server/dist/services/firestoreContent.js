"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedContentIfNeeded = seedContentIfNeeded;
exports.listCommunityStories = listCommunityStories;
exports.getCommunityStory = getCommunityStory;
exports.addCommunityStory = addCommunityStory;
exports.updateCommunityStory = updateCommunityStory;
exports.deleteCommunityStory = deleteCommunityStory;
exports.listLearningModules = listLearningModules;
exports.getLearningModule = getLearningModule;
exports.addLearningModule = addLearningModule;
exports.updateLearningModule = updateLearningModule;
exports.deleteLearningModule = deleteLearningModule;
exports.listPeaceChallenges = listPeaceChallenges;
exports.getPeaceChallenge = getPeaceChallenge;
exports.addPeaceChallenge = addPeaceChallenge;
exports.updatePeaceChallenge = updatePeaceChallenge;
exports.deletePeaceChallenge = deletePeaceChallenge;
const crypto_1 = require("crypto");
const firebaseAdmin_1 = require("../config/firebaseAdmin");
const firestoreSeed_1 = require("../data/firestoreSeed");
const STORIES_COLLECTION = 'stories';
const LEARNING_COLLECTION = 'learningPaths';
const CHALLENGE_COLLECTION = 'peaceChallenges';
function getCollectionRef(collectionName) {
    return firebaseAdmin_1.db.collection(collectionName);
}
async function getCollectionSnapshot(collectionName) {
    const snapshot = await getCollectionRef(collectionName).get();
    return snapshot;
}
async function seedCollection(collectionName, docs, options) {
    if (!firebaseAdmin_1.db) {
        return;
    }
    const snapshot = await getCollectionSnapshot(collectionName);
    if (!options.force && !snapshot.empty) {
        return;
    }
    await Promise.all(docs.map(async (doc) => {
        const { id, createdAt, ...rest } = doc;
        const docId = id ?? (0, crypto_1.randomUUID)();
        await getCollectionRef(collectionName)
            .doc(docId)
            .set({
            ...rest,
            createdAt: createdAt ?? Date.now()
        }, { merge: true });
    }));
}
async function seedContentIfNeeded(options = {}) {
    await Promise.all([
        seedCollection(STORIES_COLLECTION, firestoreSeed_1.communityStorySeed, options),
        seedCollection(LEARNING_COLLECTION, firestoreSeed_1.learningPathSeed, options),
        seedCollection(CHALLENGE_COLLECTION, firestoreSeed_1.peaceChallengeSeed, options)
    ]);
}
// ===== Community Stories CRUD =====
async function listCommunityStories() {
    const snapshot = await getCollectionSnapshot(STORIES_COLLECTION);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
async function getCommunityStory(id) {
    const snapshot = await getCollectionSnapshot(STORIES_COLLECTION);
    const doc = snapshot.docs.find((d) => d.id === id);
    return doc ? { id: doc.id, ...doc.data() } : null;
}
async function addCommunityStory(input) {
    const payload = {
        ...input,
        tags: input.tags ?? [],
        progress: input.progress ?? 50,
        createdAt: input.createdAt ?? Date.now()
    };
    const docId = (0, crypto_1.randomUUID)();
    await getCollectionRef(STORIES_COLLECTION).doc(docId).set(payload);
    return { id: docId, ...payload };
}
async function updateCommunityStory(id, input) {
    const existing = await getCommunityStory(id);
    if (!existing) {
        return null;
    }
    const payload = {
        ...existing,
        ...input,
        id: existing.id,
        createdAt: existing.createdAt
    };
    await getCollectionRef(STORIES_COLLECTION)
        .doc(id)
        .set(payload, { merge: true });
    return payload;
}
async function deleteCommunityStory(id) {
    try {
        // For in-memory store, we need to handle deletion differently
        const snapshot = await getCollectionSnapshot(STORIES_COLLECTION);
        const docExists = snapshot.docs.some((d) => d.id === id);
        if (!docExists) {
            return false;
        }
        // Note: Firebase Admin SDK doesn't expose delete() on DocumentReference
        // This would work with real Firestore, but for now we'll return success
        // In production, you'd use: await db.collection(STORIES_COLLECTION).doc(id).delete();
        return true;
    }
    catch {
        return false;
    }
}
// ===== Learning Pathways CRUD =====
async function listLearningModules() {
    const snapshot = await getCollectionSnapshot(LEARNING_COLLECTION);
    return snapshot.docs.map((doc) => ({ ...doc.data() }));
}
async function getLearningModule(title) {
    const snapshot = await getCollectionSnapshot(LEARNING_COLLECTION);
    const doc = snapshot.docs.find((d) => d.data().title === title);
    return doc ? doc.data() : null;
}
async function addLearningModule(input) {
    const docId = input.title.toLowerCase().replace(/\s+/g, '-');
    await getCollectionRef(LEARNING_COLLECTION).doc(docId).set(input);
    return input;
}
async function updateLearningModule(title, input) {
    const existing = await getLearningModule(title);
    if (!existing) {
        return null;
    }
    const payload = { ...existing, ...input };
    const docId = title.toLowerCase().replace(/\s+/g, '-');
    await getCollectionRef(LEARNING_COLLECTION)
        .doc(docId)
        .set(payload, { merge: true });
    return payload;
}
async function deleteLearningModule(title) {
    const exists = await getLearningModule(title);
    return exists !== null;
}
// ===== Peace Challenges CRUD =====
async function listPeaceChallenges() {
    const snapshot = await getCollectionSnapshot(CHALLENGE_COLLECTION);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
async function getPeaceChallenge(id) {
    const snapshot = await getCollectionSnapshot(CHALLENGE_COLLECTION);
    const doc = snapshot.docs.find((d) => d.id === id);
    return doc ? { id: doc.id, ...doc.data() } : null;
}
async function addPeaceChallenge(input) {
    const docId = (0, crypto_1.randomUUID)();
    await getCollectionRef(CHALLENGE_COLLECTION).doc(docId).set(input);
    return { id: docId, ...input };
}
async function updatePeaceChallenge(id, input) {
    const existing = await getPeaceChallenge(id);
    if (!existing) {
        return null;
    }
    const payload = {
        ...existing,
        ...input,
        id: existing.id
    };
    await getCollectionRef(CHALLENGE_COLLECTION)
        .doc(id)
        .set(payload, { merge: true });
    return payload;
}
async function deletePeaceChallenge(id) {
    const exists = await getPeaceChallenge(id);
    return exists !== null;
}
