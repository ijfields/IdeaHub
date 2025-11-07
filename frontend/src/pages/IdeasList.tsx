/**
 * Ideas List Page
 *
 * Displays the list of AI project ideas with filtering and search.
 * Shows 5 free ideas for guests, all 87 ideas for registered users.
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  X,
  Lock,
  Eye,
  MessageCircle,
  FolderGit2,
  ChevronLeft,
  ChevronRight,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { NewsBanner } from '@/components/NewsBanner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useIdeas } from '@/hooks/useIdeas';
import type { Idea, IdeaFilters } from '@/lib/api-client';

// Categories list
const CATEGORIES = [
  'B2B SaaS Tools',
  'Book Club & Reading',
  'Community & Cultural Groups',
  'Community Building',
  'Education & Learning',
  'Education & Teaching',
  'Games and Puzzles',
  'Health & Wellness',
  'Marketing & Content Creation',
  'Niche Community Tools',
  'Personal Productivity & Finance',
  'Projects in Development',
  'Think Tank & Research',
];

// Tools list
const TOOLS = ['Claude', 'Bolt', 'Lovable', 'Google AI Studio'];

// Difficulty levels
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

// Build time options
const BUILD_TIMES = [
  { value: 'less-than-1-week', label: '< 1 week' },
  { value: '1-2-weeks', label: '1-2 weeks' },
  { value: '2-4-weeks', label: '2-4 weeks' },
  { value: '1-plus-months', label: '1+ months' },
];

// Sort options
const SORT_OPTIONS = [
  { value: 'popular', label: 'Popular' },
  { value: 'recent', label: 'Recent' },
  { value: 'most-projects', label: 'Most Projects' },
  { value: 'difficulty', label: 'Difficulty' },
];

const IDEAS_PER_PAGE = 12;

export default function IdeasList() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedBuildTime, setSelectedBuildTime] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build API filters
  const apiFilters: IdeaFilters = useMemo(() => {
    const filters: IdeaFilters = {
      page: currentPage,
      limit: IDEAS_PER_PAGE,
      search: debouncedSearch || undefined,
    };

    if (!isAuthenticated) {
      filters.free_tier = true;
    }

    if (selectedCategories.length > 0) {
      filters.category = selectedCategories[0]; // API might support single category
    }

    if (selectedDifficulties.length > 0) {
      filters.difficulty = selectedDifficulties[0]; // API might support single difficulty
    }

    if (selectedTools.length > 0) {
      filters.tools = selectedTools;
    }

    return filters;
  }, [
    currentPage,
    debouncedSearch,
    selectedCategories,
    selectedDifficulties,
    selectedTools,
    isAuthenticated,
  ]);

  // Fetch ideas - disabled if QueryClient might not be ready
  const { data, isLoading, error } = useIdeas(apiFilters, {
    retry: 0, // Disable retries to prevent cascading errors
    retryDelay: 0,
    enabled: true,
  });
  const ideas = data?.data || [];

  // Client-side filtering and sorting
  const filteredAndSortedIdeas = useMemo(() => {
    let result = [...ideas];

    // Filter by categories (client-side for multi-select)
    if (selectedCategories.length > 0) {
      result = result.filter((idea) =>
        selectedCategories.includes(idea.category)
      );
    }

    // Filter by difficulties (client-side for multi-select)
    if (selectedDifficulties.length > 0) {
      result = result.filter((idea) =>
        selectedDifficulties.includes(idea.difficulty)
      );
    }

    // Filter by build time (client-side)
    if (selectedBuildTime && selectedBuildTime !== 'all') {
      result = result.filter((idea) => {
        const buildTime = idea.estimated_build_time?.toLowerCase() || '';
        switch (selectedBuildTime) {
          case 'less-than-1-week':
            return buildTime.includes('day') || buildTime.includes('week') && !buildTime.includes('2');
          case '1-2-weeks':
            return buildTime.includes('1-2 week') || buildTime.includes('2 week');
          case '2-4-weeks':
            return buildTime.includes('2-4 week') || buildTime.includes('3 week') || buildTime.includes('4 week');
          case '1-plus-months':
            return buildTime.includes('month');
          default:
            return true;
        }
      });
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.view_count - a.view_count);
        break;
      case 'recent':
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'most-projects':
        result.sort((a, b) => b.project_count - a.project_count);
        break;
      case 'difficulty':
        const difficultyOrder = { Beginner: 1, Intermediate: 2, Advanced: 3 };
        result.sort(
          (a, b) =>
            difficultyOrder[a.difficulty as keyof typeof difficultyOrder] -
            difficultyOrder[b.difficulty as keyof typeof difficultyOrder]
        );
        break;
    }

    return result;
  }, [ideas, selectedCategories, selectedDifficulties, selectedBuildTime, sortBy]);

  // Pagination calculations
  const totalIdeas = filteredAndSortedIdeas.length;
  const totalPages = Math.ceil(totalIdeas / IDEAS_PER_PAGE);
  const startIndex = (currentPage - 1) * IDEAS_PER_PAGE;
  const endIndex = startIndex + IDEAS_PER_PAGE;
  const paginatedIdeas = filteredAndSortedIdeas.slice(startIndex, endIndex);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedDifficulties([]);
    setSelectedTools([]);
    setSelectedBuildTime('all');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategories.length > 0 ||
    selectedDifficulties.length > 0 ||
    selectedTools.length > 0 ||
    (selectedBuildTime && selectedBuildTime !== 'all');

  // Toggle filter selection
  const toggleFilter = (
    value: string,
    selectedArray: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setCurrentPage(1);
    if (selectedArray.includes(value)) {
      setSelected(selectedArray.filter((item) => item !== value));
    } else {
      setSelected([...selectedArray, value]);
    }
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'Advanced':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return '';
    }
  };

  // Filter sidebar component
  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Category</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {CATEGORIES.map((category) => {
            const count = ideas.filter((idea) => idea.category === category).length;
            return (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() =>
                    toggleFilter(category, selectedCategories, setSelectedCategories)
                  }
                />
                <Label
                  htmlFor={`category-${category}`}
                  className="text-sm cursor-pointer flex-1 flex items-center justify-between"
                >
                  <span className="text-xs">{category}</span>
                  <span className="text-xs text-muted-foreground">({count})</span>
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Difficulty Filter */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Difficulty</h3>
        <div className="space-y-2">
          {DIFFICULTIES.map((difficulty) => (
            <div key={difficulty} className="flex items-center space-x-2">
              <Checkbox
                id={`difficulty-${difficulty}`}
                checked={selectedDifficulties.includes(difficulty)}
                onCheckedChange={() =>
                  toggleFilter(difficulty, selectedDifficulties, setSelectedDifficulties)
                }
              />
              <Label
                htmlFor={`difficulty-${difficulty}`}
                className="text-sm cursor-pointer"
              >
                {difficulty}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Tools Filter */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Tools</h3>
        <div className="space-y-2">
          {TOOLS.map((tool) => (
            <div key={tool} className="flex items-center space-x-2">
              <Checkbox
                id={`tool-${tool}`}
                checked={selectedTools.includes(tool)}
                onCheckedChange={() =>
                  toggleFilter(tool, selectedTools, setSelectedTools)
                }
              />
              <Label htmlFor={`tool-${tool}`} className="text-sm cursor-pointer">
                {tool}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Build Time Filter */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Build Time</h3>
        <Select value={selectedBuildTime} onValueChange={setSelectedBuildTime}>
          <SelectTrigger>
            <SelectValue placeholder="Any build time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any build time</SelectItem>
            {BUILD_TIMES.map((time) => (
              <SelectItem key={time.value} value={time.value}>
                {time.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <>
          <Separator />
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="w-full"
          >
            Clear All Filters
          </Button>
        </>
      )}
    </div>
  );

  return (
    <MainLayout>
      <NewsBanner />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">AI Project Ideas</h1>
          <p className="text-lg text-muted-foreground">
            {isAuthenticated
              ? '87 Ideas Available - Discover the perfect project for your skills'
              : '5 Free Ideas - Sign up to unlock all 87 ideas'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search ideas by title, description, or tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FilterSidebar />
              </CardContent>
            </Card>
          </aside>

          {/* Ideas Grid */}
          <div className="lg:col-span-3 space-y-6">
            {/* Mobile Filter Button & Sort */}
            <div className="flex items-center justify-between gap-4">
              {/* Mobile Filter Button */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-2">
                        {[
                          selectedCategories.length,
                          selectedDifficulties.length,
                          selectedTools.length,
                          selectedBuildTime && selectedBuildTime !== 'all' ? 1 : 0,
                        ].reduce((a, b) => a + b, 0)}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Filter ideas by category, difficulty, tools, and build time
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 flex-1 lg:flex-initial">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  Sort by:
                </span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Guest Banner */}
            {!isAuthenticated && ideas.length > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Lock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        Sign up to see all 87 ideas
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Get full access to our curated collection of AI project ideas.
                        Join now with free Anthropic Claude Code credits!
                      </p>
                      <Button asChild>
                        <Link to="/signup">Sign Up Free</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ideas Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <div className="space-y-4 text-center">
                    <p className="text-destructive font-medium">
                      Error loading ideas
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {error instanceof Error
                        ? error.message
                        : 'Unable to fetch ideas. Please check your connection and try again.'}
                    </p>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                    >
                      Reload Page
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : paginatedIdeas.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-muted-foreground text-lg mb-2">
                    No ideas found.
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Try adjusting your filters or search query.
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearAllFilters}>
                      Clear All Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedIdeas.map((idea) => {
                  const isLocked = !isAuthenticated && !idea.free_tier;

                  return (
                    <Card
                      key={idea.id}
                      className={`relative card-hover group ${
                        isLocked ? 'opacity-75' : ''
                      }`}
                    >
                      {isLocked && (
                        <div className="absolute top-4 right-4 z-10">
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <Badge variant="outline" className="text-xs">
                            {idea.category}
                          </Badge>
                          <Badge className={getDifficultyColor(idea.difficulty)}>
                            {idea.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors">
                          {idea.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {idea.description}
                        </CardDescription>

                        {/* Tools Tags */}
                        {idea.tools && idea.tools.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {idea.tools.slice(0, 3).map((tool) => (
                              <Badge
                                key={tool}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tool}
                              </Badge>
                            ))}
                            {idea.tools.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{idea.tools.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Engagement Metrics */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{idea.view_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{idea.comment_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FolderGit2 className="h-3 w-3" />
                            <span>{idea.project_count}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {isLocked ? (
                          <Button 
                            className="w-full shadow-md hover:shadow-lg transition-all duration-300" 
                            disabled={true}
                          >
                            Sign Up to View
                          </Button>
                        ) : (
                          <Button 
                            asChild
                            variant="ghost"
                            className="w-full shadow-md hover:shadow-lg transition-all duration-300 text-white border-none"
                          >
                            <Link 
                              to={`/ideas/${idea.id}`} 
                              className="text-white rounded-md btn-gradient-link"
                            >
                              View Details
                            </Link>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, totalIdeas)} of{' '}
                  {totalIdeas} ideas
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
