# Environment Variables Setup Guide

This document explains all the `.env` files needed for the Ticket Management System.

---

## 1. Backend (.env)

**Location:** `backend/.env`

**Required Variables:**

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Database Connection
# For local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/ticketSystem

# For MongoDB Atlas (cloud):
MONGODB_URI=mongodb+srv://bouyesidatty:iL1E4016EjvLm9I6@tickets.q6vtqxa.mongodb.net/ticketSystem?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_key_here_change_in_production
JWT_EXPIRE=24h

# Password Hashing
BCRYPT_ROUNDS=10
```

**Explanation:**
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens (CHANGE IN PRODUCTION!)
- `JWT_EXPIRE`: Token expiration time
- `BCRYPT_ROUNDS`: Password hashing rounds (10-12 recommended)

---

## 2. Admin Panel (.env.local)

**Location:** `admin-panel/.env.local`

**Required Variables:**

```env
# Backend API URL
# For local development:
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# For production (replace with your backend URL):
# NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api

# App Configuration
NEXT_PUBLIC_APP_NAME=Ticket Management System
```

**Explanation:**
- `NEXT_PUBLIC_API_URL`: Backend API endpoint URL
- `NEXT_PUBLIC_APP_NAME`: Application name (optional)

**Note:** In Next.js, variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

---

## 3. User Mobile App (.env)

**Location:** `user-app/.env`

**Required Variables:**

```env
# Backend API URL
# For local development (use your computer's IP address, not localhost):
# Find your IP: Windows (ipconfig) or Mac/Linux (ifconfig)
API_URL=http://192.168.1.100:5000/api

# Example for production:
# API_URL=https://your-backend-domain.com/api
```

**Explanation:**
- `API_URL`: Backend API endpoint URL

**Important Notes:**
- ⚠️ **DO NOT use `localhost` for mobile apps!** Use your computer's IP address instead
- To find your IP address:
  - **Windows:** Open CMD and run `ipconfig` → Look for "IPv4 Address"
  - **Mac/Linux:** Open Terminal and run `ifconfig` → Look for "inet" under your network interface
- Example: If your IP is `192.168.1.100`, use `http://192.168.1.100:5000/api`
- Make sure your phone and computer are on the same Wi-Fi network

---

## 4. Scanner Mobile App (.env)

**Location:** `scanner-app/.env`

**Required Variables:**

```env
# Backend API URL
# For local development (use your computer's IP address, not localhost):
API_URL=http://192.168.1.100:5000/api

# Example for production:
# API_URL=https://your-backend-domain.com/api
```

**Explanation:**
- `API_URL`: Backend API endpoint URL

**Important Notes:**
- ⚠️ **Same as User App - use IP address, not localhost!**
- Use the same IP address as your User App
- Ensure phone and computer are on the same network

---

## Quick Setup Instructions

### Step 1: Backend Setup

1. Navigate to `backend/` folder
2. Create `.env` file with the content above
3. **IMPORTANT:** Change `JWT_SECRET` to a strong random string in production
4. Update `MONGODB_URI` if using MongoDB Atlas or different connection

### Step 2: Admin Panel Setup

1. Navigate to `admin-panel/` folder
2. Create `.env.local` file
3. Set `NEXT_PUBLIC_API_URL` to your backend URL

### Step 3: User App Setup

1. Navigate to `user-app/` folder
2. Create `.env` file
3. **Find your computer's IP address:**
   - Windows: `ipconfig` in CMD
   - Mac/Linux: `ifconfig` in Terminal
4. Set `API_URL` using your IP address (e.g., `http://192.168.1.100:5000/api`)

### Step 4: Scanner App Setup

1. Navigate to `scanner-app/` folder
2. Create `.env` file
3. Use the same IP address as User App
4. Set `API_URL` (e.g., `http://192.168.1.100:5000/api`)

---

## Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random string (use a password generator)
- [ ] Set `NODE_ENV=production` in backend
- [ ] Use MongoDB Atlas or secure MongoDB instance
- [ ] Update all API URLs to production domain
- [ ] Use HTTPS for all API endpoints
- [ ] Review and update CORS settings
- [ ] Set appropriate rate limiting values
- [ ] Change default admin password

---

## Example IP Address Finding

**Windows:**
```bash
ipconfig
# Look for: IPv4 Address . . . . . . . . . . . : 192.168.1.100
```

**Mac/Linux:**
```bash
ifconfig
# Look for: inet 192.168.1.100
```

**Then use in mobile apps:**
```env
API_URL=http://192.168.1.100:5000/api
```

---

## Troubleshooting

### Mobile apps can't connect to backend:
1. ✅ Check if backend is running (`npm run dev` in backend folder)
2. ✅ Verify IP address is correct (not localhost)
3. ✅ Ensure phone and computer are on same Wi-Fi network
4. ✅ Check Windows Firewall allows connections on port 5000
5. ✅ Try accessing `http://YOUR_IP:5000/health` in phone browser

### Admin panel can't connect:
1. ✅ Check if backend is running
2. ✅ Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. ✅ Restart Next.js dev server after changing `.env.local`

---

## Security Notes

- ⚠️ **Never commit `.env` files to Git!** (They're in `.gitignore`)
- ⚠️ **Change default JWT_SECRET** before production
- ⚠️ **Use strong passwords** for MongoDB if using Atlas
- ⚠️ **Enable HTTPS** in production
- ⚠️ **Use environment-specific values** (dev/staging/prod)

