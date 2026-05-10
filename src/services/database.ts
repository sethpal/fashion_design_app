import { MongoClient, Db, Collection } from 'mongodb';
import config from '../config/config';

export class Database {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  async connect(): Promise<void> {
    try {
      this.client = new MongoClient(config.mongodb.uri);
      await this.client.connect();
      this.db = this.client.db(config.mongodb.dbName);
      
      // Create collections and indexes
      await this.initializeCollections();
      
      console.log('✓ Connected to MongoDB');
    } catch (error) {
      console.error('✗ MongoDB connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      console.log('✓ Disconnected from MongoDB');
    }
  }

  private async initializeCollections(): Promise<void> {
    if (!this.db) return;

    try {
      // Create designs collection if it doesn't exist
      const collections = await this.db.listCollections().toArray();
      const designsExists = collections.some(col => col.name === 'designs');

      if (!designsExists) {
        await this.db.createCollection('designs');
      }

      // Create indexes for better query performance
      const designsCollection = this.db.collection('designs');
      await designsCollection.createIndex({ id: 1 }, { unique: true });
      await designsCollection.createIndex({ category: 1 });
      await designsCollection.createIndex({ createdAt: -1 });

      console.log('✓ Collections and indexes initialized');
    } catch (error) {
      console.error('✗ Failed to initialize collections:', error);
      throw error;
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  getCollection(name: string): Collection {
    const db = this.getDb();
    return db.collection(name);
  }

  isConnected(): boolean {
    return this.client !== null && this.db !== null;
  }
}

export const database = new Database();
