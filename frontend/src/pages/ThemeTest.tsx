import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Sparkles, Zap, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ThemeTest() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl sm:text-6xl font-bold">
              Theme Test Page
              <br />
              <span 
                className="inline-block"
                style={{
                  background: 'linear-gradient(to right, #2563eb, #60a5fa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Professional Blue Theme
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Testing gradients, buttons, cards, and all theme elements
            </p>

            {/* Gradient Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                size="lg" 
                asChild 
                variant="ghost"
                className="text-lg px-8 shadow-lg hover:shadow-xl transition-all duration-300 group border-none"
              >
                <Link 
                  to="/" 
                  className="flex items-center text-white rounded-md btn-gradient-link"
                >
                  Primary Gradient Button
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 border-2 hover:border-primary hover:text-primary transition-all duration-300">
                <Link to="/">Outline Button</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Card Examples</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <Card className="card-hover">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold text-lg shadow-md"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      }}
                    >
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <CardTitle>Gradient Icon</CardTitle>
                  </div>
                  <CardDescription>
                    This card has a gradient icon and hover effects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    asChild 
                    variant="ghost"
                    className="w-full btn-gradient-link"
                  >
                    <Link to="/" className="text-white">
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Card 2 */}
              <Card className="card-hover">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold text-lg shadow-md"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      }}
                    >
                      <Zap className="h-5 w-5" />
                    </div>
                    <CardTitle>Hover Effects</CardTitle>
                  </div>
                  <CardDescription>
                    Cards lift up on hover with smooth transitions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    asChild 
                    variant="ghost"
                    className="w-full btn-gradient-link"
                  >
                    <Link to="/" className="text-white">
                      Explore
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Card 3 */}
              <Card className="card-hover">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold text-lg shadow-md"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      }}
                    >
                      <Target className="h-5 w-5" />
                    </div>
                    <CardTitle>Professional Design</CardTitle>
                  </div>
                  <CardDescription>
                    Clean, modern UI with professional color palette
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    asChild 
                    variant="ghost"
                    className="w-full btn-gradient-link"
                  >
                    <Link to="/" className="text-white">
                      Get Started
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Gradient Text Examples */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold">Gradient Text Examples</h2>
            <div className="space-y-4">
              <p className="text-2xl">
                Regular text with{' '}
                <span 
                  className="font-bold"
                  style={{
                    background: 'linear-gradient(to right, #2563eb, #60a5fa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  gradient text
                </span>
              </p>
              <p className="text-xl text-muted-foreground">
                All gradients use the professional blue palette (#2563eb to #60a5fa)
              </p>
            </div>
          </div>
        </section>

        {/* Button Variants */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Button Variants</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                asChild 
                variant="ghost"
                className="btn-gradient-link"
              >
                <Link to="/" className="text-white">Gradient Button</Link>
              </Button>
              <Button variant="default">Default Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive Button</Button>
            </div>
          </div>
        </section>

        {/* Back to Home */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Button 
              asChild 
              size="lg"
              variant="ghost"
              className="btn-gradient-link"
            >
              <Link to="/" className="text-white">
                Back to Home
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

