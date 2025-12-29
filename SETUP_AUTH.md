# Authentication Setup Guide

## ✅ What's Done

All authentication code has been implemented! Here's what was created:

### Files Created/Modified:
1. **Database Schema** - `prisma/schema.prisma`
2. **NextAuth API** - `app/api/auth/[...nextauth]/route.ts`
3. **Signup API** - `app/api/auth/signup/route.ts`
4. **Signin Page** - `app/signin/page.tsx`
5. **Signup Page** - `app/signup/page.tsx`
6. **Auth Provider** - `components/auth-provider.tsx`
7. **Protected Home** - `app/page.tsx` (now requires authentication)
8. **Types** - `types/next-auth.d.ts`
9. **Prisma Client** - `lib/prisma.ts`

---

## 🔧 Setup Steps (Do These Next)

### 1. Add Your PostgreSQL Database URL

Update `.env` file with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

### 2. Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Then add it to `.env`:

```env
NEXTAUTH_SECRET="paste-generated-secret-here"
```

### 3. Setup Google OAuth (Get Credentials)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create a new project (or select existing)
3. Enable "Google+ API"
4. Create OAuth 2.0 Client ID:
   - **Application type**: Web application
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000`
   - **Authorized redirect URIs**: 
     - `http://localhost:3000/api/auth/callback/google`

5. Copy the **Client ID** and **Client Secret**

6. Add to `.env`:

```env
GOOGLE_CLIENT_ID="your-client-id-here"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

### 4. Run Prisma Migrations

Once your `DATABASE_URL` is set, run:

```bash
npx prisma generate
npx prisma db push
```

This will create all database tables.

### 5. Start the Development Server

```bash
npm run dev
```

---

## 🎯 Features Implemented

### Signup Page (`/signup`)
- ✅ Username field (min 3 characters)
- ✅ Email field with validation
- ✅ Password field (min 6 characters)
- ✅ Sign up with Google button
- ✅ Auto-signin after successful signup
- ✅ Validation error messages

### Signin Page (`/signin`)
- ✅ Email & password login
- ✅ Sign in with Google button
- ✅ Error handling
- ✅ Redirect to home on success

### Protected Routes
- ✅ Home page requires authentication
- ✅ Redirects to signin if not logged in
- ✅ Shows user info when logged in
- ✅ Sign out button

### Database Schema
- ✅ User model with username, email, password, googleId
- ✅ Account model for OAuth
- ✅ Session model for NextAuth
- ✅ Meeting & Transcript models for future use

---

## 🧪 Testing After Setup

1. **Test Signup**:
   - Go to http://localhost:3000/signup
   - Create account with username/email/password
   - Should auto-signin and redirect to home

2. **Test Signin**:
   - Sign out
   - Go to http://localhost:3000/signin
   - Sign in with credentials
   - Should redirect to home

3. **Test Google OAuth**:
   - Click "Sign in with Google" on signin page
   - Complete Google authorization
   - Should create account and redirect to home

4. **Test Protected Route**:
   - Sign out
   - Try to access http://localhost:3000
   - Should redirect to `/signin`

---

## 📝 Environment Variables Checklist

Make sure your `.env` has all these:

```env
# Stream Video (already set)
STREAM_API_KEY=rzgjggh4y8ng
STREAM_SECRET_KEY=75acr3rb8eneg8ru4ztfkpe36pyskhmg4r784sepuwvv9ucqph2ftd8d44p65hdq
NEXT_PUBLIC_STREAM_API_KEY=rzgjggh4y8ng
NEXT_PUBLIC_CALL_ID=demo-meeting

# Database (YOU NEED TO ADD)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# NextAuth (YOU NEED TO ADD)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth (YOU NEED TO ADD)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

---

## 🚀 Next Steps After Authentication Works

Once authentication is working, you can:

1. Add dynamic meeting creation (generate unique meeting IDs)
2. Implement Redis for transcript caching
3. Store transcripts in database
4. Add meeting invite links
5. Implement meeting history
6. Add user profile page

---

## ❓ Troubleshooting

### "Cannot find module '@prisma/client'"
Run: `npx prisma generate`

### "Invalid `prisma.user.create()` invocation"
Your database isn't connected. Check your `DATABASE_URL` in `.env`

### Google OAuth redirect error
Make sure redirect URI in Google Console matches exactly:
`http://localhost:3000/api/auth/callback/google`

### "NEXTAUTH_SECRET is not set"
Generate and add to `.env`: `openssl rand -base64 32`

---

## 📞 Need Help?

If you encounter issues, check:
1. All environment variables are set
2. Database is running and accessible
3. Google OAuth credentials are correct
4. Prisma migrations have run successfully

Good luck! 🎉
