# Lang's Memory Graph - Dynamic Version

This is an interactive visualization of Lang's memory network with real-time database connectivity.

## Features
- 🔄 **Dynamic Data**: Fetches live memory data from MariaDB
- 📊 **Interactive Graph**: Explore 1,364+ memories and their relationships
- 🔍 **Search**: Find specific memories, entities, or topics
- 🎨 **Obsidian-style**: Beautiful dark theme with glowing nodes
- 🚀 **Auto-updates**: Shows new memories as Lang creates them

## Deployment on Netlify

### Method 1: With Database Connection (Dynamic)

1. **Set up Database Access**
   - Option A: Use ngrok to expose local MariaDB (for testing)
     ```bash
     ngrok tcp 3306
     ```
   - Option B: Use a cloud database service (recommended for production)
     - PlanetScale, Railway, Aiven, or Amazon RDS

2. **Configure Netlify Environment Variables**
   Go to Site Settings → Environment Variables and add:
   ```
   DB_HOST=your-database-host
   DB_PORT=3306
   DB_USER=your-username
   DB_PASSWORD=your-password
   DB_NAME=lang_memories
   ```

3. **Deploy to Netlify**
   - Drag the `graph-viewer` folder to Netlify
   - Or connect GitHub repo for auto-deploy

### Method 2: Static Fallback (No Database)

If database connection fails, the app automatically falls back to the static `memories.json` file.

To update static data:
1. Run `python3 export_graph.py` in the Lang folder
2. Copy the generated `memories.json` to the graph-viewer folder
3. Redeploy to Netlify

## File Structure

```
graph-viewer/
├── index.html           # Main HTML page
├── style.css           # Obsidian-style dark theme
├── graph.js            # Visualization logic (updated for dynamic fetch)
├── memories.json       # Static fallback data
├── package.json        # Node dependencies for Netlify Functions
├── netlify.toml        # Netlify configuration
└── netlify/
    └── functions/
        └── get-memories.js  # Serverless function for database queries
```

## How It Works

1. **Page Load**: `graph.js` tries to fetch from `/.netlify/functions/get-memories`
2. **Database Query**: The function connects to MariaDB and queries memories
3. **Data Processing**: Memories are processed into nodes and edges
4. **Visualization**: vis.js renders the interactive graph
5. **Fallback**: If database fails, loads static `memories.json`

## Security Notes

- Database credentials are stored in Netlify environment variables (never in code)
- The function uses read-only queries
- Connection pooling is limited to prevent overload
- CORS headers are configured for your domain

## Local Development

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Install dependencies
npm install

# Set up local environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run locally with functions
netlify dev
```

## Updating Memories

The graph updates automatically when:
- New memories are added to the database
- Users refresh the page
- The visualization pulls fresh data every page load

No manual updates needed once database connection is configured!

## Troubleshooting

- **"Cannot find memories.json"**: Check that file is in the root of deployed folder
- **Database connection failed**: Verify environment variables in Netlify settings
- **Nodes clustering**: This means no edges were created - check entity extraction
- **Slow loading**: Database queries may take a moment on first load

## Future Enhancements

- [ ] WebSocket for real-time updates
- [ ] Memory timeline view
- [ ] Advanced filtering options
- [ ] Export graph as image
- [ ] Memory statistics dashboard
