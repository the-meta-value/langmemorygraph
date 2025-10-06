# NGrok Setup for Dynamic Memory Graph

## Quick Setup Steps:

### 1. Create NGrok Account (Free)
- Go to: https://dashboard.ngrok.com/signup
- Sign up with email/GitHub/Google

### 2. Get Your Authtoken
- After signing up, go to: https://dashboard.ngrok.com/get-started/your-authtoken
- Copy your authtoken (looks like: `2abc123_def456ghi789jkl012mno345pqr678stu`)

### 3. Configure NGrok
```bash
~/ngrok authtoken YOUR_AUTHTOKEN_HERE
```

### 4. Start Database Tunnel
```bash
~/ngrok tcp 3306
```

### 5. Copy the Forwarding Address
You'll see something like:
```
Forwarding: tcp://2.tcp.ngrok.io:12345 -> localhost:3306
```

Copy the `2.tcp.ngrok.io` and `12345` parts.

### 6. Add to Netlify Environment Variables

Go to your Netlify site → Site Settings → Environment Variables → Add variable:

```
DB_HOST=2.tcp.ngrok.io
DB_PORT=12345
DB_USER=root
DB_PASSWORD=lilfarty2025
DB_NAME=lang_memories
```

### 7. Deploy and Test

After adding the environment variables:
1. **Trigger a new deploy** in Netlify (or clear cache and deploy)
2. **Check browser console** - should see "Loading live data from database..."
3. **Graph should update** with real-time memory data!

## Testing the Connection

Once deployed, check the browser console:
- ✅ "Loading live data from database..." 
- ✅ "Loaded X nodes and Y edges"
- ❌ If you see "Database connection failed" - check environment variables

## Alternative: Cloud Database (No NGrok Needed)

If you prefer not to use ngrok, you can migrate to a cloud database:

**Railway** (Easiest):
1. Go to railway.app
2. Create new project → Deploy MariaDB
3. Import your database dump
4. Use their connection string in Netlify

**PlanetScale** (Best for production):
1. Go to planetscale.com  
2. Create free MySQL database
3. Import your data
4. Use their connection details

## Security Notes

- ✅ NGrok provides HTTPS tunnels
- ✅ Database credentials are in Netlify environment (not code)
- ✅ Read-only queries only
- ⚠️ NGrok free tier has connection limits
- ⚠️ NGrok URLs change when restarted (unless paid plan)

## Keeping NGrok Running

For continuous operation:
```bash
# Run in tmux/screen to keep running after SSH disconnect
tmux new-session -d -s ngrok ~/ngrok tcp 3306

# Check status
tmux attach -t ngrok
```

Once this is set up, your memory graph will be truly dynamic! 🚀