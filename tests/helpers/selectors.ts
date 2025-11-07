/**
 * Reusable Selectors for E2E Tests
 *
 * Centralized selectors for common UI elements to maintain consistency
 * and make tests more maintainable. When UI changes, update selectors here.
 */

/**
 * Navigation and Header Selectors
 */
export const navigation = {
  header: 'header, [data-testid="header"]',
  logo: 'a[href="/"], [data-testid="logo"]',
  homeLink: 'a[href="/"], nav a:has-text("Home")',
  ideasLink: 'a[href="/ideas"], nav a:has-text("Ideas")',
  dashboardLink: 'a[href="/dashboard"], nav a:has-text("Dashboard")',
  profileLink: 'a[href="/profile"], nav a:has-text("Profile")',
  loginLink: 'a[href="/login"], button:has-text("Login"), a:has-text("Login")',
  signupLink: 'a[href="/signup"], button:has-text("Sign Up"), a:has-text("Sign Up")',
  logoutButton: 'button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")',
  userMenu: '[data-testid="user-menu"], [aria-label="User menu"]',
};

/**
 * Footer Selectors
 */
export const footer = {
  container: 'footer, [data-testid="footer"]',
  copyrightText: 'footer p, footer [data-testid="copyright"]',
  socialLinks: 'footer a[href*="twitter"], footer a[href*="github"]',
};

/**
 * Hero Section Selectors (Home Page)
 */
export const hero = {
  container: '[data-testid="hero"], .hero-section',
  title: 'h1',
  subtitle: 'h1 + p, [data-testid="hero-subtitle"]',
  ctaButton: 'button:has-text("Get Started"), a:has-text("Get Started")',
  signupPrompt: '[data-testid="signup-prompt"]',
};

/**
 * News Banner Selectors
 */
export const newsBanner = {
  container: '[data-testid="news-banner"], .news-banner',
  message: '[data-testid="news-banner"] p, .news-banner p',
  closeButton: '[data-testid="news-banner"] button, .news-banner button',
};

/**
 * Ideas List Selectors
 */
export const ideasList = {
  container: '[data-testid="ideas-list"], .ideas-list',
  ideaCard: '[data-testid="idea-card"], .idea-card',
  ideaTitle: '[data-testid="idea-title"], .idea-card h3, .idea-card h2',
  ideaDescription: '[data-testid="idea-description"], .idea-card p',
  ideaCategory: '[data-testid="idea-category"], .idea-card [data-category]',
  ideaDifficulty: '[data-testid="idea-difficulty"], .idea-card [data-difficulty]',
  ideaTags: '[data-testid="idea-tags"], .idea-card .tags',
  viewDetailsButton: 'button:has-text("View Details"), a:has-text("View Details")',
  freeTierBadge: '[data-testid="free-tier-badge"], .free-tier-badge',
  premiumBadge: '[data-testid="premium-badge"], .premium-badge',
};

/**
 * Search and Filter Selectors
 */
export const searchAndFilter = {
  searchInput: 'input[type="search"], input[placeholder*="Search"], [data-testid="search-input"]',
  searchButton: 'button[type="submit"]:has-text("Search")',
  categoryFilter: '[data-testid="category-filter"], select[name="category"]',
  difficultyFilter: '[data-testid="difficulty-filter"], select[name="difficulty"]',
  clearFiltersButton: 'button:has-text("Clear Filters"), button:has-text("Reset")',
  resultsCount: '[data-testid="results-count"]',
};

/**
 * Idea Detail Page Selectors
 */
export const ideaDetail = {
  container: '[data-testid="idea-detail"], .idea-detail',
  title: '[data-testid="idea-title"], .idea-detail h1',
  description: '[data-testid="idea-description"], .idea-detail .description',
  category: '[data-testid="idea-category"]',
  difficulty: '[data-testid="idea-difficulty"]',
  tools: '[data-testid="idea-tools"], .tools-list',
  tags: '[data-testid="idea-tags"], .tags-list',
  estimatedTime: '[data-testid="estimated-time"]',
  monetizationPotential: '[data-testid="monetization-potential"]',
  viewCount: '[data-testid="view-count"]',
  commentCount: '[data-testid="comment-count"]',
  projectCount: '[data-testid="project-count"]',
  loginPrompt: '[data-testid="login-prompt"], .login-prompt',
  signupCta: '[data-testid="signup-cta"]',
};

/**
 * Comments Section Selectors
 */
export const comments = {
  section: '[data-testid="comments-section"], .comments-section',
  commentsList: '[data-testid="comments-list"], .comments-list',
  comment: '[data-testid="comment"], .comment',
  commentAuthor: '[data-testid="comment-author"], .comment-author',
  commentContent: '[data-testid="comment-content"], .comment-content',
  commentTimestamp: '[data-testid="comment-timestamp"], .comment-timestamp',
  replyButton: 'button:has-text("Reply")',
  deleteButton: 'button:has-text("Delete")',
  editButton: 'button:has-text("Edit")',
  nestedComment: '[data-testid="nested-comment"], .nested-comment, .comment-reply',
  commentForm: '[data-testid="comment-form"], form.comment-form',
  commentTextarea: 'textarea[name="content"], textarea[placeholder*="comment"]',
  submitCommentButton: 'button[type="submit"]:has-text("Comment"), button:has-text("Post Comment")',
  cancelButton: 'button:has-text("Cancel")',
  loginToCommentMessage: '[data-testid="login-to-comment"], .login-required-message',
};

/**
 * Project Submission Selectors
 */
