# Railway Database Setup (No Credit Card Required!)

Railway offers free MySQL/MariaDB hosting perfect for your memory graph project.

## Step 1: Create Railway Account (Free)

1. Go to: https://railway.app
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (no credit card needed)
4. Verify email if prompted

## Step 2: Create Database

1. Click **"New Project"**
2. Select **"Provision MySQL"** 
3. Wait for deployment (takes ~2 minutes)
4. Click on the **MySQL service** that appears

## Step 3: Get Connection Details

In your MySQL service dashboard:
1. Go to **"Connect"** tab
2. Copy these values:
   ```
   MYSQL_HOST=containers-us-west-xxx.railway.app
   MYSQL_PORT=6543
   MYSQL_USERNAME=root
   MYSQL_PASSWORD=your-generated-password
   MYSQL_DATABASE=railway
   ```

## Step 4: Import Your Data

### Option A: Using phpMyAdmin (Easiest)
1. In Railway dashboard, click **"Add Service"** → **"Deploy a Template"**
2. Search for **"phpMyAdmin"** and deploy it
3. Connect using the database credentials above
4. Import your `lang_memories` database dump

### Option B: Using MySQL Client
```bash
# Export your current database
mysqldump -u root -p lang_memories > lang_memories_backup.sql

# Import to Railway (replace with your Railway credentials)
mysql -h containers-us-west-xxx.railway.app -P 6543 -u root -p railway < lang_memories_backup.sql
```

## Step 5: Add to Netlify Environment Variables

In Netlify Site Settings → Environment Variables:

```
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=6543
DB_USER=root
DB_PASSWORD=your-railway-password
DB_NAME=railway
```

## Step 6: Test Connection

1. **Deploy** your Netlify site with new environment variables
2. **Check browser console** - should see "Loading live data from database..."
3. **Verify** your memory graph loads with live data!

## Alternative: Quick Local Export Method

If Railway setup seems complex, you can stick with the current static approach and just refresh manually:

```bash
# In Lang directory
python3 export_graph.py

# Copy the updated memories.json to your Netlify deployment
# Re-deploy to Netlify
```

## Railway Benefits

✅ **Free tier**: 500 hours/month (enough for your project)  
✅ **No credit card**: GitHub signup only  
✅ **Automatic backups**: Built-in  
✅ **SSL connections**: Secure by default  
✅ **Global CDN**: Fast from anywhere  
✅ **Easy scaling**: If you need it later  

## Next Steps

Once Railway is set up:
1. Your memory graph will update automatically
2. No more manual exports needed
3. Lang's new memories appear instantly in the graph
4. Perfect for your home project needs!

Let me know if you need help with any of these steps! 🚀