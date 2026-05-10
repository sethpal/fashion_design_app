import express, { Express, Request, Response } from 'express';
import path from 'path';
import config from './config/config';
import { database } from './services/database';
import { cache } from './services/cache';
import designRoutes from './routes/designRoutes';

class Server {
  private app: Express;
  private port: number | string;

  constructor() {
    this.app = express();
    this.port = config.port;
    this.setupMiddleware();
    this.setupViewEngine();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    this.app.use(express.static(path.join(__dirname, '../public')));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging middleware
    this.app.use((req: Request, res: Response, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup EJS view engine
   */
  private setupViewEngine(): void {
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, '../views'));
  }

  /**
   * Setup application routes
   */
  private setupRoutes(): void {
    this.app.use(designRoutes);
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).render('404');
    });

    // Global error handler
    this.app.use((err: Error, req: Request, res: Response) => {
      console.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  /**
   * Initialize database and cache connections
   */
  private async initializeServices(): Promise<void> {
    try {
      console.log('🚀 Initializing services...\n');

      // Connect to MongoDB
      await database.connect();

      // Connect to Redis
      await cache.connect();

      console.log('✓ All services initialized\n');
    } catch (error) {
      console.error('✗ Failed to initialize services:', error);
      process.exit(1);
    }
  }

  /**
   * Setup graceful shutdown
   */
  private setupGracefulShutdown(): void {
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down gracefully...');
      await database.disconnect();
      await cache.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Shutting down gracefully...');
      await database.disconnect();
      await cache.disconnect();
      process.exit(0);
    });
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      await this.initializeServices();
      this.setupGracefulShutdown();

      this.app.listen(this.port, () => {
        console.log(`✓ Server running at http://localhost:${this.port}`);
        console.log(`✓ Environment: ${config.nodeEnv}\n`);
      });
    } catch (error) {
      console.error('✗ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Create and start the server
const server = new Server();
server.start();

export default server;
