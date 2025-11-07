import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About', path: '/about' },
      { name: 'Contact', path: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
    ],
  };

  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur-sm transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Campaign Banner */}
        <div className="mb-8 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 dark:from-primary/20 dark:via-primary/10 dark:to-accent/20 p-4 text-center shadow-md border border-primary/20">
          <p className="text-sm font-medium text-foreground">
            Part of the{' '}
            <span className="font-bold text-primary-600 dark:text-primary-400">
              Anthropic Claude Code Campaign
            </span>{' '}
            - Ends November 18, 2025
          </p>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div 
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white font-bold text-lg shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                }}
              >
                AI
              </div>
              <span 
                className="font-bold text-lg"
                style={{
                  background: 'linear-gradient(to right, #2563eb, #60a5fa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                AI Ideas Hub
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Discover 87 curated AI project ideas designed for professionals curious about AI.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Campaign Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Campaign Goal</h3>
            <p className="text-sm text-muted-foreground">
              Join us in reaching{' '}
              <span className="font-bold text-primary-600 dark:text-primary-400">4,000 projects</span>{' '}
              built with AI by November 18, 2025.
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {currentYear} AI Ideas Hub. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Powered by Anthropic Claude
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
