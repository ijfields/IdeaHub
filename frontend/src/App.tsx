import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
        {/* Header */}
        <header className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">IdeaHub</h1>
              <Badge variant="secondary">Beta</Badge>
            </div>
            <Button onClick={() => setDarkMode(!darkMode)} variant="outline" size="sm">
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-12">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">shadcn/ui Configuration Complete</h1>
            <p className="text-muted-foreground text-lg">
              Professional component library ready for IdeaHub development
            </p>
          </div>

          {/* Component Demo Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Button Card */}
            <Card>
              <CardHeader>
                <CardTitle>Button Component</CardTitle>
                <CardDescription>Multiple variants and sizes available</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">Default Button</Button>
                <Button variant="secondary" className="w-full">
                  Secondary
                </Button>
                <Button variant="outline" className="w-full">
                  Outline
                </Button>
                <Button variant="ghost" className="w-full">
                  Ghost
                </Button>
                <Button variant="destructive" className="w-full">
                  Destructive
                </Button>
              </CardContent>
            </Card>

            {/* Input Card */}
            <Card>
              <CardHeader>
                <CardTitle>Input Component</CardTitle>
                <CardDescription>Form controls with proper styling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="name@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Submit</Button>
              </CardFooter>
            </Card>

            {/* Badge Card */}
            <Card>
              <CardHeader>
                <CardTitle>Badge Component</CardTitle>
                <CardDescription>Tags and status indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>React</Badge>
                  <Badge>Vite</Badge>
                  <Badge>Tailwind</Badge>
                  <Badge>shadcn/ui</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Counter Demo */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Interactive Demo</CardTitle>
              <CardDescription>Counter with shadcn/ui Button component</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-6xl font-bold mb-6 text-primary">{count}</div>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setCount(count - 1)} variant="outline" size="lg">
                  Decrease
                </Button>
                <Button onClick={() => setCount(0)} variant="secondary" size="lg">
                  Reset
                </Button>
                <Button onClick={() => setCount(count + 1)} size="lg">
                  Increase
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status Section */}
          <div className="mt-12 p-6 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Configuration Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span className="text-sm">shadcn/ui dependencies installed</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span className="text-sm">Path aliases configured</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span className="text-sm">CSS variables added</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span className="text-sm">Components ready to use</span>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-12">
          <div className="max-w-7xl mx-auto px-4 py-8 text-center">
            <p className="text-muted-foreground">
              IdeaHub - Professional AI project ideas platform
            </p>
          </div>
        </footer>
      </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
