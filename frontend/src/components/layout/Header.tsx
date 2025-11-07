import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, User, LogOut, Settings, LayoutDashboard, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Search query:', searchQuery);
  };

  const navigationLinks = [
    { name: 'Home', path: '/' },
    { name: isAuthenticated ? 'Browse Ideas' : '5 Free Ideas', path: '/ideas' },
  ];

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2 group">
            <div 
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              }}
            >
              AI
            </div>
            <span 
              className="hidden font-bold text-xl sm:inline-block"
              style={{
                background: 'linear-gradient(to right, #2563eb, #60a5fa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              AI Ideas Hub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="transition-all duration-300 hover:text-primary-600 text-foreground/80 hover:scale-105"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4"
            />
          </form>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="transition-all duration-200"
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-5 w-5 transition-transform hover:rotate-90" />
            ) : (
              <Moon className="h-5 w-5 transition-transform hover:-rotate-12" />
            )}
          </Button>

          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Authentication Actions */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} alt={user?.displayName || 'User'} />
                    <AvatarFallback>
                      {user?.displayName ? getUserInitials(user.displayName) : <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>My Projects</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="flex items-center text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-2">
                  {navigationLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="flex items-center py-2 px-3 rounded-md hover:bg-accent transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>

                {/* Mobile Auth Actions */}
                {!isAuthenticated && (
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                    <Button asChild className="w-full">
                      <Link to="/signup">Sign up</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/login">Log in</Link>
                    </Button>
                  </div>
                )}

                {/* Mobile User Menu */}
                {isAuthenticated && (
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.avatar} alt={user?.displayName || 'User'} />
                        <AvatarFallback>
                          {user?.displayName ? getUserInitials(user.displayName) : <User className="h-5 w-5" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user?.displayName || 'User'}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                    </div>
                    <Link to="/profile" className="flex items-center py-2 px-3 rounded-md hover:bg-accent">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <Link to="/dashboard" className="flex items-center py-2 px-3 rounded-md hover:bg-accent">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      My Projects
                    </Link>
                    <Link to="/settings" className="flex items-center py-2 px-3 rounded-md hover:bg-accent">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={logout}
                      className="justify-start text-destructive hover:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Search Bar (Collapsible) */}
      {isSearchOpen && (
        <div className="lg:hidden border-t px-4 py-3">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 w-full"
              autoFocus
            />
          </form>
        </div>
      )}
    </header>
  );
}
