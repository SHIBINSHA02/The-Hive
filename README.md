<div align="center">
  <img src="public/noWhiteBG.svg" alt="The Hive Logo" width="200" height="200" />
  
  <p><strong>A Modern Next.js Full-Stack Application for Contract Lifecycle Management</strong></p>
</div>

---

## 📋 Project Overview

**The Hive** is a sophisticated, full-stack application built with Next.js, designed to streamline and automate the management of business contracts. From agreement requests to final execution and ongoing monitoring, The Hive provides an intuitive and efficient way to handle the entire contract lifecycle.

---

## ✨ Key Features

- **🚀 Lifecycle Management**: Comprehensive tracking of contract states from draft to completion.
- **🔔 Intelligent Notifications**: Automated alerts for expiring contracts, pending approvals, and upcoming or overdue payments.
- **🔐 Secure Authentication**: Robust user authentication and authorization powered by [Clerk](https://clerk.dev/) and [NextAuth.js](https://next-auth.js.org/).
- **🤖 AI-Powered Insights**: Leveraging [Google Generative AI](https://ai.google.dev/) to provide intelligent analysis and contract summaries.
- **📧 Seamless Email Integration**: Automated email notifications to keep all stakeholders informed.
- **🎨 Modern & Responsive UI**: A sleek, user-friendly interface built with [Tailwind CSS](https://tailwindcss.com/) and [Lucide React](https://lucide.dev/) icons.

---

## 🛠️ Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Next.js 16 (App Router), Tailwind CSS, Lucide React, React Icons |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | MongoDB, Mongoose ODM |
| **Auth** | Clerk, NextAuth.js |
| **AI** | Google Generative AI (@google/generative-ai) |
| **Services** | Nodemailer (Email), Svix (Webhooks) |
| **Dev Tools** | TypeScript, ESLint, TSX |

---

## 🚀 Getting Started

Follow these steps to get the project up and running locally.

### 1. Prerequisites

- **Node.js**: v18 or later
- **npm** or **yarn**
- **MongoDB**: A running instance (local or Atlas)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/SHIBINSHA02/The-Hive.git
cd The-Hive
npm install
```

### 3. Environment Configuration

Create a `.env` or `.env.local` file in the root directory and add the following variables:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication (Clerk & NextAuth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXTAUTH_SECRET=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# AI & Other Services
GEMINI_API_KEY=your_google_ai_key
CRON_SECRET=your_cron_job_secret

# Email (SMTP)
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 4. Database Seeding (Optional)

To populate your database with mock contracts for testing:

```bash
npm run seed
```

### 5. Running the Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📂 Project Structure

```text
The-Hive/
├── app/                # Next.js App Router (Pages & API Routes)
├── components/         # Reusable React components
├── db/                 # Database models and connection logic
├── lib/                # Shared utility functions and services
├── public/             # Static assets (images, icons)
├── types/              # TypeScript type definitions
└── ...
```

---

## 📖 Documentation

For more detailed information, please refer to the following documents:

- [Architecture & Routes Documentation](ARCHITECTURE.md)
- [Notification System Flow](NOTIFICATION_SYSTEM_FLOW.md)
- [Database Seeding Guide](SEEDING.md)
- [Notification Testing](TEST_NOTIFICATIONS.md)

---

## 📄 License

This project is private and intended for specific use. Please contact the repository owner for licensing information.
