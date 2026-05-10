# Fashion Designer Portfolio Website

A modern Node.js web application for fashion designers to showcase and manage their design collection.

Built with **Express.js, TypeScript, and EJS** following a clean **MVC architecture**.

## Features

- 📱 Responsive and modern design
- 🎨 Display your fashion designs with details
- 🏷️ Organize designs by categories
- ✏️ Admin panel to add, edit, and delete designs
- 📸 Support for custom design images
- 💾 Persistent storage of designs using JSON
- 🏗️ Clean MVC architecture with TypeScript

## Tech Stack

- **Backend:** Node.js, Express.js, TypeScript
- **Frontend:** EJS, HTML5, CSS3
- **Storage:** JSON file-based database
- **Language:** TypeScript with strict type checking

## Project Structure

```
fashion_designer_shows/
├── src/
│   ├── server.ts              # Express app setup and initialization
│   ├── models/
│   │   └── designModel.ts     # Data access layer
│   ├── controllers/
│   │   └── designController.ts # Business logic and route handlers
│   ├── routes/
│   │   └── designRoutes.ts    # Route definitions
│   ├── views/
│   │   ├── index.ejs          # Home page
│   │   ├── design-detail.ejs  # Design detail page
│   │   ├── category.ejs       # Category page
│   │   ├── admin.ejs          # Admin panel
│   │   └── 404.ejs            # 404 error page
│   └── public/
│       ├── style.css          # Styling
│       └── admin.js           # Admin panel JavaScript
├── dist/                      # Compiled JavaScript (generated)
├── designs.json               # Designs data file
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

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

1. **Build TypeScript to JavaScript:**
   ```bash
   npm run build
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

The application will start on `http://localhost:3000`

## Architecture

### MVC Pattern

**Model (`designModel.ts`):**
- `DesignModel` class handles all data operations
- Methods: `getAll()`, `getById()`, `getByCategory()`, `create()`, `update()`, `delete()`
- Type-safe with TypeScript interfaces
- Isolated from controller logic

**Controller (`designController.ts`):**
- `DesignController` class handles HTTP requests and responses
- Manages business logic and calls model methods
- Methods: `renderHome()`, `renderDesignDetail()`, `renderCategory()`, `renderAdmin()`, `getAllDesigns()`, `createDesign()`, `updateDesign()`, `deleteDesign()`
- Clean separation from routes and data access

**Routes (`designRoutes.ts`):**
- Defines all application routes
- Maps HTTP requests to controller methods
- Organized and maintainable

**Views (`views/` folder):**
- EJS templates for server-side rendering
- Responsive HTML structure

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
Edit `src/server.ts` and modify the port:
```typescript
private port: number | string;

constructor() {
  this.port = process.env.PORT || 3000;
}
```

### Modify Styles
Edit `public/style.css` to customize the appearance

### Add More Categories
Edit the select dropdowns in `views/admin.ejs` and add new categories

## TypeScript Configuration

- **Target:** ES2020
- **Module:** CommonJS
- **Strict Mode:** Enabled for type safety
- **Output Directory:** `dist/`
- **Source Directory:** `src/`

## Future Enhancements

- User authentication
- Image upload functionality (replace URL inputs with file uploads)
- Database integration (MongoDB, PostgreSQL)
- Payment integration for design orders
- Email notifications
- Social media sharing
- REST API documentation with Swagger
- Unit and integration tests
- Continuous Integration/Deployment

## Development Tips

1. **Type Safety:** TypeScript helps catch errors at compile time
2. **Auto-reload:** Use `npm run dev` for automatic server restarts
3. **Build Before Deploy:** Always run `npm run build` before production deployment
4. **Error Handling:** Check console for detailed error messages

## License

This project is open source and available for personal use.

## Support

For questions or issues, please check the code comments or create an issue in your repository.

---

Enjoy showcasing your fashion designs! ✨
