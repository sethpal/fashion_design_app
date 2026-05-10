import { Request, Response } from 'express';
import { designModel, Design } from '../models/designModel';

export class DesignController {
  /**
   * Render home page with all designs
   */
  renderHome = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const { data: designs, total } = await designModel.getAll(page, 12);
      res.render('index', { designs, currentPage: page, totalPages: Math.ceil(total / 12) });
    } catch (error) {
      console.error('Error rendering home:', error);
      res.status(500).render('404');
    }
  };

  /**
   * Render design detail page
   */
  renderDesignDetail = async (req: Request, res: Response): Promise<void> => {
    try {
      const designId = parseInt(req.params.id);
      const design = await designModel.getById(designId);

      if (!design) {
        res.status(404).render('404');
        return;
      }

      res.render('design-detail', { design });
    } catch (error) {
      console.error('Error rendering design detail:', error);
      res.status(500).render('404');
    }
  };

  /**
   * Render category page with filtered designs
   */
  renderCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const category = req.params.category;
      const page = parseInt(req.query.page as string) || 1;
      const { data: designs, total } = await designModel.getByCategory(category, page, 12);

      res.render('category', {
        designs,
        category,
        currentPage: page,
        totalPages: Math.ceil(total / 12),
      });
    } catch (error) {
      console.error('Error rendering category:', error);
      res.status(500).render('404');
    }
  };

  /**
   * Render admin panel
   */
  renderAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { data: designs } = await designModel.getAll(1, 100);
      res.render('admin', { designs });
    } catch (error) {
      console.error('Error rendering admin:', error);
      res.status(500).send('Error loading admin panel');
    }
  };

  /**
   * API: Get all designs as JSON with pagination
   */
  getAllDesigns = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await designModel.getAll(page, limit);
      res.json(result);
    } catch (error) {
      console.error('Error getting designs:', error);
      res.status(500).json({ error: 'Failed to fetch designs' });
    }
  };

  /**
   * API: Search designs
   */
  searchDesigns = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query) {
        res.status(400).json({ error: 'Search query required' });
        return;
      }

      const result = await designModel.search(query, page, limit);
      res.json(result);
    } catch (error) {
      console.error('Error searching designs:', error);
      res.status(500).json({ error: 'Failed to search designs' });
    }
  };

  /**
   * API: Create a new design
   */
  createDesign = async (req: Request, res: Response): Promise<void> => {
    try {
      const designData = req.body;

      // Validate required fields
      if (!designData.name || !designData.category || !designData.image) {
        res.status(400).json({ error: 'Missing required fields: name, category, image' });
        return;
      }

      const newDesign = await designModel.create(designData);
      res.status(201).json(newDesign);
    } catch (error) {
      console.error('Error creating design:', error);
      res.status(500).json({ error: 'Failed to create design' });
    }
  };

  /**
   * API: Update a design
   */
  updateDesign = async (req: Request, res: Response): Promise<void> => {
    try {
      const designId = parseInt(req.params.id);
      const designData = req.body;

      const updatedDesign = await designModel.update(designId, designData);

      if (!updatedDesign) {
        res.status(404).json({ error: 'Design not found' });
        return;
      }

      res.json(updatedDesign);
    } catch (error) {
      console.error('Error updating design:', error);
      res.status(500).json({ error: 'Failed to update design' });
    }
  };

  /**
   * API: Delete a design
   */
  deleteDesign = async (req: Request, res: Response): Promise<void> => {
    try {
      const designId = parseInt(req.params.id);
      const deletedDesign = await designModel.delete(designId);

      if (!deletedDesign) {
        res.status(404).json({ error: 'Design not found' });
        return;
      }

      res.json(deletedDesign);
    } catch (error) {
      console.error('Error deleting design:', error);
      res.status(500).json({ error: 'Failed to delete design' });
    }
  };

  /**
   * API: Get category statistics
   */
  getCategoryStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await designModel.getCategoryStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting category stats:', error);
      res.status(500).json({ error: 'Failed to fetch category statistics' });
    }
  };
}
