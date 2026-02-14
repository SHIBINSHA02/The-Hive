# Database Seeding Guide

This guide explains how to seed your database with realistic contract data and automatically generate notifications.

## Overview

The seed script creates:
- **Users** (or uses existing users)
- **Client & Contractor Profiles** for each user
- **Contracts** with various statuses (pending, active, completed)
- **Finance Records** with payment milestones
- **Conversations** for each contract
- **Notifications** automatically generated from contracts

## Basic Usage

### Seed for All Existing Users

If you have users in your database (from Clerk authentication), simply run:

```bash
npm run seed
```

The script will:
- Use all existing users in the database
- Create contracts distributed across all users
- Generate notifications for each user based on their contracts

### Seed for Specific Users

To seed contracts for specific Clerk user IDs, set the `SEED_USER_IDS` environment variable:

```bash
# Windows PowerShell - Single User
$env:SEED_USER_IDS="user_39FHsCsyf0shVkgpaV0dQ6Hnt1e"; npm run seed

# Windows PowerShell - Multiple Users (comma-separated)
$env:SEED_USER_IDS="user_39FHsCsyf0shVkgpaV0dQ6Hnt1e,user_37kiUIRDJeKeynbdqqHtSnNqiZ7"; npm run seed

# Linux/Mac - Multiple Users
SEED_USER_IDS="user_39FHsCsyf0shVkgpaV0dQ6Hnt1e,user_37kiUIRDJeKeynbdqqHtSnNqiZ7" npm run seed
```

Or create a `.env.local` file:
```
SEED_USER_IDS=user_39FHsCsyf0shVkgpaV0dQ6Hnt1e,user_37kiUIRDJeKeynbdqqHtSnNqiZ7
```

## Contract Distribution

The seed script creates **5 contracts per user** (or more if there are fewer users). Each contract is assigned scenarios to trigger different notification types:

### Contract Types Created:

1. **Pending Contracts (0-4 per user)**
   - Some urgent (2 days until deadline)
   - Some normal (10 days until deadline)
   - **Triggers:** Contract Agreement Request notifications

2. **Active Contracts Expiring Soon (5-9 per user)**
   - Expiring in 5, 10, 15, 20, or 25 days
   - **Triggers:** Contract Expiring Soon alerts

3. **Active Contracts (10-12 per user)**
   - Normal deadlines (60+ days)
   - **Triggers:** Regular payment notifications

4. **Completed Contracts (13-14 per user)**
   - Recently completed (1-3 days ago)
   - **Triggers:** Contract Completed update notifications

## Payment Milestones

Each contract has 3 payment milestones:
- **Phase 1:** Already paid (past due date)
- **Phase 2:** Due soon (1-7 days) - triggers Payment Due Soon notifications
- **Phase 3:** Due later or overdue - triggers Payment Overdue alerts

## Notification Generation

After creating contracts, the seed script automatically:
1. Scans all contracts for each user
2. Generates notifications based on:
   - Contract status (pending → request notifications)
   - Expiration dates (active contracts expiring soon → alerts)
   - Payment milestones (due dates → payment notifications)
   - Overdue payments → urgent alerts
   - Completed contracts → update notifications

## Example: Seeding for Your Account(s)

### Single Account:
To seed contracts specifically for your account (`user_39FHsCsyf0shVkgpaV0dQ6Hnt1e`):

```bash
# Windows PowerShell
$env:SEED_USER_IDS="user_39FHsCsyf0shVkgpaV0dQ6Hnt1e"; npm run seed
```

### Multiple Accounts:
To seed for both accounts:

```bash
# Windows PowerShell
$env:SEED_USER_IDS="user_39FHsCsyf0shVkgpaV0dQ6Hnt1e,user_37kiUIRDJeKeynbdqqHtSnNqiZ7"; npm run seed

# Or add to .env.local
echo "SEED_USER_IDS=user_39FHsCsyf0shVkgpaV0dQ6Hnt1e,user_37kiUIRDJeKeynbdqqHtSnNqiZ7" >> .env.local
npm run seed
```

**User Accounts:**
- `user_39FHsCsyf0shVkgpaV0dQ6Hnt1e` (Adithya SD - adithyasd@gmail.com)
- `user_37kiUIRDJeKeynbdqqHtSnNqiZ7` (Niranjan - neerenjen04@gmail.com)

After seeding, you'll see:
- 5+ contracts assigned to your account
- Multiple notifications generated automatically
- Summary cards showing pending requests, alerts, payments, etc.

## Testing Notifications

1. **Run the seed script:**
   ```bash
   npm run seed
   ```

2. **Start your dev server:**
   ```bash
   npm run dev
   ```

3. **Log in and visit:**
   ```
   http://localhost:3000/dashboard/notifications
   ```

You should see notifications like:
- Contract Agreement Requests
- Payment Due Soon
- Contract Expiring Soon
- Payment Overdue
- Contract Completed

## Daily Notification Generation

The system includes a daily cron job that automatically generates notifications for all users. To manually trigger it:

```bash
# Via API (when server is running)
curl http://localhost:3000/api/notifications/generate

# Or visit in browser
http://localhost:3000/api/notifications/generate
```

## Troubleshooting

### No Notifications Appearing

1. **Check if contracts exist:**
   - Verify contracts were created in the database
   - Check that contracts are assigned to your user

2. **Check user profiles:**
   - Ensure ClientProfile and ContractProfile exist for your user
   - The notification service requires these profiles

3. **Manually trigger notification generation:**
   ```bash
   curl -X POST http://localhost:3000/api/notifications/generate
   ```

### Contracts Not Assigned to Your User

If you're logged in but don't see contracts:
1. Make sure your Clerk user ID exists in the database
2. Run the seed script with your specific Clerk ID (see above)
3. The script will create profiles and contracts for your account

## Notes

- The seed script **preserves existing users** - it won't delete your real user accounts
- Contracts are distributed evenly across all users
- Each user gets a mix of contract statuses to trigger different notification types
- Notifications are generated automatically after contracts are created
