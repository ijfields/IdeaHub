/**
 * Authentication Context for AI Ideas Hub
 *
 * Provides authentication state and methods throughout the application.
 * Handles user sign-in, sign-up, sign-out, and session management using
 * Supabase Auth.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Session, User as SupabaseUser, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { User } from '../types/database';

/**
 * Authentication context value type
 */
interface AuthContextType {
  // Current Supabase auth user (null if not authenticated)
  user: SupabaseUser | null;
  // Current session (null if not authenticated)
  session: Session | null;
  // User profile from users table (null if not authenticated or not loaded)
  profile: User | null;
  // Loading state during initial auth check
  loading: boolean;
  // Sign in with email and password
  signIn: (email: string, password: string) => Promise<{
    error: AuthError | null;
  }>;
  // Sign up with email and password
  signUp: (email: string, password: string, displayName?: string) => Promise<{
    error: AuthError | null;
  }>;
  // Sign out current user
  signOut: () => Promise<{ error: AuthError | null }>;
  // Refresh user profile from database
  refreshProfile: () => Promise<void>;
}

/**
 * Create the authentication context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 *
 * Wraps the application to provide authentication state and methods
 * to all child components via the useAuth hook.
 *
 * @example
 * ```tsx
 * import { AuthProvider } from '@/context/AuthContext';
 *
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <YourApp />
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch user profile from the users table
   * Includes timeout to prevent hanging
   */
  const fetchProfile = async (userId: string): Promise<User | null> => {
    console.log('🔵 AUTH: Fetching profile for user:', userId);
    try {
      // Supabase client already has timeout handling via custom fetch wrapper (10 seconds)
      // Just make the request - timeout is handled globally
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Don't log timeout/abort errors as errors - they're expected in some cases
        if (error.message?.includes('aborted') || error.message?.includes('timeout') || error.message?.includes('fetch')) {
          console.warn('🟡 AUTH: Profile fetch timed out or failed, continuing without profile');
        } else {
          console.error('🔴 AUTH: Error fetching user profile:', error);
        }
        return null;
      }

      console.log('🟢 AUTH: Profile fetched successfully');
      return data;
    } catch (error: any) {
      // Handle errors gracefully - don't block the app
      if (error?.name === 'AbortError' || error?.message?.includes('aborted') || error?.message?.includes('timeout')) {
        console.warn('🟡 AUTH: Profile fetch aborted/timed out, continuing without profile');
      } else {
        console.error('🔴 AUTH: Exception fetching user profile:', error?.message || error);
      }
      // Return null on timeout or error - don't block the app
      return null;
    }
  };

  /**
   * Refresh the user profile from the database
   */
  const refreshProfile = async () => {
    if (!user) {
      console.warn('🔴 AUTH: refreshProfile called but no user');
      return;
    }
    
    console.log('🔵 AUTH: Refreshing profile for user:', user.id);
    try {
      const userProfile = await fetchProfile(user.id);
      console.log('🟢 AUTH: Profile refreshed:', !!userProfile);
      setProfile(userProfile);
    } catch (error) {
      console.error('🔴 AUTH: Error refreshing profile:', error);
      throw error;
    }
  };

  /**
   * Initialize auth state and set up auth state change listener
   */
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Fetch user profile if session exists
      if (session?.user) {
        fetchProfile(session.user.id)
          .then((userProfile) => {
            setProfile(userProfile);
          })
          .catch((error) => {
            console.error('🔴 AUTH: Error in profile fetch promise:', error);
            // Set profile to null on error, but don't block loading
            setProfile(null);
          })
          .finally(() => {
            // Always set loading to false, even if profile fetch fails or hangs
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      console.error('🔴 AUTH: Error getting initial session:', error);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Fetch or clear profile based on session
      if (session?.user) {
        try {
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        } catch (error) {
          console.error('🔴 AUTH: Error fetching profile in auth state change:', error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    console.log('🔵 AUTH: Starting sign in...');
    
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const hasValidSupabase = supabaseUrl && 
                             supabaseUrl !== 'https://placeholder.supabase.co';
    
    if (!hasValidSupabase) {
      console.error('🔴 AUTH: Supabase not configured properly');
      return { 
        error: { 
          message: 'Authentication service not configured. Please check your environment variables.',
          name: 'AuthError',
          status: 500,
        } as AuthError 
      };
    }

    try {
      console.log('🔵 AUTH: Calling supabase.auth.signInWithPassword...');
      console.log('🔵 AUTH: Supabase URL:', supabaseUrl);
      
      // The fetch wrapper already has a 10-second timeout, so we don't need another timeout here
      // Just call signInWithPassword directly - if it hangs, the fetch timeout will catch it
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (result.error) {
        console.error('🔴 AUTH: Sign in error:', result.error);
        console.error('🔴 AUTH: Error details:', {
          message: result.error.message,
          name: result.error.name,
          status: result.error.status,
        });
        return { error: result.error };
      }
      
      console.log('🟢 AUTH: Sign in successful');
      console.log('🟢 AUTH: User:', result.data.user?.email);
      return { error: null };
    } catch (error) {
      console.error('🔴 AUTH: Sign in exception:', error);
      // Check if it's a timeout error from the fetch wrapper
      if (error instanceof Error && error.name === 'AbortError') {
        return { 
          error: { 
            message: 'Sign in request timed out. Please check your internet connection and try again.',
            name: 'AuthTimeoutError',
            status: 408,
          } as AuthError 
        };
      }
      return { error: error as AuthError };
    }
  };

  /**
   * Sign up with email and password
   * Optionally accepts a display name to set in the user profile
   */
  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || null,
          },
        },
      });

      // If signup successful and user is created, create profile record
      if (data.user && !error) {
        // The profile should be created by a database trigger or RPC
        // But we can also handle it here if needed
        // Note: Using 'any' type assertion due to Supabase type inference limitations
        // TODO: Generate types using Supabase CLI for better type safety:
        //   npx supabase gen types typescript --project-id <project-id> > src/types/supabase.ts
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            display_name: displayName || null,
            bio: null,
            tier: 'free',
          } as any);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }

      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as AuthError };
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    try {
      console.log('🔵 AUTH: Starting sign out...');
      
      // Sign out from Supabase FIRST to clear the session
      // Use a timeout to prevent hanging
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise<{ error: AuthError }>((resolve) =>
        setTimeout(() => resolve({ error: { message: 'Sign out timeout', name: 'TimeoutError', status: 408 } as AuthError }), 3000)
      );

      const result = await Promise.race([signOutPromise, timeoutPromise]);
      
      // Clear local state AFTER sign out attempt (regardless of success/failure)
      // This ensures the UI updates immediately and prevents auto-login
      setUser(null);
      setSession(null);
      setProfile(null);

      // Also manually clear localStorage session to prevent auto-login
      if (typeof window !== 'undefined') {
        // Clear all Supabase-related localStorage keys
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('supabase') || key.includes('sb-') || key.includes('auth'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log('🔵 AUTH: Cleared localStorage keys:', keysToRemove.length);
      }

      if (result.error) {
        console.error('🔴 AUTH: Sign out error:', result.error);
        // State is already cleared, so return error but don't block
        return { error: result.error };
      }

      console.log('🟢 AUTH: Sign out successful');
      return { error: null };
    } catch (error: any) {
      console.error('🔴 AUTH: Sign out exception:', error?.message || error);
      // Clear state even on exception
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Clear localStorage on exception too
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('supabase') || key.includes('sb-') || key.includes('auth'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
      
      return { error: { message: error?.message || 'Sign out failed', name: 'SignOutError' } as AuthError };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication context
 *
 * @throws {Error} If used outside of AuthProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, signIn, signOut } = useAuth();
 *
 *   if (!user) {
 *     return <button onClick={() => signIn(email, password)}>Sign In</button>;
 *   }
 *
 *   return <button onClick={signOut}>Sign Out</button>;
 * }
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
