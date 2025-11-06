# IdeaHub Backend API

Backend API for AI Ideas Hub - A closed-beta MVP platform showcasing curated AI project ideas.

## Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Module System**: ES Modules

## Features

- RESTful API architecture
- JWT-based authentication with Supabase
- CORS enabled for cross-origin requests
- Security headers with Helmet
- Request logging with Morgan
- Environment-based configuration
- Comprehensive error handling
- Input validation ready (express-validator)

## Prerequisites

- Node.js v18 or higher
- npm or pnpm
- Supabase account (for database and authentication)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Then edit `.env` and add your Supabase credentials:
```env
PORT=3000
NODE_ENV=development

SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Development

Start the development server with hot reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the PORT specified in .env).

## Production

Start the production server:
```bash
npm start
```

## Available Scripts

- `npm run dev` - Start development server with nodemon (auto-restart on changes)
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

## API Endpoints

### Health Check
```
GET /health
```
Returns server health status, uptime, and environment information.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-06T12:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

### API Info
```
GET /api
```
Returns API information and available endpoints.

**Response:**
```json
{
  "message": "IdeaHub API",
  "version": "v1",
  "endpoints": {
    "health": "/health",
    "api": "/api"
  }
}
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── supabase.js  # Supabase client setup
│   ├── middleware/      # Custom middleware
│   │   └── auth.js      # Authentication middleware
│   ├── routes/          # API route handlers
│   │   └── index.js     # Main API routes
│   ├── utils/           # Utility functions
│   │   └── errors.js    # Error handling utilities
│   └── server.js        # Express app entry point
├── .env                 # Environment variables (git-ignored)
├── .env.example         # Environment variables template
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | No (default: 3000) |
| `NODE_ENV` | Environment mode | No (default: development) |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `API_VERSION` | API version | No (default: v1) |

## Authentication

The API uses Supabase Auth with JWT tokens. Two authentication middleware are available:

### Required Authentication
```javascript
import { authenticate } from './middleware/auth.js';

router.get('/protected', authenticate, handler);
```

### Optional Authentication
```javascript
import { optionalAuth } from './middleware/auth.js';

router.get('/public', optionalAuth, handler);
```

To authenticate requests, include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API includes custom error classes and utilities:

```javascript
import { badRequest, notFound, asyncHandler } from './utils/errors.js';

// Throw custom errors
throw badRequest('Invalid input');
throw notFound('Resource not found');

// Wrap async handlers
router.get('/data', asyncHandler(async (req, res) => {
  // Your async code here
}));
```

## Next Steps

- [ ] Implement Ideas CRUD endpoints
- [ ] Implement Comments endpoints
- [ ] Implement Project Links endpoints
- [ ] Implement User profile endpoints
- [ ] Implement Analytics/Metrics endpoints
- [ ] Add request validation
- [ ] Add rate limiting
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Add unit tests
- [ ] Add integration tests

## Related Documentation

- [Main Project Documentation](../PLANNING.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Documentation](https://expressjs.com/)

## License

ISC
