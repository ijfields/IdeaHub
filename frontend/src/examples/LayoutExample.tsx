import { MainLayout } from '@/components/layout';
import { NewsBanner } from '@/components/NewsBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Example showing how to use the layout components
 *
 * Usage:
 * 1. Wrap your page content with <MainLayout>
 * 2. Add <NewsBanner /> at the top of your app (before MainLayout or inside it)
 * 3. Header and Footer are automatically included by MainLayout
 */
export function LayoutExample() {
  return (
    <>
      {/* News Banner - Place at the very top */}
      <NewsBanner />

      {/* Main Layout wraps all page content */}
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Layout Components Example</h1>
            <p className="text-muted-foreground">
              This demonstrates the layout system for AI Ideas Hub
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary">Component</Badge>
                  Header
                </CardTitle>
                <CardDescription>
                  Responsive navigation with user menu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Features:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Sticky navigation bar</li>
                  <li>Desktop search bar</li>
                  <li>User avatar dropdown</li>
                  <li>Mobile hamburger menu</li>
                  <li>Login/Signup buttons</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary">Component</Badge>
                  Footer
                </CardTitle>
                <CardDescription>
                  Site-wide footer with links
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Features:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Company links</li>
                  <li>Legal links</li>
                  <li>Campaign information</li>
                  <li>Copyright notice</li>
                  <li>Responsive layout</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary">Component</Badge>
                  MainLayout
                </CardTitle>
                <CardDescription>
                  Wrapper component for all pages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Features:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Includes Header and Footer</li>
                  <li>Centered container</li>
                  <li>Consistent spacing</li>
                  <li>Flexible main content area</li>
                  <li>Min-height layout</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary">Component</Badge>
                  NewsBanner
                </CardTitle>
                <CardDescription>
                  Dismissible campaign announcement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Features:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Dismissible with X button</li>
                  <li>Remembers dismissal state</li>
                  <li>Gradient background</li>
                  <li>Call-to-action button</li>
                  <li>Responsive design</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Code Example</CardTitle>
              <CardDescription>How to use these components in your pages</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                <code>{`import { MainLayout } from '@/components/layout';
import { NewsBanner } from '@/components/NewsBanner';

export function MyPage() {
  return (
    <>
      <NewsBanner />
      <MainLayout>
        <h1>My Page Content</h1>
        <p>This is where your page content goes.</p>
      </MainLayout>
    </>
  );
}`}</code>
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>Integrate with authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>To enable full functionality:</p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>
                  Create an authentication context provider (e.g., AuthContext) with Supabase Auth
                </li>
                <li>
                  Replace the mock <code className="bg-muted px-1 py-0.5 rounded">useAuth</code> hook in Header.tsx with your actual auth context
                </li>
                <li>
                  Update navigation links based on authentication state and user tier
                </li>
                <li>
                  Add route protection for authenticated-only pages
                </li>
                <li>
                  Implement search functionality in the Header component
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </>
  );
}
