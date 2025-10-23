# Quick Setup Guide for Proof of Dev Wave 3

## 🚀 **IMMEDIATE FIX - Create .env.local file**

Create a file called `.env.local` in the `moca_moca/proof-of-dev/` directory with this content:

```env
# Minimal configuration to get minting working
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
AIRKIT_PARTNER_ID=moca-proof-of-dev-2024
AIRKIT_API_KEY=dev-key
NODE_ENV=development
```

## 📋 **Step-by-Step Instructions**

### 1. Create the Environment File
```bash
cd moca_moca/proof-of-dev
touch .env.local
```

### 2. Add the Content
Copy the environment variables above into `.env.local`

### 3. Generate NextAuth Secret
```bash
openssl rand -base64 32
```
Copy the output and replace `your-secret-key-here` in `.env.local`

### 4. Restart the Server
```bash
npm run dev
```

### 5. Test Minting
1. Go to http://localhost:3000
2. Click "Sign in with GitHub" 
3. Connect your wallet
4. Click "Analyze My Profile"
5. Click "Mint Proof of Dev Token"

## 🔧 **What I Fixed**

1. **Created Simplified Mint API** (`/api/mint-simple`) that works without blockchain setup
2. **Updated Developer Profile** to use the simplified API
3. **Removed Blockchain Dependencies** for initial testing
4. **Added Better Error Handling** and success messages

## 🎯 **Expected Result**

After following these steps, you should be able to:
- ✅ Sign in with GitHub
- ✅ Connect your wallet  
- ✅ Analyze your GitHub profile
- ✅ Mint developer credentials
- ✅ View credentials in the dashboard

## 🚨 **If Still Not Working**

Check the browser console (F12) for error messages and let me know what you see. The most common issues are:

1. **Missing .env.local file** (most likely)
2. **GitHub OAuth not set up** (if you see auth errors)
3. **Wallet not connected** (if you see wallet errors)

## 📞 **Need Help?**

If you're still having issues, please:
1. Check browser console for errors
2. Let me know what error messages you see
3. Confirm you created the `.env.local` file
4. Tell me which step is failing
