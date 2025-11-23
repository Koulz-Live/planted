"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const firestoreContent_1 = require("../services/firestoreContent");
async function run() {
    try {
        await (0, firestoreContent_1.seedContentIfNeeded)({ force: true });
        console.log('Firestore content seeded successfully.');
        process.exit(0);
    }
    catch (error) {
        console.error('Unable to seed Firestore content.', error);
        process.exit(1);
    }
}
run();
