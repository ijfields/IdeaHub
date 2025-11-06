/**
 * Admin Dashboard Page (Protected)
 *
 * Displays campaign metrics and analytics.
 * Shows progress toward 4,000 projects goal and other KPIs.
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-primary">Campaign Dashboard</h1>
            <Badge variant="secondary">Admin</Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Campaign Metrics</h1>
          <p className="text-muted-foreground">
            Track progress toward 4,000 projects goal (Campaign ends Nov 18, 2025)
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Projects Built</CardDescription>
              <CardTitle className="text-4xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Goal: 4,000</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Registrations</CardDescription>
              <CardTitle className="text-4xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Goal: 500+</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Comments</CardDescription>
              <CardTitle className="text-4xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Goal: 1,000+</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Engagement Rate</CardDescription>
              <CardTitle className="text-4xl">0%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Goal: 30%+</p>
            </CardContent>
          </Card>
        </div>

        {/* Tool Usage Card */}
        <Card>
          <CardHeader>
            <CardTitle>Tool Usage Breakdown</CardTitle>
            <CardDescription>
              Which AI tools are being used for projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No data yet</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
