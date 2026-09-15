import { MongoClient, } from 'mongodb';
import { EJSON, } from 'bson';
import { readFile, } from 'node:fs/promises';
import { resolve, } from 'node:path';
import { config, } from 'dotenv';
config();
const mongoUri = process.env.RAW_MONGODB_URI;
if (!mongoUri) {
    throw new Error('RAW_MONGODB_URI is required');
}
const rawMongoUri = mongoUri;
const seedDefinitions = [
    {
        collectionName: 'locations',
        filePath: resolve(process.cwd(), 'data/locations.json'),
    },
    {
        collectionName: 'restaurants',
        filePath: resolve(process.cwd(), 'data/restaurants.json'),
    },
    {
        collectionName: 'menus',
        filePath: resolve(process.cwd(), 'data/menu.json'),
    },
];
async function readJsonFile(filePath) {
    const fileContents = await readFile(filePath, 'utf-8');
    const parsed = EJSON.parse(fileContents);
    if (!Array.isArray(parsed)) {
        throw new Error(`Expected array in ${filePath}`);
    }
    return parsed;
}
async function seedCollection(db, definition) {
    console.log(`Reading ${definition.filePath}`);
    const documents = await readJsonFile(definition.filePath);
    const collection = db.collection(definition.collectionName);
    await collection.deleteMany({});
    if (documents.length === 0) {
        console.log(`${definition.collectionName}: no documents`);
        return;
    }
    const result = await collection.insertMany(documents, {
        ordered: false,
    });
    console.log(`${definition.collectionName}: inserted ${result.insertedCount} documents`);
}
async function main() {
    const client = new MongoClient(rawMongoUri);
    try {
        console.log('Connecting to raw MongoDB...');
        await client.connect();
        const db = client.db();
        console.log(`Connected to database: ${db.databaseName}`);
        for (const definition of seedDefinitions) {
            await seedCollection(db, definition);
        }
        console.log('Raw data seeding completed successfully.');
    }
    finally {
        await client.close();
    }
}
main().catch((error) => {
    console.error('Raw data seeding failed:', error);
    process.exit(1);
});
//# sourceMappingURL=seed-raw.js.map