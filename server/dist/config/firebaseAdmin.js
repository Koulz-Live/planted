"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const crypto_1 = require("crypto");
function createInMemoryFirestore() {
    console.warn('[Planted] Firebase credentials missing, using in-memory data store.');
    const store = new Map();
    return {
        collection: (name) => {
            const collectionRef = {
                doc: (id) => ({
                    async get() {
                        const col = store.get(name);
                        const doc = col?.get(id);
                        return {
                            exists: Boolean(doc),
                            data: () => doc
                        };
                    },
                    async set(data, options) {
                        let col = store.get(name);
                        if (!col) {
                            col = new Map();
                            store.set(name, col);
                        }
                        const existing = col.get(id) ?? {};
                        const next = options?.merge ? { ...existing, ...data } : data;
                        col.set(id, next);
                    }
                }),
                async get() {
                    let col = store.get(name);
                    if (!col) {
                        col = new Map();
                        store.set(name, col);
                    }
                    const docs = Array.from(col.entries()).map(([id, data]) => ({
                        id,
                        data: () => data
                    }));
                    return {
                        empty: docs.length === 0,
                        docs
                    };
                },
                async add(data) {
                    const id = (0, crypto_1.randomUUID)();
                    await collectionRef.doc(id).set(data);
                    return { id };
                }
            };
            return collectionRef;
        }
    };
}
function resolveServiceAccount() {
    const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountRaw) {
        try {
            return JSON.parse(serviceAccountRaw);
        }
        catch (error) {
            console.warn('[Planted] Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON.', error);
        }
    }
    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
    if (FIREBASE_PRIVATE_KEY && FIREBASE_CLIENT_EMAIL) {
        return {
            projectId: FIREBASE_PROJECT_ID,
            clientEmail: FIREBASE_CLIENT_EMAIL,
            privateKey: FIREBASE_PRIVATE_KEY
        };
    }
    return undefined;
}
function bootstrapAdmin() {
    if (firebase_admin_1.default.apps.length) {
        return firebase_admin_1.default.app();
    }
    let credential = resolveServiceAccount();
    // Firebase service account JSON uses snake_case (private_key), not camelCase (privateKey)
    // The JSON in .env contains \\n which JSON.parse converts to literal \n (backslash + n)
    // We need to replace those with actual newline characters for PEM format
    if (credential && 'private_key' in credential) {
        credential = {
            ...credential,
            private_key: credential.private_key.replace(/\\n/g, '\n')
        };
    }
    // Also handle the camelCase version if someone uses individual env vars
    if (credential?.privateKey) {
        credential = {
            ...credential,
            privateKey: credential.privateKey.replace(/\\n/g, '\n')
        };
    }
    try {
        if (credential) {
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert(credential)
            });
        }
        else {
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.applicationDefault(),
                projectId: process.env.FIREBASE_PROJECT_ID
            });
        }
        return firebase_admin_1.default.app();
    }
    catch (error) {
        console.warn('[Planted] Firebase admin initialization failed, falling back to in-memory store.', error);
        return null;
    }
}
const app = bootstrapAdmin();
exports.db = app ? app.firestore() : createInMemoryFirestore();
