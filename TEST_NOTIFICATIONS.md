# Quick Test Guide - Is It Working?

## Step-by-Step Testing

### Step 1: Check if Seed Data Exists

Run this in your terminal (with dev server running):
```bash
# Check if you have contracts
curl http://localhost:3000/api/contracts

# Check if you have notifications
curl http://localhost:3000/api/notifications
```

**Expected:**
- Contracts API: Should return array (empty `[]` if no contracts)
- Notifications API: Should return array (empty `[]` if no notifications)

### Step 2: Run Seed Script (If Not Done)

```bash
# For your specific account
$env:SEED_USER_IDS="user_39FHsCsyf0shVkgpaV0dQ6Hnt1e"; npm run seed

# Or for all existing users
npm run seed
```

**Expected Output:**
```
🔥 Connected to MongoDB
🧹 Old Data Cleared (preserving existing users)
👥 Using 1 user(s) for seeding
👤 Profiles Created
📄 Contracts Created with Realistic Content
💰 Finance Created
💬 Conversations Created
🔔 Notifications Generated: X notifications for 1 users
🎉 SEED COMPLETED SUCCESSFULLY!
```

### Step 3: Test in Browser

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Log into your app**

3. **Visit notifications page:**
   ```
   http://localhost:3000/dashboard/notifications
   ```

**What you should see:**
- ✅ Notifications displayed (not "No notifications")
- ✅ Summary cards showing counts (Pending Requests, Active Alerts, etc.)
- ✅ Filter tabs working
- ✅ Notification cards with details

### Step 4: Test API Endpoints

**In browser console (F12), run:**

```javascript
// Test 1: Fetch notifications
fetch('/api/notifications')
  .then(r => r.json())
  .then(data => {
    console.log('Notifications:', data);
    console.log('Count:', data.length);
  });

// Test 2: Generate notifications manually
fetch('/api/notifications/generate', { method: 'GET' })
  .then(r => r.json())
  .then(data => {
    console.log('Generation result:', data);
  });

// Test 3: Check contracts
fetch('/api/contracts')
  .then(r => r.json())
  .then(data => {
    console.log('Contracts:', data);
    console.log('Count:', data.length);
  });
```

**Expected Results:**
- Test 1: Returns array of notifications
- Test 2: Returns `{ success: true, notificationsCreated: X, usersProcessed: Y }`
- Test 3: Returns array of contracts

### Step 5: Verify Notification Types

Check if you see different notification types:

```javascript
fetch('/api/notifications')
  .then(r => r.json())
  .then(data => {
    const types = data.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {});
    console.log('Notification types:', types);
    // Should show: { request: X, alert: Y, payment: Z, update: W }
  });
```

## Common Issues & Solutions

### Issue 1: "No notifications" or Empty Array

**Solution:**
```bash
# Run seed script for your account
$env:SEED_USER_IDS="user_39FHsCsyf0shVkgpaV0dQ6Hnt1e"; npm run seed
```

### Issue 2: "User not found" Error

**Solution:**
- Make sure you're logged in
- Your Clerk user ID should exist in database
- Run seed script to create profiles

### Issue 3: "Failed to fetch notifications"

**Check:**
1. Is dev server running? (`npm run dev`)
2. Are you logged in?
3. Check browser console for errors
4. Check server terminal for errors

### Issue 4: Notifications Not Generating

**Solution:**
```bash
# Manually trigger generation
curl http://localhost:3000/api/notifications/generate

# Or in browser console:
fetch('/api/notifications/generate', { method: 'GET' })
  .then(r => r.json())
  .then(console.log);
```

## Quick Health Check Script

Run this in browser console to check everything:

```javascript
async function healthCheck() {
  console.log('🔍 Starting Health Check...\n');
  
  // Check 1: Contracts
  try {
    const contractsRes = await fetch('/api/contracts');
    const contracts = await contractsRes.json();
    console.log('✅ Contracts:', contracts.length, 'found');
  } catch (e) {
    console.log('❌ Contracts API failed:', e.message);
  }
  
  // Check 2: Notifications
  try {
    const notifRes = await fetch('/api/notifications');
    const notifications = await notifRes.json();
    console.log('✅ Notifications:', notifications.length, 'found');
    
    if (notifications.length > 0) {
      const types = notifications.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {});
      console.log('   Types:', types);
    }
  } catch (e) {
    console.log('❌ Notifications API failed:', e.message);
  }
  
  // Check 3: Generate endpoint
  try {
    const genRes = await fetch('/api/notifications/generate', { method: 'GET' });
    const genData = await genRes.json();
    console.log('✅ Generate endpoint works:', genData.message || genData.error);
  } catch (e) {
    console.log('❌ Generate endpoint failed:', e.message);
  }
  
  console.log('\n✨ Health check complete!');
}

healthCheck();
```

## Success Indicators

✅ **System is working if:**
- Seed script completes without errors
- `/dashboard/notifications` shows notifications
- Summary cards show numbers > 0
- Different notification types are visible
- API endpoints return data (not errors)

❌ **System needs fixing if:**
- Empty notifications page
- API returns 500 errors
- "User not found" errors
- Seed script fails
- No contracts in database
