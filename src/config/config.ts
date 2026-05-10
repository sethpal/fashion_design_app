import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  nodeEnv: string;
  port: number | string;
  mongodb: {
    uri: string;
    dbName: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  cache: {
    ttl: number;
  };
  logging: {
    level: string;
  };
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGODB_DB_NAME || 'fashion_designer_db',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600'),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;
