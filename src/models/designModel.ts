import { ObjectId } from 'mongodb';
import { database } from '../services/database';
import { cache } from '../services/cache';

export interface Design {
  _id?: ObjectId;
  id: number;
  name: string;
  category: string;
  image: string;
  description: string;
  color: string;
  material: string;
  season: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class DesignModel {
  private collectionName = 'designs';

  /**
   * Get all designs with pagination support
   */
  async getAll(page: number = 1, limit: number = 10): Promise<{ data: Design[]; total: number }> {
    const cacheKey = `designs:all:${page}:${limit}`;
    
    // Try to get from cache
    const cached = await cache.get<{ data: Design[]; total: number }>(cacheKey);
    if (cached) {
      return cached;
    }

    const collection = database.getCollection(this.collectionName);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      collection.find({}).skip(skip).limit(limit).sort({ createdAt: -1 }).toArray() as Promise<Design[]>,
      collection.countDocuments(),
    ]);

    const result = { data, total };
    await cache.set(cacheKey, result);
    return result;
  }

  /**
   * Get design by ID
   */
  async getById(id: number): Promise<Design | null> {
    const cacheKey = `design:${id}`;

    // Try to get from cache
    const cached = await cache.get<Design>(cacheKey);
    if (cached) {
      return cached;
    }

    const collection = database.getCollection(this.collectionName);
    const design = (await collection.findOne({ id })) as Design | null;

    if (design) {
      await cache.set(cacheKey, design);
    }

    return design;
  }

  /**
   * Get designs by category with pagination
   */
  async getByCategory(category: string, page: number = 1, limit: number = 10): Promise<{ data: Design[]; total: number }> {
    const cacheKey = `designs:category:${category}:${page}:${limit}`;

    // Try to get from cache
    const cached = await cache.get<{ data: Design[]; total: number }>(cacheKey);
    if (cached) {
      return cached;
    }

    const collection = database.getCollection(this.collectionName);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      collection
        .find({ category: { $regex: category, $options: 'i' } })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .toArray() as Promise<Design[]>,
      collection.countDocuments({ category: { $regex: category, $options: 'i' } }),
    ]);

    const result = { data, total };
    await cache.set(cacheKey, result);
    return result;
  }

  /**
   * Create a new design
   */
  async create(designData: Omit<Design, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<Design> {
    const collection = database.getCollection(this.collectionName);

    // Get next ID
    const lastDesign = (await collection.findOne({}, { sort: { id: -1 } })) as Design | null;
    const nextId = lastDesign ? lastDesign.id + 1 : 1;

    const newDesign: Design = {
      id: nextId,
      ...designData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newDesign);
    newDesign._id = result.insertedId;

    // Invalidate all designs cache
    await cache.invalidatePattern('designs:*');

    return newDesign;
  }

  /**
   * Update an existing design
   */
  async update(id: number, designData: Partial<Design>): Promise<Design | null> {
    const collection = database.getCollection(this.collectionName);

    const updatedDesign = {
      ...designData,
      updatedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { id },
      { $set: updatedDesign },
      { returnDocument: 'after' }
    );

    if (result.value) {
      // Invalidate caches
      await cache.delete(`design:${id}`);
      await cache.invalidatePattern('designs:*');

      return result.value as Design;
    }

    return null;
  }

  /**
   * Delete a design
   */
  async delete(id: number): Promise<Design | null> {
    const collection = database.getCollection(this.collectionName);

    const result = await collection.findOneAndDelete({ id });

    if (result.value) {
      // Invalidate caches
      await cache.delete(`design:${id}`);
      await cache.invalidatePattern('designs:*');

      return result.value as Design;
    }

    return null;
  }

  /**
   * Search designs by name or description
   */
  async search(query: string, page: number = 1, limit: number = 10): Promise<{ data: Design[]; total: number }> {
    const cacheKey = `designs:search:${query}:${page}:${limit}`;

    // Try to get from cache
    const cached = await cache.get<{ data: Design[]; total: number }>(cacheKey);
    if (cached) {
      return cached;
    }

    const collection = database.getCollection(this.collectionName);
    const skip = (page - 1) * limit;

    const searchFilter = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ],
    };

    const [data, total] = await Promise.all([
      collection
        .find(searchFilter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .toArray() as Promise<Design[]>,
      collection.countDocuments(searchFilter),
    ]);

    const result = { data, total };
    await cache.set(cacheKey, result);
    return result;
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(): Promise<Record<string, number>> {
    const cacheKey = 'designs:stats:categories';

    // Try to get from cache
    const cached = await cache.get<Record<string, number>>(cacheKey);
    if (cached) {
      return cached;
    }

    const collection = database.getCollection(this.collectionName);
    const pipeline = [
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ];

    const results = await collection.aggregate(pipeline).toArray();
    const stats: Record<string, number> = {};

    results.forEach((result: any) => {
      stats[result._id] = result.count;
    });

    await cache.set(cacheKey, stats);
    return stats;
  }
}

export const designModel = new DesignModel();
