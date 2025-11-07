import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NewsBannerProps {
  id?: string;
  title?: string;
  message?: string;
  link?: string;
  linkText?: string;
}

export function NewsBanner({
  id = 'anthropic-campaign-2025',
  title = 'Limited Time Campaign',
  message = 'Build AI projects with free Anthropic Claude Code credits! Campaign ends November 18, 2025.',
  link = '/ideas',
  linkText = 'Explore Ideas',
}: NewsBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const storageKey = `news-banner-dismissed-${id}`;

  useEffect(() => {
    // Check if banner has been dismissed
    const isDismissed = localStorage.getItem(storageKey);
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(storageKey, 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative w-full bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Sparkles className="h-5 w-5 flex-shrink-0 animate-pulse" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-semibold text-sm sm:text-base">{title}:</span>
              <span className="text-sm sm:text-base">{message}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {link && linkText && (
              <Button
                variant="secondary"
                size="sm"
                asChild
                className="hidden sm:inline-flex bg-white text-primary-600 hover:bg-white/90"
              >
                <a href={link}>{linkText}</a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8 text-white hover:bg-white/20 flex-shrink-0"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Mobile CTA Button */}
        {link && linkText && (
          <div className="mt-2 sm:hidden">
            <Button
              variant="secondary"
              size="sm"
              asChild
              className="w-full bg-white text-primary-600 hover:bg-white/90"
            >
              <a href={link}>{linkText}</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
