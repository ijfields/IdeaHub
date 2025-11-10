/**
 * Profile Page Component
 *
 * User profile page with view and edit modes.
 * Features:
 * - Display user avatar, name, email, bio, join date
 * - Show user statistics (projects submitted, comments made)
 * - Edit mode for display name and bio
 * - Loading skeleton while fetching data
 * - Error handling with toast notifications
 * - Protected route (requires authentication)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatDistanceToNow } from 'date-fns';
import { User as UserIcon, Mail, Calendar, Edit2, Save, X, Loader2 } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useIdeas } from '@/hooks/useIdeas';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

/**
 * Profile edit form validation schema
 */
const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters')
    .regex(
      /^[a-zA-Z0-9 _-]+$/,
      'Display name can only contain letters, numbers, spaces, hyphens, and underscores'
    ),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

/**
 * User statistics interface
 */
interface UserStats {
  projectsCount: number;
  commentsCount: number;
}

/**
 * Profile Page Component
 */
export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>({
    projectsCount: 0,
    commentsCount: 0,
  });

  // Fetch total ideas count for authenticated users
  const { data: ideasData } = useIdeas({ limit: 1 }, { retry: false });
  const allIdeasCount = ideasData?.pagination?.total || 87; // Fallback to 87 if not available

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  /**
   * Redirect to login if not authenticated
   */
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  /**
   * Load user profile data and stats
   */
  useEffect(() => {
    if (user) {
      // Reset form with current profile data (use profile if available, otherwise user email)
      reset({
        displayName: profile?.display_name || user.email || '',
        bio: profile?.bio || '',
      });

      // Fetch user statistics if we have a user
      if (user.id) {
        fetchUserStats();
      }
    }
  }, [profile, user, reset]);

  /**
   * Fetch user statistics (projects and comments count)
   */
  const fetchUserStats = async () => {
    if (!user) return;

    try {
      setIsLoadingStats(true);

      // Fetch projects count
      const { count: projectsCount, error: projectsError } = await supabase
        .from('project_links')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (projectsError) throw projectsError;

      // Fetch comments count
      const { count: commentsCount, error: commentsError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (commentsError) throw commentsError;

      setUserStats({
        projectsCount: projectsCount || 0,
        commentsCount: commentsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  /**
   * Handle profile update
   */
  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;

    console.log('🔵 PROFILE: Starting profile update...');
    console.log('🔵 PROFILE: Data to update:', { displayName: data.displayName, bio: data.bio });

    try {
      console.log('🔵 PROFILE: Calling supabase.from("users").update()...');
      
      const { error, data: updateData } = await supabase
        .from('users')
        .update({
          display_name: data.displayName,
          bio: data.bio || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select();

      if (error) {
        console.error('🔴 PROFILE: Update error:', error);
        throw error;
      }

      console.log('🟢 PROFILE: Update successful, refreshing profile...');

      // Refresh profile data (with timeout protection)
      try {
        await Promise.race([
          refreshProfile(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile refresh timeout')), 5000)
          )
        ]);
        console.log('🟢 PROFILE: Profile refreshed successfully');
      } catch (refreshError) {
        console.warn('🔴 PROFILE: Profile refresh failed or timed out:', refreshError);
        // Continue anyway - the update was successful
      }

      // Show success toast
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });

      // Exit edit mode
      setIsEditing(false);
      console.log('🟢 PROFILE: Update complete');
    } catch (error: any) {
      console.error('🔴 PROFILE: Update failed:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Handle cancel edit
   */
  const handleCancelEdit = () => {
    reset({
      displayName: profile?.display_name || '',
      bio: profile?.bio || '',
    });
    setIsEditing(false);
  };

  /**
   * Get user initials for avatar
   * Returns 2 characters when possible (first + last initial)
   * Falls back to first 2 characters of name/email if only one word
   */
  const getUserInitials = () => {
    const name = profile?.display_name || user?.email || 'U';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    
    if (parts.length >= 2) {
      // First and last name - use first letter of each
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
    } else if (parts.length === 1 && parts[0].length >= 2) {
      // Single word with 2+ characters - use first 2 letters
      return parts[0].substring(0, 2).toUpperCase();
    } else {
      // Single character or fallback
      return name.substring(0, 2).toUpperCase() || 'U';
    }
  };

  /**
   * Loading skeleton - only show during initial auth check
   * Allow rendering even if profile is null (will use user.email as fallback)
   */
  if (authLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto pt-12">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // If no profile but user exists, use user email as fallback
  const displayName = profile?.display_name || user?.email || '';
  const bio = profile?.bio || '';

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto pt-12">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">My Profile</CardTitle>
                <CardDescription>
                  Manage your account information and view your activity
                </CardDescription>
              </div>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20 text-xl">
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-4">
                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="flex items-center gap-2 text-sm font-medium">
                      <UserIcon className="h-4 w-4" />
                      <span>Display Name</span>
                    </Label>
                    {isEditing ? (
                      <>
                        <Input
                          id="displayName"
                          placeholder="Your display name"
                          disabled={isSubmitting}
                          {...register('displayName')}
                        />
                        {errors.displayName && (
                          <p className="text-sm text-destructive">
                            {errors.displayName.message}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-lg font-medium">
                        {displayName || 'No name set'}
                      </p>
                    )}
                  </div>

                  {/* Email (non-editable) */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">{user?.email || 'No email'}</p>
                  </div>

                  {/* Join Date */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4" />
                      <span>Member Since</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {profile?.created_at 
                        ? formatDistanceToNow(new Date(profile.created_at), {
                            addSuffix: true,
                          })
                        : user?.created_at
                        ? formatDistanceToNow(new Date(user.created_at), {
                            addSuffix: true,
                          })
                        : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      rows={4}
                      disabled={isSubmitting}
                      {...register('bio')}
                    />
                    {errors.bio && (
                      <p className="text-sm text-destructive">
                        {errors.bio.message}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {bio || 'No bio added yet'}
                  </p>
                )}
              </div>

              {/* User Statistics */}
              <div>
                <Label className="mb-3 block">Activity Statistics</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary">
                          {isLoadingStats ? (
                            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                          ) : (
                            userStats.projectsCount
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Projects Submitted
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary">
                          {isLoadingStats ? (
                            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                          ) : (
                            userStats.commentsCount
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Comments Made
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Account Status Badge */}
              <div className="space-y-2">
                <Label>Account Status</Label>
                <div>
                  <Badge variant="secondary" className="text-sm">
                    Registered Member
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Full access to all {allIdeasCount || 87} project ideas
                  </p>
                </div>
              </div>
            </CardContent>

            {/* Edit Mode Actions */}
            {isEditing && (
              <CardFooter className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  className="hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="hover:bg-primary/90 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            )}
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