export const projectSubmission = {
  section: '[data-testid="projects-section"], .projects-section',
  projectsList: '[data-testid="projects-list"], .projects-list',
  project: '[data-testid="project"], .project',
  projectTitle: '[data-testid="project-title"], .project-title',
  projectUrl: '[data-testid="project-url"], .project-url',
  projectDescription: '[data-testid="project-description"], .project-description',
  projectTools: '[data-testid="project-tools"], .project-tools',
  submitButton: 'button:has-text("Submit Project"), button:has-text("Share Project")',
  projectForm: '[data-testid="project-form"], form.project-form',
  titleInput: 'input[name="title"]',
  urlInput: 'input[name="url"]',
  descriptionTextarea: 'textarea[name="description"]',
  toolsSelect: 'select[name="tools"], [data-testid="tools-select"]',
  submitFormButton: 'button[type="submit"]:has-text("Submit")',
  loginToSubmitMessage: '[data-testid="login-to-submit"], .login-required-message',
};

/**
 * Authentication Forms Selectors
 */
export const auth = {
  // Login Form
  loginForm: 'form[data-testid="login-form"], form:has(input[type="email"]):has(button:has-text("Login"))',
  loginEmailInput: 'input[type="email"]',
  loginPasswordInput: 'input[type="password"]',
  loginSubmitButton: 'button[type="submit"]:has-text("Login"), button[type="submit"]:has-text("Sign In")',
  loginError: '[data-testid="login-error"], .error-message, .alert-error',
  forgotPasswordLink: 'a:has-text("Forgot Password")',
  signupLinkFromLogin: 'a:has-text("Sign Up"), a:has-text("Create Account")',

  // Signup Form
  signupForm: 'form[data-testid="signup-form"], form:has(input[type="email"]):has(button:has-text("Sign Up"))',
  signupEmailInput: 'input[type="email"]',
  signupPasswordInput: 'input[type="password"]',
  signupDisplayNameInput: 'input[name="displayName"], input[placeholder*="name"]',
  signupSubmitButton: 'button[type="submit"]:has-text("Sign Up"), button[type="submit"]:has-text("Create Account")',
  signupError: '[data-testid="signup-error"], .error-message, .alert-error',
  loginLinkFromSignup: 'a:has-text("Login"), a:has-text("Sign In")',
  termsCheckbox: 'input[type="checkbox"][name="terms"]',
};

/**
 * Dashboard Selectors
 */
export const dashboard = {
  container: '[data-testid="dashboard"], .dashboard',
  welcomeMessage: '[data-testid="welcome-message"], h1, h2',
  statsCard: '[data-testid="stats-card"], .stats-card',
  metricsSection: '[data-testid="metrics-section"]',
  projectCounter: '[data-testid="project-counter"]',
  campaignProgress: '[data-testid="campaign-progress"]',
  registrationsCount: '[data-testid="registrations-count"]',
  commentsCount: '[data-testid="comments-count"]',
  toolBreakdown: '[data-testid="tool-breakdown"]',
};

/**
 * Profile Page Selectors
 */
export const profile = {
  container: '[data-testid="profile"], .profile',
  displayName: '[data-testid="display-name"]',
  email: '[data-testid="email"]',
  bio: '[data-testid="bio"]',
  editButton: 'button:has-text("Edit Profile")',
  saveButton: 'button:has-text("Save")',
  cancelButton: 'button:has-text("Cancel")',
  userComments: '[data-testid="user-comments"]',
  userProjects: '[data-testid="user-projects"]',
};

/**
 * Loading and Error States
 */
export const states = {
  loadingSpinner: '[data-testid="loading-spinner"], .loading, .spinner',
  errorMessage: '[data-testid="error-message"], .error-message, .alert-error',
  successMessage: '[data-testid="success-message"], .success-message, .alert-success',
  emptyState: '[data-testid="empty-state"], .empty-state',
  notFoundPage: '[data-testid="not-found"], .not-found',
};

/**
 * Modal/Dialog Selectors
 */
export const modal = {
  overlay: '[data-testid="modal-overlay"], .modal-overlay, [role="dialog"]',
  container: '[data-testid="modal"], .modal, [role="dialog"]',
  title: '[data-testid="modal-title"], .modal-title',
  content: '[data-testid="modal-content"], .modal-content',
  closeButton: '[data-testid="modal-close"], button[aria-label="Close"]',
  confirmButton: 'button:has-text("Confirm"), button:has-text("OK")',
  cancelButton: 'button:has-text("Cancel")',
};

/**
 * Pagination Selectors
 */
export const pagination = {
  container: '[data-testid="pagination"], .pagination',
  previousButton: 'button:has-text("Previous"), button[aria-label="Previous"]',
  nextButton: 'button:has-text("Next"), button[aria-label="Next"]',
  pageNumber: '[data-testid="page-number"], .page-number',
  currentPage: '[data-testid="current-page"], .current-page, [aria-current="page"]',
};

/**
 * BuyButton Special Case Selectors
 */
export const buyButton = {
  container: '[data-testid="buybutton-idea"]',
  guestView: '[data-testid="buybutton-guest-view"]',
  authenticatedView: '[data-testid="buybutton-authenticated-view"]',
  sneakPeek: '[data-testid="sneak-peek"]',
  fullGuide: '[data-testid="full-guide"]',
  unlockButton: 'button:has-text("Unlock Full Guide"), button:has-text("Sign Up to View")',
  problemStatement: '[data-testid="problem-statement"]',
  basicSolution: '[data-testid="basic-solution"]',
  implementationGuide: '[data-testid="implementation-guide"]',
  codeArchitecture: '[data-testid="code-architecture"]',
  monetizationStrategy: '[data-testid="monetization-strategy"]',
};
