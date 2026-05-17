import { createClient, RedisClient } from 'redis';
import config from '../config/config';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class Cache {
  private client: RedisClient | null = null;
  private isConnected: boolean = false;
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private useMemoryFallback: boolean = false;

  async connect(): Promise<void> {
    try {
      this.client = createClient({
        socket: {
          host: config.redis.host,
          port: config.redis.port,
          reconnectStrategy: () => new Error('No reconnect'),
        },
        password: config.redis.password,
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('✓ Connected to Redis');
        this.isConnected = true;
      });

      // Add a timeout for connection attempt
      await Promise.race([
        this.client.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Redis connection timeout')), 3000)
        ),
      ]);
    } catch (error) {
      console.error('✗ Redis connection failed:', error);
      console.warn('⚠ Using in-memory cache as fallback');
      this.useMemoryFallback = true;
      this.isConnected = true;
      if (this.client) {
        this.client = null;
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      console.log('✓ Disconnected from Redis');
    }
    this.memoryCache.clear();
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) {
      return null;
    }

    if (this.useMemoryFallback) {
      const entry = this.memoryCache.get(key);
      if (!entry) return null;
      
      if (entry.expiresAt < Date.now()) {
        this.memoryCache.delete(key);
        return null;
      }
      
      return entry.value as T;
    }

    try {
      const data = await this.client!.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = config.cache.ttl): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    if (this.useMemoryFallback) {
      this.memoryCache.set(key, {
        value,
        expiresAt: Date.now() + (ttl * 1000),
      });
      return true;
    }

    try {
      await this.client!.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    if (this.useMemoryFallback) {
      this.memoryCache.delete(key);
      return true;
    }

    try {
      await this.client!.del(key);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  async invalidatePattern(pattern: string): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    if (this.useMemoryFallback) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      for (const key of this.memoryCache.keys()) {
        if (regex.test(key)) {
          this.memoryCache.delete(key);
        }
      }
      return true;
    }

    try {
      const keys = await this.client!.keys(pattern);
      if (keys.length > 0) {
        await this.client!.del(keys);
      }
      return true;
    } catch (error) {
      console.error(`Cache invalidation error for pattern ${pattern}:`, error);
      return false;
    }
  }
}

export const cache = new Cache();
