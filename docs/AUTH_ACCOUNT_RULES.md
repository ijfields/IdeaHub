# Authentication & Account Management Rules

This document outlines rules and best practices to prevent common authentication and account-related issues.

## Core Principles

### 1. **Never Block the UI on Async Operations**
- **Rule:** All async operations (auth, profile fetch, etc.) must have timeouts
- **Why:** Prevents UI from hanging indefinitely if network/DB is slow
- **Implementation:**
  ```typescript
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Operation timeout')), 5000)
  );
  await Promise.race([actualOperation, timeoutPromise]);
  ```

### 2. **Clear Local State Before Server Calls**
- **Rule:** For logout and similar operations, clear local state FIRST, then call server
- **Why:** Ensures UI updates immediately even if server call fails/hangs
- **Implementation:**
  ```typescript
  // ✅ GOOD: Clear state first
  setUser(null);
  setSession(null);
  await supabase.auth.signOut(); // May hang, but UI already updated
  
  // ❌ BAD: Wait for server first
  await supabase.auth.signOut(); // UI blocked if this hangs
  setUser(null);
  ```

### 3. **Always Provide Fallback Values**
- **Rule:** Pages should render even if optional data (like profile) is null
- **Why:** Users shouldn't see blank pages if profile fetch fails
- **Implementation:**
  ```typescript
  // ✅ GOOD: Use fallbacks
  const displayName = profile?.display_name || user?.email || 'User';
  
  // ❌ BAD: Assume profile exists
  const displayName = profile.display_name; // Crashes if profile is null
  ```

### 4. **Match API Data Structures**
- **Rule:** Backend and frontend must agree on data structure
- **Why:** Prevents "Anonymous" users, missing fields, etc.
- **Implementation:**
  ```typescript
  // ✅ GOOD: Consistent structure
  // Backend returns: { user: { display_name, email } }
  // Frontend expects: comment.user.display_name
  
  // ❌ BAD: Inconsistent structure
  // Backend returns: { user_display_name }
  // Frontend expects: comment.user.display_name
  ```

### 5. **Handle Loading States Properly**
- **Rule:** Always check `authLoading` before rendering protected content
- **Why:** Prevents showing blank pages during initial auth check
- **Implementation:**
  ```typescript
  // ✅ GOOD: Check loading state
  if (authLoading) return <LoadingSkeleton />;
  if (!user) return <RedirectToLogin />;
  return <ProtectedContent />;
  
  // ❌ BAD: Assume user exists
  return <ProtectedContent />; // May render before auth check completes
  ```

### 6. **Use Admin Client for Backend Operations**
- **Rule:** Backend routes should use `supabaseAdmin` to bypass RLS
- **Why:** RLS policies can block legitimate operations
- **Implementation:**
  ```typescript
  // ✅ GOOD: Use admin client
  const { data } = await supabaseAdmin.from('users').select('*');
  
  // ❌ BAD: Use regular client (may be blocked by RLS)
  const { data } = await supabase.from('users').select('*');
  ```

## Specific Patterns

### Profile Fetching Pattern
```typescript
const fetchProfile = async (userId: string): Promise<User | null> => {
  try {
    const profilePromise = supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
    );

    const { data, error } = await Promise.race([profilePromise, timeoutPromise]);

    if (error) {
      console.error('Error fetching profile:', error);
      return null; // Don't throw, return null
    }

    return data;
  } catch (error) {
    console.error('Exception fetching profile:', error);
    return null; // Always return null on error, never throw
  }
};
```

### Auth State Initialization Pattern
```typescript
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      fetchProfile(session.user.id)
        .then((userProfile) => {
          setProfile(userProfile);
        })
        .catch((error) => {
          console.error('Error in profile fetch:', error);
          setProfile(null); // Set to null on error
        })
        .finally(() => {
          setLoading(false); // ALWAYS set loading to false
        });
    } else {
      setLoading(false); // Set loading false even if no session
    }
  }).catch((error) => {
    console.error('Error getting session:', error);
    setLoading(false); // Set loading false on error
  });
}, []);
```

### Logout Pattern
```typescript
const signOut = async () => {
  try {
    // Clear local state FIRST
    setUser(null);
    setSession(null);
    setProfile(null);

    // Then attempt server sign out (with timeout)
    const signOutPromise = supabase.auth.signOut();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Sign out timeout')), 3000)
    );

    const { error } = await Promise.race([signOutPromise, timeoutPromise]);

    if (error) {
      console.error('Sign out error:', error);
      // State already cleared, so return error but don't block
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Sign out exception:', error);
    // State already cleared, so return error but don't block
    return { error: { message: 'Sign out failed' } };
  }
};
```

### Page Rendering Pattern (Protected Routes)
```typescript
export default function ProtectedPage() {
  const { user, profile, loading: authLoading } = useAuth();

  // Show loading during initial auth check
  if (authLoading) {
    return (
      <MainLayout>
        <LoadingSkeleton />
      </MainLayout>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  // Use fallbacks for optional data
  const displayName = profile?.display_name || user.email || 'User';
  const bio = profile?.bio || '';

  // Render page with fallback values
  return (
    <MainLayout>
      <Content displayName={displayName} bio={bio} />
    </MainLayout>
  );
}
```

## Common Pitfalls to Avoid

### ❌ Don't: Wait for profile before rendering
```typescript
if (!profile) return <LoadingSkeleton />; // May never render if profile fetch fails
```

### ✅ Do: Render with fallbacks
```typescript
const displayName = profile?.display_name || user?.email || 'User';
// Page renders even if profile is null
```

### ❌ Don't: Block logout on server response
```typescript
await supabase.auth.signOut(); // May hang
setUser(null); // Never reached if signOut hangs
```

### ✅ Do: Clear state first
```typescript
setUser(null); // UI updates immediately
await supabase.auth.signOut(); // May hang, but UI already updated
```

### ❌ Don't: Assume data structure matches
```typescript
comment.user_display_name // Backend may return different structure
```

### ✅ Do: Match structures exactly
```typescript
// Backend returns: { user: { display_name } }
comment.user.display_name // Frontend expects this structure
```

## Testing Checklist

Before committing auth/account changes, verify:

- [ ] Login completes even if profile fetch times out
- [ ] Logout works and redirects immediately
- [ ] Protected pages render with fallbacks if profile is null
- [ ] Loading states show appropriately
- [ ] Error states don't block the UI
- [ ] User data displays correctly (not "Anonymous")
- [ ] All async operations have timeouts
- [ ] State is cleared before async operations that may hang

## Related Files

- `frontend/src/context/AuthContext.tsx` - Main auth context implementation
- `backend/src/routes/comments.ts` - Comment routes with user data
- `backend/src/routes/ideas.ts` - Idea routes with access control
- `frontend/src/pages/Profile.tsx` - Profile page with fallbacks
- `frontend/src/pages/Settings.tsx` - Settings page with loading states
- `frontend/src/pages/Dashboard.tsx` - Dashboard page with loading states

