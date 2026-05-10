const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Helper function to read designs
const getDesigns = () => {
  try {
    const data = fs.readFileSync('designs.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading designs:', error);
    return [];
  }
};

// Helper function to save designs
const saveDesigns = (designs) => {
  try {
    fs.writeFileSync('designs.json', JSON.stringify(designs, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving designs:', error);
    return false;
  }
};

// Routes

// Home page - Display all designs
app.get('/', (req, res) => {
  const designs = getDesigns();
  res.render('index', { designs });
});

// Design detail page
app.get('/design/:id', (req, res) => {
  const designs = getDesigns();
  const design = designs.find(d => d.id === parseInt(req.params.id));
  
  if (!design) {
    return res.status(404).render('404');
  }
  
  res.render('design-detail', { design });
});

// Browse by category
app.get('/category/:category', (req, res) => {
  const designs = getDesigns();
  const category = req.params.category;
  const filteredDesigns = designs.filter(d => d.category.toLowerCase() === category.toLowerCase());
  
  res.render('category', { designs: filteredDesigns, category });
});

// Admin page - Add/Edit designs
app.get('/admin', (req, res) => {
  const designs = getDesigns();
  res.render('admin', { designs });
});

// API: Get all designs (JSON)
app.get('/api/designs', (req, res) => {
  const designs = getDesigns();
  res.json(designs);
});

// API: Add new design
app.post('/api/designs', (req, res) => {
  const designs = getDesigns();
  const newDesign = {
    id: Math.max(...designs.map(d => d.id), 0) + 1,
    name: req.body.name,
    category: req.body.category,
    image: req.body.image,
    description: req.body.description,
    color: req.body.color,
    material: req.body.material,
    season: req.body.season
  };
  
  designs.push(newDesign);
  
  if (saveDesigns(designs)) {
    res.status(201).json(newDesign);
  } else {
    res.status(500).json({ error: 'Failed to save design' });
  }
});

// API: Update design
app.put('/api/designs/:id', (req, res) => {
  const designs = getDesigns();
  const design = designs.find(d => d.id === parseInt(req.params.id));
  
  if (!design) {
    return res.status(404).json({ error: 'Design not found' });
  }
  
  design.name = req.body.name || design.name;
  design.category = req.body.category || design.category;
  design.image = req.body.image || design.image;
  design.description = req.body.description || design.description;
  design.color = req.body.color || design.color;
  design.material = req.body.material || design.material;
  design.season = req.body.season || design.season;
  
  if (saveDesigns(designs)) {
    res.json(design);
  } else {
    res.status(500).json({ error: 'Failed to update design' });
  }
});

// API: Delete design
app.delete('/api/designs/:id', (req, res) => {
  const designs = getDesigns();
  const index = designs.findIndex(d => d.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Design not found' });
  }
  
  const deletedDesign = designs.splice(index, 1);
  
  if (saveDesigns(designs)) {
    res.json(deletedDesign[0]);
  } else {
    res.status(500).json({ error: 'Failed to delete design' });
  }
});

// Error handling
app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(PORT, () => {
  console.log(`Fashion Designer Portfolio running at http://localhost:${PORT}`);
});
