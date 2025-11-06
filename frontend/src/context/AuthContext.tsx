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
   */
  const fetchProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  /**
   * Refresh the user profile from the database
   */
  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchProfile(user.id);
      setProfile(userProfile);
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
        fetchProfile(session.user.id).then((userProfile) => {
          setProfile(userProfile);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Fetch or clear profile based on session
      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
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
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
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
      const { error } = await supabase.auth.signOut();

      // Clear local state
      setUser(null);
      setSession(null);
      setProfile(null);

      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error as AuthError };
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
