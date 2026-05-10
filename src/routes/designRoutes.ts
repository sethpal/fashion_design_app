import { Router } from 'express';
import { DesignController } from '../controllers/designController';

const router = Router();
const designController = new DesignController();

// Web Routes (Server-side rendering)
router.get('/', designController.renderHome);
router.get('/design/:id', designController.renderDesignDetail);
router.get('/category/:category', designController.renderCategory);
router.get('/admin', designController.renderAdmin);

// API Routes
router.get('/api/designs', designController.getAllDesigns);
router.get('/api/designs/search', designController.searchDesigns);
router.get('/api/designs/stats/categories', designController.getCategoryStats);
router.post('/api/designs', designController.createDesign);
router.put('/api/designs/:id', designController.updateDesign);
router.delete('/api/designs/:id', designController.deleteDesign);

export default router;
