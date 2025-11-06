# Layout Components

This directory contains the layout components for the AI Ideas Hub application.

## Components

### MainLayout
The main wrapper component that includes the Header and Footer. Use this to wrap all your page content.

**Props:**
- `children`: ReactNode - The page content to render
- `className`: string (optional) - Additional CSS classes for the main content area

**Usage:**
```tsx
import { MainLayout } from '@/components/layout';

export function MyPage() {
  return (
    <MainLayout>
      <h1>Page Title</h1>
      <p>Page content goes here</p>
    </MainLayout>
  );
}
```

### Header
Responsive navigation header with:
- Logo and brand name
- Navigation links (Home, Browse Ideas)
- Desktop search bar
- User authentication menu (login/signup or user dropdown)
- Mobile hamburger menu

**Features:**
- Sticky positioning at the top
- Responsive design with mobile menu
- User avatar dropdown when authenticated
- Collapsible search bar on mobile
- Dynamic navigation text based on auth state

**Note:** Currently uses a mock `useAuth` hook. Replace with your actual authentication context.

### Footer
Site-wide footer with:
- Company information
- Navigation links (About, Contact)
- Legal links (Privacy Policy, Terms)
- Campaign information banner
- Copyright notice

**Features:**
- Responsive multi-column layout
- Campaign messaging
- Branded visual identity
- Links to legal pages

## NewsBanner Component

Located in `/src/components/NewsBanner.tsx`, this is a dismissible banner for announcements.

**Props:**
- `id`: string (default: 'anthropic-campaign-2025') - Unique identifier for localStorage
- `title`: string - Banner title
- `message`: string - Banner message
- `link`: string (optional) - CTA button link
- `linkText`: string (optional) - CTA button text

**Features:**
- Dismissible with localStorage persistence
- Gradient background
- Responsive layout
- Optional call-to-action button

**Usage:**
```tsx
import { NewsBanner } from '@/components/NewsBanner';

// Default campaign banner
<NewsBanner />

// Custom banner
<NewsBanner
  id="custom-announcement"
  title="New Feature"
  message="Check out our latest updates!"
  link="/updates"
  linkText="Learn More"
/>
```

## Complete Page Example

```tsx
import { MainLayout } from '@/components/layout';
import { NewsBanner } from '@/components/NewsBanner';

export function HomePage() {
  return (
    <>
      {/* Banner at the very top */}
      <NewsBanner />

      {/* Page content wrapped in MainLayout */}
      <MainLayout>
        <div className="space-y-8">
          <section>
            <h1 className="text-4xl font-bold">Welcome to AI Ideas Hub</h1>
            <p className="text-lg text-muted-foreground">
              Discover 87 curated AI project ideas
            </p>
          </section>

          {/* Your page content */}
        </div>
      </MainLayout>
    </>
  );
}
```

## Authentication Integration

The Header component includes a mock `useAuth` hook that needs to be replaced with your actual authentication system.

**Steps to integrate:**

1. Create an authentication context:
```tsx
// src/contexts/AuthContext.tsx
import { createContext, useContext } from 'react';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

2. Update the Header component to import from your auth context instead of the mock.

3. Wrap your app with the AuthProvider in your main App.tsx or root component.

## Styling

All components use:
- **Tailwind CSS** for styling
- **shadcn/ui** components for UI elements
- **CSS variables** for theming (defined in your global CSS)
- **Responsive breakpoints**: mobile-first approach

## Dependencies

These components use the following shadcn/ui components:
- Button
- DropdownMenu
- Avatar
- Input
- Sheet (mobile menu)
- Separator
- Badge

Make sure all these are installed and configured in your project.

## Responsive Breakpoints

- **sm**: 640px - Small tablets
- **md**: 768px - Tablets (desktop nav shows)
- **lg**: 1024px - Desktop (search bar shows)
- **xl**: 1280px - Large desktop
- **2xl**: 1536px - Extra large desktop

## Accessibility

All components include:
- ARIA labels for icon buttons
- Semantic HTML
- Keyboard navigation support
- Screen reader friendly markup
- Focus states

## Future Enhancements

- [ ] Add search functionality with API integration
- [ ] Implement real-time notifications in header
- [ ] Add dark mode toggle
- [ ] Integrate admin badge in header for admin users
- [ ] Add breadcrumb navigation
- [ ] Mobile search improvements
