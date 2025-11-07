/**
 * Test Data Fixtures
 *
 * Centralized test data for consistent test scenarios.
 * Includes sample ideas, user credentials, comments, and projects.
 */

/**
 * Sample Test User Credentials
 */
export const testUsers = {
  default: {
    email: 'test-user@example.com',
    password: 'TestPassword123!',
    displayName: 'Test User',
  },
  john: {
    email: 'john.doe@example.com',
    password: 'JohnPassword123!',
    displayName: 'John Doe',
  },
  jane: {
    email: 'jane.smith@example.com',
    password: 'JanePassword123!',
    displayName: 'Jane Smith',
  },
};

/**
 * Free Tier Ideas (Accessible to Guests)
 * These should match the 5 ideas marked as free_tier in the database
 */
export const freeTierIdeas = [
  {
    title: 'Africana History Quiz & Trivia Platform',
    category: 'Education & Learning',
    difficulty: 'Beginner',
  },
  {
    title: 'Personal Finance Dashboard',
    category: 'Personal Productivity & Finance',
    difficulty: 'Intermediate',
  },
  {
    title: 'Habit Tracker with Analytics',
    category: 'Personal Productivity & Finance',
    difficulty: 'Beginner',
  },
  {
    title: 'Social Media Content Repurposer',
    category: 'Marketing & Content Creation',
    difficulty: 'Intermediate',
  },
  {
    title: 'Africana Community Event Planner',
    category: 'Community Building',
    difficulty: 'Intermediate',
  },
];

/**
 * BuyButton Special Idea
 */
export const buyButtonIdea = {
  title: 'BuyButton',
  category: 'B2B SaaS Tools',
  difficulty: 'Advanced',
  description: {
    guest: 'Simple overview visible to guests',
    authenticated: 'Full implementation guide visible to authenticated users',
  },
};

/**
 * Sample Premium Ideas (Require Authentication)
 */
export const premiumIdeas = [
  {
    title: 'AI-Powered Code Review Assistant',
    category: 'B2B SaaS Tools',
    difficulty: 'Advanced',
  },
  {
    title: 'Book Club Discussion Platform',
    category: 'Book Club & Reading',
    difficulty: 'Intermediate',
  },
  {
    title: 'Community Resource Library',
    category: 'Community Building',
    difficulty: 'Beginner',
  },
];

/**
 * Sample Comment Content
 */
export const sampleComments = {
  positive: [
    'This is a fantastic idea! I can see this being very useful.',
    'Great project! I built something similar using Claude and it worked well.',
    'Love the concept. The step-by-step guide is really helpful.',
    'I implemented this over the weekend and it was easier than I expected!',
  ],
  questions: [
    'Has anyone tried building this with Claude vs Bolt?',
    'What was your experience with the credit usage?',
    'How long did it take you to complete this project?',
    'Which tools did you find most helpful for this implementation?',
  ],
  feedback: [
    'I built this and here are my learnings...',
    'One suggestion: consider adding authentication earlier in the process.',
    'The monetization section could use more detail.',
    'I found the implementation guide very thorough, thanks!',
  ],
  tools: [
    'I used Claude for this and it took about 50 API calls.',
    'Built this with Bolt.new in under an hour!',
    'Lovable worked great for the frontend components.',
    'Used a combination of Claude for backend and Lovable for UI.',
  ],
};

/**
 * Sample Comment for Testing (with structure)
 */
export const testComment = {
  topLevel: {
    content: 'This is a top-level test comment.',
    author: 'Test User',
  },
  reply: {
    content: 'This is a reply to the test comment.',
    author: 'Another User',
  },
  nested: {
    content: 'This is a nested reply to the reply.',
    author: 'Third User',
  },
};

/**
 * Sample Project Submissions
 */
export const sampleProjects = {
  claude: {
    title: 'My Implementation using Claude',
    url: 'https://example.com/my-claude-project',
    description: 'Built this project using Claude Code. It took about 2 hours and 100 API calls.',
    tools: ['Claude', 'React', 'Node.js'],
  },
  bolt: {
    title: 'Quick Bolt.new Implementation',
    url: 'https://bolt.new/my-project',
    description: 'Created this in 45 minutes using Bolt. Super fast!',
    tools: ['Bolt', 'Vue', 'Express'],
  },
  lovable: {
    title: 'UI-First Approach with Lovable',
    url: 'https://lovable.dev/my-ui-project',
    description: 'Focused on the frontend first using Lovable, then added backend later.',
    tools: ['Lovable', 'React', 'Tailwind CSS'],
  },
  mixed: {
    title: 'Hybrid Approach: Multiple Tools',
    url: 'https://github.com/user/hybrid-project',
    description: 'Used Claude for backend, Lovable for UI, and deployed on Vercel.',
    tools: ['Claude', 'Lovable', 'Vercel', 'Supabase'],
  },
};

