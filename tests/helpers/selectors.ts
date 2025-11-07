/**
 * Test Selectors
 * 
 * Centralized selectors for E2E tests based on actual UI structure.
 * Update these if the UI changes.
 */

export const selectors = {
  // Navigation
  nav: {
    logo: 'a[href="/"]',
    homeLink: 'a[href="/"]:has-text("Home")',
    ideasLink: 'a[href="/ideas"]',
    loginLink: 'a[href="/login"]',
    signupLink: 'a[href="/signup"]',
    profileLink: 'a[href="/profile"]',
    dashboardLink: 'a[href="/dashboard"]',
    logoutButton: 'button:has-text("Log out")',
    userMenu: '[data-testid="user-menu"]',
    mobileMenu: 'button[aria-label*="menu" i]',
  },

  // Login Page
  login: {
    emailInput: '#email',
    passwordInput: '#password',
    rememberMeCheckbox: '#rememberMe',
    submitButton: 'button[type="submit"]:has-text("Sign In")',
    forgotPasswordLink: 'a[href="/forgot-password"]',
    signupLink: 'a[href="/signup"]',
    form: 'form',
    cardTitle: 'h2:has-text("Welcome Back")',
  },

  // Signup Page
  signup: {
    displayNameInput: '#displayName',
    emailInput: '#email',
    passwordInput: '#password',
    confirmPasswordInput: '#confirmPassword',
    acceptTermsCheckbox: '#acceptTerms',
    submitButton: 'button[type="submit"]:has-text("Create Account")',
    loginLink: 'a[href="/login"]',
    form: 'form',
    cardTitle: 'h2:has-text("Create an Account")',
  },

  // Home Page
  home: {
    heroTitle: 'h1:has-text("87 AI Project Ideas")',
    browseFreeIdeasButton: 'a[href="/ideas"]:has-text("Browse 5 Free Ideas")',
    signupButton: 'a[href="/signup"]:has-text("Get Full Access")',
    featuredIdeas: '[data-testid="featured-idea"]',
    campaignBanner: '[data-testid="campaign-banner"]',
    categoriesSection: '[data-testid="categories-section"]',
  },

  // Ideas List Page
  ideas: {
    searchInput: 'input[placeholder*="Search" i]',
    categoryFilter: '[data-testid="category-filter"]',
    difficultyFilter: '[data-testid="difficulty-filter"]',
    ideaCard: '[data-testid="idea-card"]',
    ideaTitle: '[data-testid="idea-title"]',
    viewDetailsButton: 'a:has-text("View Details")',
    pagination: '[data-testid="pagination"]',
  },

  // Idea Detail Page
  ideaDetail: {
    title: 'h1',
    description: '[data-testid="idea-description"]',
    difficultyBadge: '[data-testid="difficulty-badge"]',
    toolsList: '[data-testid="tools-list"]',
    viewCount: '[data-testid="view-count"]',
    commentCount: '[data-testid="comment-count"]',
    projectCount: '[data-testid="project-count"]',
    commentsSection: '[data-testid="comments-section"]',
    addCommentButton: 'button:has-text("Add Comment")',
    projectsSection: '[data-testid="projects-section"]',
    submitProjectButton: 'button:has-text("Submit Project")',
  },

  // Comments
  comments: {
    commentForm: '[data-testid="comment-form"]',
    commentTextarea: 'textarea[placeholder*="comment" i]',
    submitCommentButton: 'button[type="submit"]:has-text("Post")',
    commentList: '[data-testid="comment-list"]',
    commentItem: '[data-testid="comment-item"]',
    replyButton: 'button:has-text("Reply")',
    editButton: 'button:has-text("Edit")',
    deleteButton: 'button:has-text("Delete")',
  },

  // Project Submission
  projects: {
    submitForm: '[data-testid="project-submit-form"]',
    projectTitleInput: 'input[name="title"]',
    projectUrlInput: 'input[name="url"]',
    projectDescriptionTextarea: 'textarea[name="description"]',
    toolsUsedSelect: '[data-testid="tools-used-select"]',
    submitButton: 'button[type="submit"]:has-text("Submit Project")',
    projectList: '[data-testid="project-list"]',
    projectItem: '[data-testid="project-item"]',
  },

  // Profile Page
  profile: {
    displayName: '[data-testid="display-name"]',
    email: '[data-testid="email"]',
    bio: '[data-testid="bio"]',
    editButton: 'button:has-text("Edit Profile")',
    myProjectsSection: '[data-testid="my-projects"]',
    myCommentsSection: '[data-testid="my-comments"]',
  },

  // Dashboard Page
  dashboard: {
    metricsCards: '[data-testid="metric-card"]',
    projectsGoalProgress: '[data-testid="projects-goal-progress"]',
    toolUsageChart: '[data-testid="tool-usage-chart"]',
    engagementRate: '[data-testid="engagement-rate"]',
  },

  // Common UI Elements
  common: {
    loadingSpinner: '[data-testid="loading"]',
    errorMessage: '[data-testid="error"]',
    toast: '[data-testid="toast"]',
    toastSuccess: '[data-testid="toast-success"]',
    toastError: '[data-testid="toast-error"]',
    button: 'button',
    link: 'a',
    card: '[data-testid="card"]',
  },
};

/**
 * Helper function to get selector with text content
 */
export function getSelectorWithText(selector: string, text: string): string {
  return `${selector}:has-text("${text}")`;
}

/**
 * Helper function to get data-testid selector
 */
export function getTestId(id: string): string {
  return `[data-testid="${id}"]`;
}

