/**
 * Idea Detail Page
 *
 * Displays full details for a specific AI project idea with:
 * - Breadcrumb navigation and page header
 * - Two-column layout (main content + sidebar)
 * - Comments section with nested replies
 * - Project showcase
 * - Access control for guest vs registered users
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  Eye,
  MessageSquare,
  FolderKanban,
  Share2,
  Clock,
  TrendingUp,
  ChevronRight,
  Lock,
  ExternalLink,
  Send,
  MoreVertical,
  Flag,
  Edit2,
  Trash2,
  Reply,
} from 'lucide-react';

import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { useIdea, incrementView } from '@/hooks/useIdeas';
import {
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from '@/hooks/useComments';
import {
  useProjects,
  useCreateProject,
  useDeleteProject,
} from '@/hooks/useProjects';
import { trackPageView } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import type { Comment, ProjectLink } from '@/types/database';

/**
 * Difficulty level color mapping
 */
const difficultyColors = {
  Beginner: 'bg-green-500',
  Intermediate: 'bg-yellow-500',
  Advanced: 'bg-red-500',
};

/**
 * Main Idea Detail Page Component
 */
export default function IdeaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Data fetching
  const { data: ideaResponse, isLoading: ideaLoading } = useIdea(id || '');
  const { data: commentsResponse, isLoading: commentsLoading } = useComments(id || '');
  const { data: projectsResponse, isLoading: projectsLoading } = useProjects(id || '');

  // Mutations
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();

  // Local state
  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    url: '',
    description: '',
    tools_used: [] as string[],
  });

  const idea = ideaResponse?.data;
  const comments = commentsResponse?.data || [];
  const projects = projectsResponse?.data || [];

  // Track page view on mount
  useEffect(() => {
    if (id) {
      trackPageView(`/ideas/${id}`, id).catch(console.error);
      incrementView(id).catch(console.error);
    }
  }, [id]);

  /**
   * Handle comment submission
   */
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to comment.',
        variant: 'destructive',
      });
      return;
    }

    if (!commentContent.trim()) {
      return;
    }

    try {
      await createCommentMutation.mutateAsync({
        ideaId: id!,
        content: commentContent,
      });

      setCommentContent('');
      toast({
        title: 'Comment posted',
        description: 'Your comment has been added.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post comment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Handle reply submission
   */
  const handleReplySubmit = async (parentId: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to reply.',
        variant: 'destructive',
      });
      return;
    }

    if (!replyContent.trim()) {
      return;
    }

    try {
      await createCommentMutation.mutateAsync({
        ideaId: id!,
        content: replyContent,
        parentCommentId: parentId,
      });

      setReplyTo(null);
      setReplyContent('');
      toast({
        title: 'Reply posted',
        description: 'Your reply has been added.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post reply. Please try again.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Handle comment update
   */
  const handleCommentUpdate = async (commentId: string) => {
    if (!editContent.trim()) {
      return;
    }

    try {
      await updateCommentMutation.mutateAsync({
        commentId,
        content: editContent,
        ideaId: id!,
      });

      setEditingComment(null);
      setEditContent('');
      toast({
        title: 'Comment updated',
        description: 'Your comment has been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update comment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Handle comment deletion
   */
  const handleCommentDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await deleteCommentMutation.mutateAsync({
        commentId,
        ideaId: id!,
      });

      toast({
        title: 'Comment deleted',
        description: 'Your comment has been deleted.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete comment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Handle project submission
   */
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to submit a project.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createProjectMutation.mutateAsync({
        ideaId: id!,
        data: projectForm,
      });

      setProjectFormOpen(false);
      setProjectForm({
        title: '',
        url: '',
        description: '',
        tools_used: [],
      });

      toast({
        title: 'Project submitted',
        description: 'Your project has been added to the showcase.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Handle share button click
   */
  const handleShare = async () => {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied',
        description: 'Idea link copied to clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Build nested comment structure
   */
  const buildCommentTree = (comments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const roots: Comment[] = [];

    // First pass: create map and initialize replies array
    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: build tree structure
    comments.forEach((comment) => {
      const node = commentMap.get(comment.id)!;
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  /**
   * Sort comments
   */
  const sortedComments = () => {
    const sorted = [...comments].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
    });

    return buildCommentTree(sorted);
  };

  /**
   * Render a single comment with nested replies
   */
  const renderComment = (comment: Comment, depth: number = 0) => {
    const isAuthor = user?.id === comment.user_id;
    const isEditing = editingComment === comment.id;
    const isReplying = replyTo === comment.id;

    return (
      <div
        key={comment.id}
        className={`${depth > 0 ? 'ml-8 mt-4 border-l-2 border-border pl-4' : 'mt-4'}`}
      >
        <div className="flex gap-3">
          {/* Avatar */}
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {comment.user?.display_name?.[0]?.toUpperCase() ||
                comment.user?.email?.[0]?.toUpperCase() ||
                'U'}
            </AvatarFallback>
          </Avatar>

          {/* Comment content */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {comment.user?.display_name || comment.user?.email || 'Anonymous'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
              {comment.updated_at !== comment.created_at && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
            </div>

            {/* Comment body */}
            {isEditing ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleCommentUpdate(comment.id)}
                    disabled={updateCommentMutation.isPending}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                {comment.content}
              </p>
            )}

            {/* Comment actions */}
            {!isEditing && (
              <div className="mt-2 flex items-center gap-3">
                {user && (
                  <button
                    onClick={() => {
                      setReplyTo(comment.id);
                      setReplyContent('');
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <Reply className="h-3 w-3" />
                    Reply
                  </button>
                )}

                {isAuthor && (
                  <>
                    <button
                      onClick={() => {
                        setEditingComment(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleCommentDelete(comment.id)}
                      className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </>
                )}

                {!isAuthor && user && (
                  <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <Flag className="h-3 w-3" />
                    Flag
                  </button>
                )}
              </div>
            )}

            {/* Reply form */}
            {isReplying && (
              <div className="mt-3 space-y-2">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleReplySubmit(comment.id)}
                    disabled={createCommentMutation.isPending}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyTo(null);
                      setReplyContent('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Nested replies */}
            {comment.replies && comment.replies.length > 0 && depth < 3 && (
              <div className="mt-2">
                {comment.replies.map((reply) => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (ideaLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </MainLayout>
    );
  }

  // Not found
  if (!idea) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Idea not found</h1>
          <p className="text-muted-foreground mb-6">
            The idea you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/ideas')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Ideas
          </Button>
        </div>
      </MainLayout>
    );
  }

  const isFreeTier = idea.free_tier;
  const canViewFullContent = user || isFreeTier;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/ideas" className="hover:text-foreground">
            Ideas
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/ideas?category=${idea.category}`} className="hover:text-foreground">
            {idea.category}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{idea.title}</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge variant="secondary">{idea.category}</Badge>
            <Badge className={difficultyColors[idea.difficulty]}>
              {idea.difficulty}
            </Badge>
            {!isFreeTier && !user && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Premium
              </Badge>
            )}
          </div>

          <h1 className="text-4xl font-bold mb-4">{idea.title}</h1>

          {/* Engagement Metrics */}
          <div className="flex items-center gap-6 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{idea.view_count} views</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>{idea.comment_count} comments</span>
            </div>
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              <span>{idea.project_count} projects</span>
            </div>
          </div>

          {/* Share Button */}
          <Button onClick={handleShare} variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Tools/Tech Tags */}
        <div className="mb-8">
          <h3 className="text-sm font-medium mb-2">Recommended Tools:</h3>
          <div className="flex flex-wrap gap-2">
            {idea.tools.map((tool) => (
              <Badge key={tool} variant="outline">
                {tool}
              </Badge>
            ))}
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Section */}
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{idea.description}</p>
              </CardContent>
            </Card>

            {/* Problem Statement */}
            <Card>
              <CardHeader>
                <CardTitle>The Problem</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {idea.description}
                </p>
              </CardContent>
            </Card>

            {/* Solution Overview */}
            <Card>
              <CardHeader>
                <CardTitle>The Solution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  This AI-powered solution leverages {idea.tools.join(', ')} to address the
                  core challenges and deliver a seamless user experience.
                </p>
              </CardContent>
            </Card>

            {/* Why It Matters */}
            <Card>
              <CardHeader>
                <CardTitle>Why It Matters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  This project is valuable because it demonstrates practical AI applications
                  in the {idea.category.toLowerCase()} space, making it accessible to
                  professionals looking to explore AI capabilities.
                </p>
              </CardContent>
            </Card>

            {/* Implementation Guide - Protected */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {!canViewFullContent && <Lock className="h-5 w-5" />}
                  Implementation Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                {canViewFullContent ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Step-by-Step Guide:</h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Set up your development environment with the recommended tools</li>
                        <li>Design the core architecture and data models</li>
                        <li>Implement the AI integration using {idea.tools[0]}</li>
                        <li>Build the user interface and experience</li>
                        <li>Test thoroughly and iterate based on feedback</li>
                        <li>Deploy and monitor your application</li>
                      </ol>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Tech Stack:</h4>
                      <div className="flex flex-wrap gap-2">
                        {idea.tools.map((tool) => (
                          <Badge key={tool} variant="secondary">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Estimated Build Time:</h4>
                      <p className="text-sm text-muted-foreground">
                        {idea.estimated_build_time || '2-4 weeks'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/95 z-10 flex items-center justify-center">
                      <div className="text-center p-6">
                        <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Sign up to see full implementation guide</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Get access to detailed step-by-step instructions, code examples, and more.
                        </p>
                        <Button onClick={() => navigate('/signup')}>
                          Sign Up Free
                        </Button>
                      </div>
                    </div>
                    <div className="blur-sm pointer-events-none opacity-50">
                      <p className="text-sm text-muted-foreground">
                        Step-by-step implementation guide with code examples and best practices...
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monetization Potential */}
            {idea.monetization_potential && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Monetization Potential
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {idea.monetization_potential}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    <span>Estimated Time</span>
                  </div>
                  <p className="font-medium">{idea.estimated_build_time || '2-4 weeks'}</p>
                </div>

                <Separator />

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Difficulty</div>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${difficultyColors[idea.difficulty]}`} />
                    <span className="font-medium">{idea.difficulty}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm text-muted-foreground mb-2">Recommended Tools</div>
                  <div className="flex flex-wrap gap-1">
                    {idea.tools.slice(0, 3).map((tool) => (
                      <Badge key={tool} variant="secondary" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                    {idea.tools.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{idea.tools.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <Button className="w-full" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                  Start Building
                </Button>
              </CardContent>
            </Card>

            {/* Project Showcase */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Community Projects</CardTitle>
                <CardDescription>
                  {projects.length} project{projects.length !== 1 ? 's' : ''} built
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {projectsLoading ? (
                  <>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </>
                ) : projects.length > 0 ? (
                  <>
                    {projects.slice(0, 5).map((project) => (
                      <div key={project.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                        <h4 className="font-medium text-sm mb-1">{project.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <span>by {project.user?.display_name || project.user?.email}</span>
                        </div>
                        {project.description && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          View Project
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))}

                    {user ? (
                      <Dialog open={projectFormOpen} onOpenChange={setProjectFormOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full" size="sm">
                            Submit Your Project
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <form onSubmit={handleProjectSubmit}>
                            <DialogHeader>
                              <DialogTitle>Submit Your Project</DialogTitle>
                              <DialogDescription>
                                Share your implementation with the community
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                              <div>
                                <Label htmlFor="title">Project Title</Label>
                                <Input
                                  id="title"
                                  value={projectForm.title}
                                  onChange={(e) =>
                                    setProjectForm({ ...projectForm, title: e.target.value })
                                  }
                                  placeholder="My Awesome AI Project"
                                  required
                                />
                              </div>

                              <div>
                                <Label htmlFor="url">Project URL</Label>
                                <Input
                                  id="url"
                                  type="url"
                                  value={projectForm.url}
                                  onChange={(e) =>
                                    setProjectForm({ ...projectForm, url: e.target.value })
                                  }
                                  placeholder="https://example.com"
                                  required
                                />
                              </div>

                              <div>
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                  id="description"
                                  value={projectForm.description}
                                  onChange={(e) =>
                                    setProjectForm({ ...projectForm, description: e.target.value })
                                  }
                                  placeholder="Brief description of your project..."
                                  rows={3}
                                />
                              </div>

                              <div>
                                <Label htmlFor="tools">Tools Used</Label>
                                <Input
                                  id="tools"
                                  value={projectForm.tools_used.join(', ')}
                                  onChange={(e) =>
                                    setProjectForm({
                                      ...projectForm,
                                      tools_used: e.target.value.split(',').map((t) => t.trim()),
                                    })
                                  }
                                  placeholder="Claude, Bolt, React (comma-separated)"
                                />
                              </div>
                            </div>

                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setProjectFormOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" disabled={createProjectMutation.isPending}>
                                {createProjectMutation.isPending ? 'Submitting...' : 'Submit Project'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        size="sm"
                        onClick={() => navigate('/signup')}
                      >
                        Sign in to Submit
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground mb-4">
                      No projects yet. Be the first!
                    </p>
                    {user ? (
                      <Dialog open={projectFormOpen} onOpenChange={setProjectFormOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">Submit Your Project</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <form onSubmit={handleProjectSubmit}>
                            <DialogHeader>
                              <DialogTitle>Submit Your Project</DialogTitle>
                              <DialogDescription>
                                Share your implementation with the community
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                              <div>
                                <Label htmlFor="title">Project Title</Label>
                                <Input
                                  id="title"
                                  value={projectForm.title}
                                  onChange={(e) =>
                                    setProjectForm({ ...projectForm, title: e.target.value })
                                  }
                                  placeholder="My Awesome AI Project"
                                  required
                                />
                              </div>

                              <div>
                                <Label htmlFor="url">Project URL</Label>
                                <Input
                                  id="url"
                                  type="url"
                                  value={projectForm.url}
                                  onChange={(e) =>
                                    setProjectForm({ ...projectForm, url: e.target.value })
                                  }
                                  placeholder="https://example.com"
                                  required
                                />
                              </div>

                              <div>
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                  id="description"
                                  value={projectForm.description}
                                  onChange={(e) =>
                                    setProjectForm({ ...projectForm, description: e.target.value })
                                  }
                                  placeholder="Brief description of your project..."
                                  rows={3}
                                />
                              </div>

                              <div>
                                <Label htmlFor="tools">Tools Used</Label>
                                <Input
                                  id="tools"
                                  value={projectForm.tools_used.join(', ')}
                                  onChange={(e) =>
                                    setProjectForm({
                                      ...projectForm,
                                      tools_used: e.target.value.split(',').map((t) => t.trim()),
                                    })
                                  }
                                  placeholder="Claude, Bolt, React (comma-separated)"
                                />
                              </div>
                            </div>

                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setProjectFormOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" disabled={createProjectMutation.isPending}>
                                {createProjectMutation.isPending ? 'Submitting...' : 'Submit Project'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button size="sm" onClick={() => navigate('/signup')}>
                        Sign Up to Submit
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comments Section - Full Width */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Community Discussion</CardTitle>
                <CardDescription>
                  {comments.length} comment{comments.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>

              {/* Sort Options */}
              <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as 'newest' | 'oldest')}>
                <TabsList>
                  <TabsTrigger value="newest">Newest</TabsTrigger>
                  <TabsTrigger value="oldest">Oldest</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {/* Comment Form */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <Textarea
                  placeholder="Share your thoughts, ask questions, or provide feedback..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="min-h-[100px] mb-2"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Markdown is supported
                  </p>
                  <Button type="submit" disabled={createCommentMutation.isPending}>
                    <Send className="h-4 w-4 mr-2" />
                    {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-6 border border-border rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Sign in to join the discussion
                </p>
                <Button onClick={() => navigate('/login')}>Sign In</Button>
              </div>
            )}

            {/* Comment Thread */}
            {commentsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-2">
                {sortedComments().map((comment) => renderComment(comment))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Be the first to comment!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
