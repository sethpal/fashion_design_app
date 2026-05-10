# Fashion Designer Portfolio Website

A modern Node.js web application for fashion designers to showcase and manage their design collection.

## Features

- 📱 Responsive and modern design
- 🎨 Display your fashion designs with details
- 🏷️ Organize designs by categories
- ✏️ Admin panel to add, edit, and delete designs
- 📸 Support for custom design images
- 💾 Persistent storage of designs using JSON

## Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** EJS, HTML5, CSS3
- **Storage:** JSON file-based database

## Installation

1. **Navigate to the project directory:**
   ```bash
   cd fashion_designer_shows
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will start on `http://localhost:3000`

## Usage

### Viewing Designs
- **Home Page:** View all designs in a beautiful grid layout
- **Design Details:** Click on any design to see full details
- **Browse by Category:** Organize designs by categories like Dresses, Jackets, Gowns, etc.

### Admin Panel
Access the admin panel at `http://localhost:3000/admin`

#### Add a New Design
1. Fill out the form with design details:
   - Design Name
   - Category
   - Description
   - Image URL (link to your design image)
   - Color
   - Material
   - Season

2. Click "Add Design" to save

#### Edit a Design
1. Click the "Edit" button on any design in the admin panel
2. Update the details in the modal
3. Click "Save Changes"

#### Delete a Design
1. Click the "Delete" button on any design
2. Confirm the deletion

## Project Structure

```
fashion_designer_shows/
├── server.js              # Express server and routes
├── package.json           # Dependencies and scripts
├── designs.json           # Designs data file
├── public/
│   ├── style.css         # Styling
│   └── admin.js          # Admin panel JavaScript
└── views/
    ├── index.ejs         # Home page
    ├── design-detail.ejs # Design detail page
    ├── category.ejs      # Category page
    ├── admin.ejs         # Admin panel
    └── 404.ejs          # 404 error page
```

## API Endpoints

- `GET /` - Home page with all designs
- `GET /design/:id` - View design details
- `GET /category/:category` - Browse designs by category
- `GET /admin` - Admin panel
- `GET /api/designs` - Get all designs (JSON)
- `POST /api/designs` - Add a new design
- `PUT /api/designs/:id` - Update a design
- `DELETE /api/designs/:id` - Delete a design

## Adding Your Own Images

You can use:
1. **External URLs** - Link to images hosted online (e.g., from your cloud storage)
2. **Local Images** - Place images in the `public/` folder and reference them as `/image-name.jpg`

## Customization

### Change Port
Edit `server.js` and change the PORT variable:
```javascript
const PORT = process.env.PORT || 3000;
```

### Modify Styles
Edit `public/style.css` to customize the appearance

### Add More Categories
Edit the select dropdowns in `views/admin.ejs` and add new categories

## Future Enhancements

- User authentication
- Image upload functionality
- Email notifications
- Database integration (MongoDB, PostgreSQL)
- Payment integration for design orders
- Social media sharing
- Customer inquiries form

## License

This project is open source and available for personal use.

## Support

For questions or issues, please check the code comments or create an issue in your repository.

---

Enjoy showcasing your fashion designs! ✨
