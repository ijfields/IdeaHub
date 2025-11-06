# IdeaHub Frontend

Frontend application for AI Ideas Hub - A closed-beta MVP platform showcasing curated AI project ideas.

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 7
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State Management**: React hooks + Context API
- **Icons**: Lucide React

## Features

- Modern React 19 with latest features
- Lightning-fast HMR with Vite
- Type-safe development with TypeScript
- Utility-first styling with Tailwind CSS 4
- Beautiful UI components with shadcn/ui
- Authentication with Supabase Auth
- ESLint for code quality

## Prerequisites

- Node.js v18 or higher
- npm or pnpm
- Supabase account (for database and authentication)
- Backend API running (see [backend README](../backend/README.md))

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Then edit `.env` and add your configuration:

```env
# Application
VITE_APP_NAME=AI Ideas Hub

# Supabase (get these from your Supabase dashboard)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Backend API
VITE_API_URL=http://localhost:3000

# Optional: Campaign settings
VITE_CAMPAIGN_END_DATE=2025-11-18
VITE_CAMPAIGN_GOAL=4000
```

## Environment Variables

All environment variables in Vite **MUST** be prefixed with `VITE_` to be accessible in your application code.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key (safe for client-side) | `eyJhbGc...` |
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_APP_NAME` | Application name | `AI Ideas Hub` |
| `VITE_APP_VERSION` | Application version | `1.0.0` |
| `VITE_API_VERSION` | API version | `v1` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics tracking | `false` |
| `VITE_DEBUG_MODE` | Show debug logs | `false` |
| `VITE_CAMPAIGN_END_DATE` | Campaign end date (YYYY-MM-DD) | `2025-11-18` |
| `VITE_CAMPAIGN_GOAL` | Target number of projects | `4000` |

### Getting Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** > **API**
4. Copy the **Project URL** → use for `VITE_SUPABASE_URL`
5. Copy the **anon/public key** → use for `VITE_SUPABASE_ANON_KEY`

**Important**: Never use the service role key in frontend code!

### Accessing Environment Variables in Code

```typescript
// Access environment variables with import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const apiUrl = import.meta.env.VITE_API_URL;

// TypeScript support - add types in vite-env.d.ts:
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_API_URL: string;
  // ... other env variables
}
```

## Development

Start the development server:
```bash
npm run dev
```

The application will start on `http://localhost:5173` (or the next available port).

### Development Tips

- Vite provides instant HMR - changes appear immediately
- TypeScript errors show in both IDE and browser console
- Environment variable changes require server restart

## Production Build

Build for production:
```bash
npm run build
```

Preview production build locally:
```bash
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment.

## Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   └── ui/         # shadcn/ui components
│   ├── lib/            # Utility functions
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── context/        # React Context providers
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main App component
│   └── main.tsx        # Application entry point
├── .env                # Environment variables (git-ignored)
├── .env.example        # Environment variables template
├── index.html          # HTML entry point
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

## Styling with Tailwind CSS

This project uses Tailwind CSS 4 with the new CSS-first configuration approach:

- Styles are configured in `@import "tailwindcss"` at the top of your CSS
- Use utility classes in JSX: `className="flex items-center gap-4"`
- Custom styles can be added in your CSS files
- shadcn/ui provides pre-built, customizable components

## UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) for UI components:

- Components are installed locally in `src/components/ui/`
- Fully customizable with Tailwind CSS
- Accessible by default (built on Radix UI)
- Add new components: `npx shadcn@latest add <component-name>`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/dashboard)
3. Add environment variables in Vercel project settings
4. Deploy!

### Netlify

1. Push your code to GitHub
2. Import project in [Netlify Dashboard](https://app.netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables in Netlify site settings
6. Deploy!

### Important Deployment Notes

- Set `NODE_ENV=production` in your deployment platform
- Add all `VITE_*` environment variables to your deployment configuration
- Update `VITE_API_URL` to point to your production backend
- Update backend `ALLOWED_ORIGINS` to include your deployed frontend URL

## Troubleshooting

### Environment Variables Not Working

- Ensure all variables are prefixed with `VITE_`
- Restart dev server after changing `.env` file
- Check for typos in variable names
- Verify `.env` file is in the frontend root directory

### Build Errors

- Run `npm run build` locally to catch errors before deployment
- Check TypeScript errors: variables must be properly typed
- Verify all imports are correct

### CORS Errors

- Ensure backend `ALLOWED_ORIGINS` includes your frontend URL
- Check that `VITE_API_URL` points to correct backend
- Verify backend is running and accessible

## Related Documentation

- [Main Project Documentation](../PLANNING.md)
- [Backend API Documentation](../backend/README.md)
- [Vite Documentation](https://vitejs.dev/)
- [React 19 Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Supabase Documentation](https://supabase.com/docs)

## Next Steps

- [ ] Implement authentication flow with Supabase Auth
- [ ] Create layout components (Header, Footer, Navigation)
- [ ] Build Ideas listing page with search and filters
- [ ] Implement Idea detail page
- [ ] Add Comments component with nested replies
- [ ] Create Project submission form
- [ ] Build user profile page
- [ ] Implement metrics dashboard
- [ ] Add campaign countdown timer
- [ ] Implement responsive design for mobile

## License

ISC
