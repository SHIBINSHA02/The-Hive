# 🧪 Quick Test - Notification System

## Step 1: Run Seed Script for Your Account(s)

### For Single User:
Open PowerShell and run:

```powershell
$env:SEED_USER_IDS="user_39FHsCsyf0shVkgpaV0dQ6Hnt1e"; npm run seed
```

### For Multiple Users:
To seed for both accounts, run:

```powershell
$env:SEED_USER_IDS="user_39FHsCsyf0shVkgpaV0dQ6Hnt1e,user_37kiUIRDJeKeynbdqqHtSnNqiZ7"; npm run seed
```

### For All Existing Users:
If you want to seed for all users in the database:

```powershell
npm run seed
```

**Expected output:**
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

## Step 2: Start Dev Server

```bash
npm run dev
```

## Step 3: Test in Browser

### Option A: Visit Notifications Page
1. Log into your app
2. Go to: `http://localhost:3000/dashboard/notifications`
3. **You should see:**
   - ✅ Notifications listed
   - ✅ Summary cards with numbers
   - ✅ Different notification types

### Option B: Test via Browser Console

1. Open browser console (F12)
2. Paste and run this code:

```javascript
// Complete test script
console.log('🧪 Testing Notification System...\n');

// Test 1: Check notifications
fetch('/api/notifications')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Test 1 - Notifications API:');
    console.log('   Count:', data.length);
    if (data.length > 0) {
      console.log('   First notification:', data[0].title);
      const types = {};
      data.forEach(n => types[n.type] = (types[n.type] || 0) + 1);
      console.log('   Types:', types);
    } else {
      console.log('   ⚠️ No notifications found. Run seed script!');
    }
  })
  .catch(e => console.log('❌ Error:', e.message));

// Test 2: Check contracts
fetch('/api/contracts')
  .then(r => r.json())
  .then(data => {
    console.log('\n✅ Test 2 - Contracts API:');
    console.log('   Count:', data.length);
  })
  .catch(e => console.log('❌ Error:', e.message));

// Test 3: Manual generation
fetch('/api/notifications/generate', { method: 'GET' })
  .then(r => r.json())
  .then(data => {
    console.log('\n✅ Test 3 - Generate Endpoint:');
    console.log('   Result:', data.message || data.error);
  })
  .catch(e => console.log('❌ Error:', e.message));
```

## Step 4: Verify Results

**✅ Success if you see:**
- Notifications count > 0
- Different notification types (request, alert, payment, update)
- Summary cards showing numbers
- No errors in console

**❌ If you see errors:**
- Check terminal for server errors
- Check browser console for API errors
- Make sure you're logged in
- Verify seed script completed successfully

## Quick Commands Reference

```bash
# Seed for your account
$env:SEED_USER_IDS="user_39FHsCsyf0shVkgpaV0dQ6Hnt1e"; npm run seed

# Start dev server
npm run dev

# Test generate endpoint (when server is running)
curl http://localhost:3000/api/notifications/generate
```
