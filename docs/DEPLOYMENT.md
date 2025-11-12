# Deployment Guide - IdeaHub

## Platform Recommendation: Vercel

This project is deployed on **Vercel** because:
- Full-stack support (React frontend + Express backend)
- Native Express.js support
- Easy GitHub integration
- Built-in password protection for private access
- Free subdomain (no custom domain required)

## Prerequisites

1. GitHub account with your repository
2. Vercel account (free tier is sufficient)
3. Supabase project configured

## Deployment Steps

### 1. Frontend Deployment

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the frontend project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=https://your-backend-url.vercel.app/api
   ```

6. Deploy

### 2. Backend Deployment

1. Create a new Vercel project for the backend:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

2. Configure as Serverless Function:
   - Vercel will automatically detect Express.js
   - Create `vercel.json` in the backend directory (see below)

3. Add Environment Variables:
   ```
   PORT=3000
   NODE_ENV=production
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
   API_VERSION=v1
   ```

4. Deploy

### 3. Password Protection (Private Access)

To restrict access without an invite system:

1. In Vercel dashboard, go to your **frontend project**
2. Navigate to **Settings** → **Deployment Protection**
3. Enable **Password Protection**
4. Set a password (share this with authorized users)
5. Optionally enable **Vercel Authentication** for more control

**Alternative**: Use Vercel's built-in authentication:
- Go to **Settings** → **Deployment Protection**
- Enable **Vercel Authentication**
- Add authorized email addresses

### 4. Update Frontend API URL

After backend deployment, update the frontend environment variable:
```
VITE_API_URL=https://your-backend-url.vercel.app/api
```

Redeploy the frontend to apply changes.

## Vercel Configuration Files

### Backend: `backend/vercel.json`

The `vercel.json` file has been created in the backend directory. This configures Vercel to run your Express app as a serverless function.

**Note**: The server code (`backend/src/server.ts`) has been updated to work both locally and on Vercel:
- Locally: Runs as a traditional Node.js server with `app.listen()`
- On Vercel: Exports the Express app for serverless execution

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ]
}
```

### Alternative: Serverless Function Approach

If the above doesn't work, create `backend/api/index.ts`:

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import server from '../src/server';

export default (req: VercelRequest, res: VercelResponse) => {
  return server(req, res);
};
```

## Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend API responding at `/health` endpoint
- [ ] CORS configured correctly
- [ ] Environment variables set for both projects
- [ ] Password protection enabled (if needed)
- [ ] Test authentication flow
- [ ] Test API endpoints from frontend

## Troubleshooting

### Backend not working
- Ensure `vercel.json` is configured correctly
- Check that Express app exports correctly
- Verify environment variables are set

### CORS errors
- Update `ALLOWED_ORIGINS` in backend env vars
- Include both frontend URL and any localhost URLs for testing

### Environment variables not loading
- Ensure variables are prefixed correctly (`VITE_` for frontend)
- Redeploy after adding new variables

## Cost

- **Vercel Free Tier**: 
  - 100GB bandwidth/month
  - Unlimited deployments
  - Password protection included
  - Perfect for closed-beta MVP

## Next Steps

Once you're ready to go public:
1. Remove password protection
2. Add a custom domain (optional)
3. Set up analytics (Vercel Analytics or Google Analytics)
4. Implement proper invite system if needed

