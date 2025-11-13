# Password Gate Setup - Closed Beta Protection

## Overview

The Password Gate is a simple, client-side password protection mechanism added to IdeaHub to control access during the closed beta period.

**Features:**
- ✅ Free (no platform cost)
- ✅ Easy to implement
- ✅ Remembers authenticated users (localStorage)
- ✅ Customizable password via environment variable
- ✅ Professional UI with shadcn/ui components

**Limitations:**
- ⚠️ Client-side only (not cryptographically secure)
- ⚠️ Password can be found in source code if someone inspects
- ⚠️ Suitable for closed beta, not production security

## How It Works

1. User visits the site
2. **PasswordGate** component checks localStorage for authentication
3. If not authenticated, shows password prompt
4. User enters password
5. If correct, password is saved to localStorage and app loads
6. On future visits, app loads automatically (no re-authentication needed)

## Configuration

### Setting the Password

**In Development (.env.local):**
```bash
VITE_BETA_PASSWORD=YourSecretPassword123
```

**In Production (Vercel):**
1. Go to Vercel Dashboard → Frontend Project
2. Settings → Environment Variables
3. Add variable:
   - **Name:** `VITE_BETA_PASSWORD`
   - **Value:** `YourBetaPassword`
   - **Environments:** Production, Preview, Development
4. Redeploy the frontend

**Default Password:**
If no environment variable is set, the default password is: `IdeaHubBeta2025`

### Changing the Password

1. Update the environment variable in Vercel
2. Redeploy the frontend
3. Share new password with beta testers
4. Previous users will need to clear localStorage or re-enter password

## Files Modified

### `/frontend/src/components/PasswordGate.tsx`
The main password protection component.

**Features:**
- Password input with error handling
- localStorage persistence
- Professional UI with gradients
- Loading state
- Email contact link for access requests

### `/frontend/src/main.tsx`
Wraps the entire app with the PasswordGate component.

```tsx
<PasswordGate>
  <Suspense fallback={<LoadingFallback />}>
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  </Suspense>
</PasswordGate>
```

### `/frontend/.env.example`
Added `VITE_BETA_PASSWORD` environment variable documentation.

## User Experience

### First Visit
1. User sees password prompt with IdeaHub branding
2. Enters beta password
3. If correct, app loads
4. Password saved to localStorage

### Return Visit
1. App checks localStorage
2. Finds saved password
3. Automatically loads app (no prompt)

### Wrong Password
1. Error message displays
2. Input field clears
3. User can try again

## Testing

### Local Testing
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` and test:
- [ ] Password prompt appears
- [ ] Wrong password shows error
- [ ] Correct password grants access
- [ ] Refresh page - should stay authenticated
- [ ] Clear localStorage and refresh - should prompt again

### Production Testing
After deployment:
1. Visit production URL
2. Verify password gate appears
3. Test authentication
4. Share password with beta testers

## Removing Password Protection

### Option 1: Comment Out (Quick Disable)
In `/frontend/src/main.tsx`:
```tsx
// Temporarily disable password gate
function AppWrapper() {
  return (
    <QueryClientProvider client={queryClient} contextSharing={true}>
      {/* <PasswordGate> */}
        <Suspense fallback={<LoadingFallback />}>
          {/* ... */}
        </Suspense>
      {/* </PasswordGate> */}
    </QueryClientProvider>
  );
}
```

### Option 2: Remove Component (Permanent)
1. Remove `<PasswordGate>` wrapper from `main.tsx`
2. Delete `/frontend/src/components/PasswordGate.tsx`
3. Remove `VITE_BETA_PASSWORD` from environment variables
4. Redeploy

## Troubleshooting

### "Can't access site even with correct password"
- Check environment variable is set correctly
- Verify frontend has been redeployed after env variable change
- Clear browser localStorage and try again
- Check browser console for errors

### "Password not working after deployment"
- Ensure `VITE_BETA_PASSWORD` is set in Vercel
- Verify you redeployed after setting env variable
- Check you're using the correct password (check Vercel dashboard)

### "Users keep getting locked out"
- They may have cleared localStorage/cookies
- Send them the password again
- Consider using invitation-only authentication instead

### "Want to reset access for all users"
1. Change `VITE_BETA_PASSWORD` in Vercel
2. Redeploy frontend
3. All users will need new password
4. Their old localStorage value won't match

## Security Considerations

**What This Protects Against:**
- ✅ Casual visitors stumbling upon the site
- ✅ Search engines indexing during beta
- ✅ Sharing links accidentally

**What This Does NOT Protect Against:**
- ❌ Determined individuals inspecting source code
- ❌ Password sharing (beta testers can share password)
- ❌ Brute force attacks (client-side validation)

**For Better Security:**
- Use invitation-only registration (already built into IdeaHub)
- Disable public signup
- Manually create accounts for beta testers
- See: `/docs/enhancements/email-server-setup.md` for invitation-only setup

## Deployment Checklist

- [ ] Set `VITE_BETA_PASSWORD` in Vercel frontend environment variables
- [ ] Redeploy frontend to Vercel
- [ ] Test password gate on production URL
- [ ] Share password with beta testers via secure channel (not public)
- [ ] Verify returning users stay authenticated
- [ ] Test wrong password error handling

## Next Steps After Beta

Once you're ready for public launch:
1. Remove password gate (see "Removing Password Protection" above)
2. Enable public signup
3. Remove password from environment variables
4. Update documentation to remove beta references

---

## Related Documentation

- Email Server Setup: `/docs/enhancements/email-server-setup.md`
- Deployment Guide: `/docs/DEPLOYMENT.md`
- Authentication Rules: `/docs/AUTH_ACCOUNT_RULES.md`

**Created:** November 13, 2025
**Status:** Implemented and ready for deployment
