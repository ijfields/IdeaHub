# Email Server Setup for Supabase Authentication

## Current Situation

The IdeaHub application uses Supabase Authentication with email/password signup. By default, Supabase sends confirmation emails through their SMTP service, but this has limitations:

**Default Supabase Email (Current):**
- ✅ Works out of the box for testing
- ⚠️ Limited daily email quota
- ⚠️ Emails may go to spam
- ⚠️ Generic "from" address (noreply@mail.app.supabase.io)
- ⚠️ Not suitable for production with many users

## Why We Need a Custom Mail Server

For closed beta with a small group:
- **Professional appearance**: Emails from your domain (e.g., noreply@ideahub.com)
- **Better deliverability**: Less likely to be marked as spam
- **Higher quotas**: Send more emails per day
- **Custom templates**: Brand your confirmation emails
- **Email reliability**: Not dependent on Supabase's shared infrastructure

## Options for Email Service

### Option 1: Resend (Recommended for MVP)
**Best for:** Small to medium scale, developer-friendly

**Pros:**
- ✅ Free tier: 100 emails/day, 3,000/month
- ✅ Easy API integration
- ✅ Great deliverability
- ✅ Clean UI for email templates
- ✅ Generous free tier for closed beta

**Pricing:**
- Free: 3,000 emails/month
- Pro: $20/month for 50,000 emails/month

**Setup Steps:**
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use their test domain)
3. Get API key
4. Configure in Supabase: Settings → Auth → SMTP Settings
5. Update email templates in Supabase

**Supabase SMTP Configuration:**
```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP Username: resend
SMTP Password: <your-resend-api-key>
Sender Email: noreply@yourdomain.com (or resend test domain)
```

---

### Option 2: SendGrid
**Best for:** Scaling up, enterprise features

**Pros:**
- ✅ Free tier: 100 emails/day
- ✅ Excellent deliverability
- ✅ Advanced analytics
- ✅ Well-established service

**Cons:**
- ⚠️ More complex setup
- ⚠️ Requires domain verification
- ⚠️ Free tier is small (100/day)

**Pricing:**
- Free: 100 emails/day
- Essentials: $19.95/month for 50,000 emails/month

---

### Option 3: Mailgun
**Best for:** Developers, transactional emails

**Pros:**
- ✅ Free tier: 5,000 emails/month (first 3 months)
- ✅ Developer-friendly API
- ✅ Good documentation

**Cons:**
- ⚠️ Free tier limited to 3 months
- ⚠️ Then: $35/month for 50,000 emails

---

### Option 4: AWS SES (Amazon Simple Email Service)
**Best for:** High volume, cost optimization

**Pros:**
- ✅ Very cheap: $0.10 per 1,000 emails
- ✅ Unlimited scale
- ✅ Reliable infrastructure

**Cons:**
- ⚠️ Complex setup (AWS account, IAM, verification)
- ⚠️ Requires domain verification
- ⚠️ Not beginner-friendly
- ⚠️ May need "out of sandbox" request for production

---

## Recommendation for IdeaHub Closed Beta

**Use Resend** for these reasons:

1. **Free tier is generous** (3,000 emails/month = ~100 signups with confirmation + password reset emails)
2. **Easy setup** (15 minutes)
3. **Developer-friendly** (clean API, good docs)
4. **Professional** (custom domain support)
5. **Scalable** (easy to upgrade when needed)

**Timeline:**
- **Week 1-2 (Closed Beta)**: Can use default Supabase emails for <10 users
- **Week 3+ (Expanding Beta)**: Switch to Resend before inviting more users

---

## Implementation Steps

### Phase 1: Keep Default Supabase Emails (Current)
**For:** Initial testing with <10 users
**Action:** Nothing needed, already working
**Limitation:** Emails may go to spam, ask testers to check spam folder

### Phase 2: Set Up Resend (Before Public Beta)
**Timeline:** 1-2 hours setup
**When:** Before inviting >10 people

**Steps:**
1. Sign up for Resend account
2. Add and verify a domain (or use test domain)
3. Get API key from Resend dashboard
4. Configure Supabase SMTP settings
5. Test with a signup
6. Customize email templates in Supabase

### Phase 3: Custom Email Templates (Optional)
**Timeline:** 2-3 hours
**When:** After beta feedback

**Customize:**
- Confirmation email template
- Password reset template
- Magic link template
- Welcome email

---

## Testing Checklist

After setting up custom SMTP:

- [ ] Test signup confirmation email
- [ ] Test password reset email
- [ ] Test magic link (if using)
- [ ] Check spam folder (should not be there)
- [ ] Verify "From" address looks professional
- [ ] Check email rendering on mobile and desktop
- [ ] Test email links work correctly

---

## Monitoring & Troubleshooting

**Monitor:**
- Email delivery rate (Resend dashboard)
- Bounce rate
- Spam reports
- Daily quota usage

**Common Issues:**
- **Emails in spam**: Domain not verified, SPF/DKIM not configured
- **Emails not sending**: SMTP credentials wrong, quota exceeded
- **Links broken**: Frontend URL not configured in Supabase

---

## Cost Estimate

**Closed Beta (50 users):**
- Free tier (Resend or SendGrid)
- Cost: $0/month

**Open Beta (500 users):**
- Resend Free tier: 3,000 emails/month
- Cost: $0/month (still within free tier)

**Launch (2,000+ users):**
- Resend Pro: $20/month for 50,000 emails
- Cost: $20/month

---

## Session Task

Create separate implementation session:
- **Session Name**: "Email Server Setup - Resend Integration"
- **Estimated Time**: 2-3 hours
- **Prerequisites**:
  - Closed beta deployed
  - >10 users ready to test
  - Domain name (optional but recommended)

---

## Related Documentation

- Supabase SMTP Configuration: https://supabase.com/docs/guides/auth/auth-smtp
- Resend Docs: https://resend.com/docs
- Email Deliverability Guide: (to be created)

---

## Decision Point

**For immediate closed beta (<10 people):**
- ✅ Use default Supabase emails
- ✅ Ask testers to check spam folders
- ✅ Note in beta invitation: "Check spam for confirmation email"

**Before scaling to >10 people:**
- ⚠️ Set up Resend (1-2 hours)
- ⚠️ Test thoroughly before mass invites

**What to do now:**
1. Enable Vercel password protection
2. Send beta invites to 5-10 people
3. Monitor if emails are delivered
4. If >50% go to spam, set up Resend
5. Otherwise, wait until user count grows
