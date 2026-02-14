<!-- README.md -->
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Notification System

The application includes a dynamic notification system that generates notifications based on contract data.

### Setup

1. **Seed the database** with mock contracts:
   ```bash
   npm run seed
   # or
   ts-node db/seed.ts
   ```

2. **Generate initial notifications**:
   ```bash
   # Manually trigger notification generation
   curl -X GET http://localhost:3000/api/notifications/generate
   ```

### Daily Cron Job

The system includes a daily cron job that automatically generates notifications for all users. 

**For Vercel deployment:**
- The `vercel.json` file is configured to run the cron job daily at midnight (0 0 * * *)
- Ensure `CRON_SECRET` is set in your environment variables for security

**For other platforms:**
- Set up a cron job to call `POST /api/notifications/generate` daily
- Use a service like EasyCron, Cron-job.org, or your server's cron scheduler
- Example cron schedule: `0 0 * * *` (daily at midnight)

### Notification Types

The system generates the following notification types:

1. **Contract Agreement Requests** - For pending contracts requiring approval
2. **Contract Expiring Soon** - For active contracts approaching their deadline (within 30 days)
3. **Payment Due Soon** - For upcoming payment milestones (within 30 days)
4. **Payment Overdue** - For missed payment deadlines
5. **Contract Completed** - For recently completed contracts

### API Endpoints

- `GET /api/notifications` - Fetch all notifications for the current user
- `PATCH /api/notifications` - Mark a notification as read
- `POST /api/notifications/mark-all-read` - Mark all notifications as read
- `GET /api/notifications/generate` - Manually trigger notification generation (for testing)
- `POST /api/notifications/generate` - Generate notifications (for cron jobs)
