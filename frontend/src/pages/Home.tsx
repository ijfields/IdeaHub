/**
 * Home Page
 *
 * Landing page for AI Ideas Hub.
 * Comprehensive homepage showcasing 87 AI project ideas platform with campaign information,
 * featured ideas, categories, and call-to-actions.
 */

import { Link } from 'react-router-dom';
import {
  Sparkles,
  Lightbulb,
  Share2,
  ArrowRight,
  Briefcase,
  BookOpen,
  Users,
  GraduationCap,
  Gamepad2,
  Heart,
  Megaphone,
  Target,
  Calculator,
  FlaskConical,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  FolderKanban,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { NewsBanner } from '@/components/NewsBanner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Placeholder data for featured free ideas
const featuredIdeas = [
  {
    id: 1,
    title: 'Africana History Quiz & Trivia Platform',
    description:
      'Build an interactive quiz platform celebrating Africana history, culture, and achievements. Perfect for education and community engagement.',
    difficulty: 'Beginner',
    tools: ['Claude', 'Bolt'],
    category: 'Education & Learning',
  },
  {
    id: 2,
    title: 'Personal Finance Dashboard',
    description:
      'Create a comprehensive financial tracking dashboard to manage budgets, expenses, and savings goals with smart insights.',
    difficulty: 'Intermediate',
    tools: ['Claude', 'Lovable'],
    category: 'Personal Productivity & Finance',
  },
  {
    id: 3,
    title: 'Habit Tracker with Analytics',
    description:
      'Design a habit tracking app with analytics and visualizations to help users build and maintain positive habits.',
    difficulty: 'Beginner',
    tools: ['Claude', 'Bolt', 'Lovable'],
    category: 'Personal Productivity & Finance',
  },
  {
    id: 4,
    title: 'Social Media Content Repurposer',
    description:
      'Automate the process of repurposing long-form content into engaging social media posts across multiple platforms.',
    difficulty: 'Intermediate',
    tools: ['Claude', 'Google Studio'],
    category: 'Marketing & Content Creation',
  },
  {
    id: 5,
    title: 'Africana Community Event Planner',
    description:
      'Build a community event planning platform for coordinating and promoting cultural events, meetings, and gatherings.',
    difficulty: 'Intermediate',
    tools: ['Claude', 'Lovable'],
    category: 'Community & Cultural Groups',
  },
];

// Categories list
const categories = [
  { name: 'B2B SaaS Tools', icon: Briefcase, count: 3 },
  { name: 'Book Club & Reading', icon: BookOpen, count: 3 },
  { name: 'Community & Cultural Groups', icon: Users, count: 3 },
  { name: 'Community Building', icon: Target, count: 3 },
  { name: 'Education & Learning', icon: GraduationCap, count: 6 },
  { name: 'Education & Teaching', icon: BookOpen, count: 3 },
  { name: 'Games and Puzzles', icon: Gamepad2, count: 3 },
  { name: 'Health & Wellness', icon: Heart, count: 3 },
  { name: 'Marketing & Content Creation', icon: Megaphone, count: 6 },
  { name: 'Niche Community Tools', icon: Target, count: 3 },
  { name: 'Personal Productivity & Finance', icon: Calculator, count: 6 },
  { name: 'Projects in Development', icon: FolderKanban, count: 3 },
  { name: 'Think Tank & Research', icon: FlaskConical, count: 3 },
];

// Placeholder stats
const stats = [
  { label: 'Registered Users', value: '234', icon: Users },
  { label: 'Projects Submitted', value: '1,247', icon: FolderKanban },
  { label: 'Community Comments', value: '592', icon: MessageSquare },
  { label: 'Ideas Available', value: '87', icon: Lightbulb },
];

// Campaign progress (placeholder)
const projectsGoal = 4000;
const projectsCompleted = 1247;
const progressPercentage = (projectsCompleted / projectsGoal) * 100;

export default function Home() {
  return (
    <>
      <NewsBanner />
      <MainLayout>
        {/* Hero Section */}
        <div className="relative -mt-8 -mx-4 px-4 py-16 sm:py-24 overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)] -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)] -z-10" />

          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Hero Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <Sparkles className="h-16 w-16 text-primary relative" />
              </div>
            </div>

            {/* Hero Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                87 AI Project Ideas
                <br />
                <span className="text-primary">for Professionals</span>
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto">
                Hands-on AI projects you can build with Claude, Bolt, or Lovable — no extensive
                coding required
              </p>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link to="/ideas">
                  Browse 5 Free Ideas
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link to="/signup">Get Full Access (Sign Up)</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Campaign Banner Section */}
        <section className="my-16">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Campaign Header */}
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    <Badge variant="secondary" className="text-sm">
                      Limited Time Campaign
                    </Badge>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold">
                    Anthropic Claude Code Promotion
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Build AI projects with free credits • Campaign ends{' '}
                    <span className="font-semibold text-foreground">November 18, 2025</span>
                  </p>
                </div>

                {/* Progress Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Campaign Goal Progress</span>
                    <span className="text-muted-foreground">
                      {projectsCompleted.toLocaleString()} / {projectsGoal.toLocaleString()}{' '}
                      projects
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-6" />
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span>
                      <span className="font-semibold text-foreground">
                        {progressPercentage.toFixed(1)}%
                      </span>{' '}
                      complete • Help us reach 4,000 projects!
                    </span>
                  </div>
                </div>

                {/* Campaign CTA */}
                <div className="text-center pt-2">
                  <Button asChild size="lg" className="font-semibold">
                    <Link to="/signup">Join the Campaign</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Featured Ideas Section */}
        <section className="my-16">
          <div className="text-center space-y-4 mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold">Start with These 5 Free Ideas</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No signup required. Explore these featured projects to get started with AI development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredIdeas.map((idea) => (
              <Card
                key={idea.id}
                className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline">{idea.difficulty}</Badge>
                    <Lightbulb className="h-5 w-5 text-primary group-hover:animate-pulse" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {idea.title}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-3">
                    {idea.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {idea.tools.map((tool) => (
                        <Badge key={tool} variant="secondary" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                    <Button asChild variant="outline" className="w-full" size="sm">
                      <Link to={`/ideas/${idea.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button asChild size="lg" variant="default">
              <Link to="/signup">
                Sign Up for 82 More Ideas
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="my-16">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to start building with AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <Card className="h-full text-center p-6">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                      <div className="relative bg-primary/10 rounded-full p-4">
                        <Lightbulb className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Choose an Idea</h3>
                    <p className="text-muted-foreground">
                      Browse 87 curated projects across 13 categories
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <Card className="h-full text-center p-6">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                      <div className="relative bg-primary/10 rounded-full p-4">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Build with AI Tools</h3>
                    <p className="text-muted-foreground">
                      Use Claude, Bolt, or Lovable with free credits
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <Card className="h-full text-center p-6">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                      <div className="relative bg-primary/10 rounded-full p-4">
                        <Share2 className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    3
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Share Your Project</h3>
                    <p className="text-muted-foreground">Showcase what you built with the community</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Categories Overview Section */}
        <section className="my-16">
          <div className="text-center space-y-4 mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold">Explore 13 Categories</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find the perfect project for your interests and skill level
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={index}
                  to={`/ideas?category=${encodeURIComponent(category.name)}`}
                  className="group"
                >
                  <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 rounded-lg p-2 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {category.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{category.count} ideas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Stats Section */}
        <section className="my-16">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-8">
              <div className="text-center space-y-8">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-2">Join Our Growing Community</h2>
                  <p className="text-muted-foreground">
                    Builders learning AI through hands-on project experience
                  </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-center">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <div className="text-3xl sm:text-4xl font-bold text-primary">
                          {stat.value}
                        </div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Final CTA Section */}
        <section className="my-16">
          <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 via-accent/5 to-background">
            <CardContent className="p-12 text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-primary" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold">
                  Ready to Build Your First AI Project?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Create a free account to access all 87 ideas and start using your free Anthropic
                  Claude Code credits today
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button size="lg" asChild className="text-lg px-8">
                  <Link to="/signup">
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8">
                  <Link to="/ideas">Browse Free Ideas</Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground pt-4">
                No credit card required • Campaign ends November 18, 2025
              </p>
            </CardContent>
          </Card>
        </section>
      </MainLayout>
    </>
  );
}