/**
 * Test Project for Form Validation
 */
export const testProject = {
  valid: {
    title: 'Test Project Implementation',
    url: 'https://test-project.example.com',
    description: 'This is a valid test project with all required fields filled.',
    tools: ['Claude', 'React'],
  },
  invalidUrl: {
    title: 'Invalid URL Project',
    url: 'not-a-valid-url',
    description: 'This project has an invalid URL.',
    tools: ['Claude'],
  },
  missingTitle: {
    title: '',
    url: 'https://example.com',
    description: 'This project is missing a title.',
    tools: ['Claude'],
  },
  missingUrl: {
    title: 'No URL Project',
    url: '',
    description: 'This project is missing a URL.',
    tools: ['Claude'],
  },
};

/**
 * Categories for Testing
 */
export const categories = [
  'B2B SaaS Tools',
  'Book Club & Reading',
  'Community & Cultural Groups',
  'Community Building',
  'Education & Learning',
  'Education & Teaching',
  'Games and Puzzles',
  'Health & Wellness',
  'Marketing & Content Creation',
  'Niche Community Tools',
  'Personal Productivity & Finance',
  'Projects in Development',
  'Think Tank & Research',
];

/**
 * Difficulty Levels
 */
export const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced'];

/**
 * AI Tools
 */
export const aiTools = ['Claude', 'Bolt', 'Lovable', 'Google Studio', 'Replit', 'GitHub Copilot'];

/**
 * Search Test Queries
 */
export const searchQueries = {
  valid: [
    'finance',
    'community',
    'AI',
    'dashboard',
    'quiz',
  ],
  noResults: [
    'xyzabc123notfound',
    'qwertyuiop',
  ],
  multipleResults: [
    'community', // Should match multiple ideas
    'beginner', // Should match multiple difficulty levels
  ],
};

/**
 * Error Messages
 */
export const errorMessages = {
  auth: {
    invalidCredentials: 'Invalid credentials',
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    weakPassword: 'Password must be at least 8 characters',
    emailInUse: 'Email already in use',
  },
  comments: {
    contentRequired: 'Comment content is required',
    loginRequired: 'You must be logged in to comment',
  },
  projects: {
    titleRequired: 'Project title is required',
    urlRequired: 'Project URL is required',
    invalidUrl: 'Please enter a valid URL',
    loginRequired: 'You must be logged in to submit a project',
  },
};

/**
 * Success Messages
 */
export const successMessages = {
  auth: {
    signupSuccess: 'Account created successfully',
    loginSuccess: 'Welcome back',
    logoutSuccess: 'Logged out successfully',
  },
  comments: {
    created: 'Comment posted successfully',
    updated: 'Comment updated successfully',
    deleted: 'Comment deleted successfully',
  },
  projects: {
    submitted: 'Project submitted successfully',
    updated: 'Project updated successfully',
  },
};

/**
 * API Endpoints for Testing
 */
export const apiEndpoints = {
  auth: {
    signup: '/api/auth/signup',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    profile: '/api/auth/profile',
  },
  ideas: {
    list: '/api/ideas',
    detail: (id: string) => `/api/ideas/${id}`,
    search: '/api/ideas/search',
  },
  comments: {
    list: (ideaId: string) => `/api/ideas/${ideaId}/comments`,
    create: (ideaId: string) => `/api/ideas/${ideaId}/comments`,
    update: (commentId: string) => `/api/comments/${commentId}`,
    delete: (commentId: string) => `/api/comments/${commentId}`,
  },
  projects: {
    list: (ideaId: string) => `/api/ideas/${ideaId}/projects`,
    create: (ideaId: string) => `/api/ideas/${ideaId}/projects`,
    update: (projectId: string) => `/api/projects/${projectId}`,
    delete: (projectId: string) => `/api/projects/${projectId}`,
  },
};

/**
 * Campaign Metrics for Testing
 */
export const campaignMetrics = {
  goal: 4000, // Project completions goal
  endDate: '2025-11-18', // Campaign end date
  kpis: {
    minRegistrations: 500,
    minComments: 1000,
    minEngagementRate: 0.30, // 30%
  },
};

/**
 * Wait Times for Testing (in milliseconds)
 */
export const waitTimes = {
  short: 500,
  medium: 1000,
  long: 2000,
  apiCall: 3000,
  pageLoad: 5000,
};

/**
 * URL Patterns for Testing
 */
export const urlPatterns = {
  home: '/',
  ideas: '/ideas',
  ideaDetail: /\/ideas\/[a-zA-Z0-9-]+/,
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  profile: '/profile',
  notFound: '/404',
};
