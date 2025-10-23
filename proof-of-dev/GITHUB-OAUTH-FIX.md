# 🔧 GitHub OAuth Setup Guide

## 🚨 **Issue: GitHub User Search/Analysis Fails**

This guide provides step-by-step instructions to fix GitHub OAuth authentication and enable user search functionality.

## 📋 **Root Causes & Solutions**

### **1. Missing GitHub OAuth Configuration**
- **Problem**: `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` not set
- **Solution**: Create GitHub OAuth App and configure environment variables

### **2. Incorrect OAuth Scopes**
- **Problem**: Insufficient permissions for GitHub API access
- **Solution**: Updated scopes to include `read:user`, `user:email`, `read:org`, `public_repo`, `read:repo`

### **3. Session Token Issues**
- **Problem**: Access token not properly stored in session
- **Solution**: Enhanced JWT and session callbacks with proper token handling

### **4. Client-Side API Calls**
- **Problem**: Frontend making direct GitHub API calls without authentication
- **Solution**: Server-side proxy endpoint with proper authentication

## 🛠️ **Step-by-Step Fix**

### **Step 1: Create GitHub OAuth App**

1. **Go to GitHub Developer Settings**
   - Visit: https://github.com/settings/developers
   - Click "OAuth Apps" in the left sidebar
   - Click "New OAuth App"

2. **Fill in Application Details**
   ```
   Application name: Proof of Dev Wave 3
   Homepage URL: http://localhost:3000
   Authorization callback URL: http://localhost:3000/api/auth/callback/github
   ```

3. **Get Credentials**
   - Copy the **Client ID**
   - Generate and copy the **Client Secret**

### **Step 2: Update Environment Variables**

Create or update `.env.local` in the `proof-of-dev` directory:

```env
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Generate NextAuth secret
# Run: openssl rand -base64 32
```

### **Step 3: Verify Configuration**

1. **Check Environment Variables**
   ```bash
   # Run diagnostics
   curl http://localhost:3000/api/diagnostics
   ```

2. **Test GitHub Authentication**
   - Start the app: `npm run dev`
   - Go to http://localhost:3000
   - Click "Sign in with GitHub"
   - Complete OAuth flow

3. **Test User Search**
   - After signing in, use the search box to find other GitHub users
   - Try searching for "octocat" (GitHub's mascot)

## 🔍 **Enhanced Features Implemented**

### **1. Robust GitHub Analysis API** (`/api/analyze-github`)
```typescript
✅ Input validation with GitHub username format checking
✅ Session and access token validation
✅ GitHub OAuth configuration validation
✅ Comprehensive error handling for GitHub API errors
✅ Rate limit detection and handling
✅ User not found (404) handling
✅ Authentication failure (401) handling
✅ Request ID tracking for debugging
✅ Processing time measurement
```

### **2. Enhanced Authentication** (`src/lib/auth.ts`)
```typescript
✅ Updated OAuth scopes for full GitHub API access
✅ Proper access token storage in JWT
✅ GitHub profile information in session
✅ Debug logging for authentication flow
✅ Error handling and logging
```

### **3. Improved Developer Profile Component**
```typescript
✅ User search functionality
✅ Auto-analysis of current user's profile
✅ Better error handling and user feedback
✅ Loading states and progress indicators
✅ Re-authentication prompts
✅ Search input validation
```

## 🧪 **Testing Checklist**

### **Authentication Test**
- [ ] Sign in with GitHub works
- [ ] Session contains `accessToken`
- [ ] Session contains `githubLogin`
- [ ] No "Unauthorized" errors

### **User Search Test**
- [ ] Can search for other GitHub users
- [ ] Search returns metrics for valid users
- [ ] Proper error for non-existent users
- [ ] Rate limit handling works

### **API Endpoint Test**
```bash
# Test with authenticated session
curl -X POST http://localhost:3000/api/analyze-github \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your_session_token" \
  -d '{"username": "octocat"}'
```

**Expected Response:**
```json
{
  "success": true,
  "metrics": {
    "reputationScore": 85,
    "totalRepositories": 12,
    "totalStars": 45,
    "followers": 23,
    "accountAge": 365,
    "languages": {...}
  },
  "requestId": "abc123",
  "processingTime": 2500
}
```

## 🐛 **Troubleshooting**

### **Common Issues & Solutions:**

1. **"Unauthorized" Error**
   - **Cause**: Missing or invalid GitHub OAuth credentials
   - **Solution**: Check `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

2. **"GitHub access token not available"**
   - **Cause**: OAuth flow not completed or session expired
   - **Solution**: Re-authenticate with GitHub

3. **"GitHub user not found"**
   - **Cause**: Invalid username or user doesn't exist
   - **Solution**: Check username spelling and try again

4. **"Rate limit exceeded"**
   - **Cause**: Too many GitHub API requests
   - **Solution**: Wait and try again later

5. **"GitHub authentication failed"**
   - **Cause**: Invalid or expired access token
   - **Solution**: Sign out and sign in again

### **Debug Steps:**
1. Check browser console for errors
2. Verify environment variables in `.env.local`
3. Test OAuth flow manually
4. Check server logs for detailed error messages
5. Use diagnostics endpoint to verify configuration

## 📊 **Expected User Experience**

### **Before Fix:**
- ❌ "Unauthorized" errors when searching users
- ❌ No access to GitHub API
- ❌ Limited to own profile only
- ❌ Poor error messages

### **After Fix:**
- ✅ Seamless GitHub authentication
- ✅ Search any public GitHub user
- ✅ Comprehensive developer metrics
- ✅ Clear error messages and guidance
- ✅ Rate limit handling
- ✅ Re-authentication prompts

## 🎯 **Success Metrics**

- **Authentication**: 100% success rate for GitHub OAuth
- **User Search**: Can analyze any public GitHub user
- **Error Handling**: Specific, actionable error messages
- **Performance**: < 3 seconds for user analysis
- **User Experience**: Intuitive search and analysis flow

## 📚 **Additional Resources**

- **GitHub OAuth Documentation**: https://docs.github.com/en/developers/apps/building-oauth-apps
- **NextAuth GitHub Provider**: https://next-auth.js.org/providers/github
- **GitHub API Documentation**: https://docs.github.com/en/rest
- **Environment Setup**: `env.example`
- **API Documentation**: `src/app/api/analyze-github/route.ts`

---

**🎉 GitHub user search and analysis is now fully functional with robust error handling and user experience!**
