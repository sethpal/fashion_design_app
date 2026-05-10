import * as fs from 'fs';
import * as path from 'path';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

interface Design {
  id: number;
  name: string;
  category: string;
  image: string;
  description: string;
  color: string;
  material: string;
  season: string;
}

async function migrateJsonToMongo(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DB_NAME || 'fashion_designer_db';
  const jsonFilePath = path.join(__dirname, '../designs.json');

  console.log('🚀 Starting migration from JSON to MongoDB...\n');

  // Check if JSON file exists
  if (!fs.existsSync(jsonFilePath)) {
    console.error('❌ designs.json not found at:', jsonFilePath);
    process.exit(1);
  }

  // Read JSON data
  let designs: Design[] = [];
  try {
    const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
    designs = JSON.parse(fileContent);
    console.log(`✓ Read ${designs.length} designs from JSON file`);
  } catch (error) {
    console.error('❌ Error reading JSON file:', error);
    process.exit(1);
  }

  // Connect to MongoDB
  let client: MongoClient | null = null;
  try {
    client = new MongoClient(mongoUri);
    await client.connect();
    console.log('✓ Connected to MongoDB');

    const db = client.db(dbName);
    const collection = db.collection('designs');

    // Check if collection already has data
    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      console.log(`\n⚠️  Warning: MongoDB collection already has ${existingCount} designs`);
      console.log('Do you want to:');
      console.log('1. Append new designs (duplicate IDs will cause errors)');
      console.log('2. Replace all existing designs');
      console.log('\nRunning in APPEND mode...\n');
    }

    // Add createdAt and updatedAt fields
    const designsWithTimestamps = designs.map(design => ({
      ...design,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Insert designs
    const result = await collection.insertMany(designsWithTimestamps);
    console.log(`✓ Inserted ${result.insertedCount} designs into MongoDB`);

    // Create indexes
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ createdAt: -1 });
    console.log('✓ Created indexes on collections');

    // Verify data
    const totalCount = await collection.countDocuments();
    console.log(`✓ Total designs in MongoDB: ${totalCount}`);

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('✓ Disconnected from MongoDB');
    }
  }
}

// Run migration
migrateJsonToMongo();
