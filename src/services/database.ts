import { MongoClient, Db, Collection } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';
import config from '../config/config';

// In-memory query builder
class InMemoryCursor {
  private data: any[];
  private filterQuery: any = {};
  private sortOrder: any = {};
  private skipCount: number = 0;
  private limitCount: number = Infinity;
  private options: any = {};

  constructor(data: any[]) {
    this.data = [...data];
  }

  match(query: any): InMemoryCursor {
    this.filterQuery = query;
    return this;
  }

  skip(n: number): InMemoryCursor {
    this.skipCount = n;
    return this;
  }

  limit(n: number): InMemoryCursor {
    this.limitCount = n;
    return this;
  }

  sort(sortObj: any): InMemoryCursor {
    this.sortOrder = sortObj;
    return this;
  }

  async toArray(): Promise<any[]> {
    let result = this.data.filter(doc => this.matchesQuery(doc, this.filterQuery));

    // Apply sorting
    if (Object.keys(this.sortOrder).length > 0) {
      result.sort((a, b) => {
        for (const [key, order] of Object.entries(this.sortOrder)) {
          const aVal = a[key];
          const bVal = b[key];
          if (aVal < bVal) return order === 1 ? -1 : 1;
          if (aVal > bVal) return order === 1 ? 1 : -1;
        }
        return 0;
      });
    }

    // Apply skip and limit
    result = result.slice(this.skipCount, this.skipCount + this.limitCount);
    return result;
  }

  async toArrayWithOptions(options: any): Promise<any[]> {
    if (options.sort) {
      this.sort(options.sort);
    }
    return this.toArray();
  }

  private matchesQuery(doc: any, query: any): boolean {
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'object' && value !== null && '$regex' in value) {
        const regex = new RegExp(value.$regex, value.$options || '');
        if (!regex.test(doc[key])) return false;
      } else if (doc[key] !== value) {
        return false;
      }
    }
    return true;
  }
}

// In-memory collection implementation
class InMemoryCollection {
  private data: any[] = [];
  private nextId: number = 1;

  async findOne(query: any, options: any = {}): Promise<any | null> {
    if (options.sort) {
      const sorted = this.data
        .filter(doc => this.matchesQuery(doc, query))
        .sort((a, b) => {
          for (const [key, order] of Object.entries(options.sort)) {
            if (a[key] < b[key]) return order === 1 ? -1 : 1;
            if (a[key] > b[key]) return order === 1 ? 1 : -1;
          }
          return 0;
        });
      return sorted[0] || null;
    }
    return this.data.find(doc => this.matchesQuery(doc, query)) || null;
  }

  find(query: any = {}): InMemoryCursor {
    const cursor = new InMemoryCursor(this.data);
    return cursor.match(query);
  }

  async insertOne(doc: any): Promise<any> {
    const newDoc = { _id: this.nextId++, ...doc };
    this.data.push(newDoc);
    return { insertedId: newDoc._id };
  }

  async updateOne(filter: any, update: any): Promise<any> {
    const index = this.data.findIndex(doc => this.matchesQuery(doc, filter));
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...update.$set };
      return { modifiedCount: 1 };
    }
    return { modifiedCount: 0 };
  }

  async findOneAndUpdate(filter: any, update: any, options: any = {}): Promise<any> {
    const index = this.data.findIndex(doc => this.matchesQuery(doc, filter));
    if (index !== -1) {
      const oldDoc = this.data[index];
      this.data[index] = { ...this.data[index], ...update.$set };
      if (options.returnDocument === 'after') {
        return { value: this.data[index] };
      }
      return { value: oldDoc };
    }
    return { value: null };
  }

  async deleteOne(filter: any): Promise<any> {
    const index = this.data.findIndex(doc => this.matchesQuery(doc, filter));
    if (index !== -1) {
      this.data.splice(index, 1);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  async countDocuments(query: any = {}): Promise<number> {
    return this.data.filter(doc => this.matchesQuery(doc, query)).length;
  }

  async createIndex(): Promise<void> {
    // No-op for in-memory collection
  }

  private matchesQuery(doc: any, query: any): boolean {
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'object' && value !== null && '$regex' in value) {
        const regex = new RegExp(value.$regex, value.$options || '');
        if (!regex.test(doc[key])) return false;
      } else if (doc[key] !== value) {
        return false;
      }
    }
    return true;
  }
}

// In-memory database implementation
class InMemoryDb {
  private collections: Map<string, InMemoryCollection> = new Map();

  collection(name: string): InMemoryCollection {
    if (!this.collections.has(name)) {
      this.collections.set(name, new InMemoryCollection());
    }
    return this.collections.get(name)!;
  }

  async listCollections(): Promise<any[]> {
    return Array.from(this.collections.keys()).map(name => ({ name }));
  }

  async createCollection(name: string): Promise<void> {
    if (!this.collections.has(name)) {
      this.collections.set(name, new InMemoryCollection());
    }
  }
}

export class Database {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private inMemoryDb: InMemoryDb | null = null;
  private useMemoryFallback: boolean = false;

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
      console.warn('⚠ Using in-memory database as fallback');
      this.useMemoryFallback = true;
      this.inMemoryDb = new InMemoryDb();
      await this.inMemoryDb.createCollection('designs');
      
      // Load seed data from designs.json
      await this.loadSeedData();
      
      console.log('✓ In-memory database initialized');
    }
  }

  private async loadSeedData(): Promise<void> {
    try {
      const jsonFilePath = path.join(__dirname, '../../designs.json');
      
      if (!fs.existsSync(jsonFilePath)) {
        console.warn('⚠ designs.json not found, starting with empty database');
        return;
      }

      const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
      const designs = JSON.parse(fileContent);

      const collection = this.inMemoryDb!.collection('designs');

      // Insert designs with timestamps
      for (const design of designs) {
        await collection.insertOne({
          ...design,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      console.log(`✓ Loaded ${designs.length} designs from designs.json`);
    } catch (error) {
      console.error('✗ Error loading seed data:', error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      console.log('✓ Disconnected from MongoDB');
    }
    if (this.inMemoryDb) {
      this.inMemoryDb = null;
    }
  }

  private async initializeCollections(): Promise<void> {
    if (this.useMemoryFallback) {
      return;
    }

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

  getDb(): Db | InMemoryDb {
    if (this.useMemoryFallback && this.inMemoryDb) {
      return this.inMemoryDb as any;
    }
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  getCollection(name: string): Collection | InMemoryCollection {
    if (this.useMemoryFallback && this.inMemoryDb) {
      return this.inMemoryDb.collection(name) as any;
    }
    const db = this.getDb();
    return (db as any).collection(name);
  }

  isConnected(): boolean {
    return this.useMemoryFallback || (this.client !== null && this.db !== null);
  }
}

export const database = new Database();
