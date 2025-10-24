# Email Classifier

An AI-powered email classification system that automatically categorizes your Gmail emails using advanced machine learning. Built with Next.js, TypeScript, and the Vercel AI SDK.

## Features

- **AI-Powered Classification** - Uses GPT-4o-mini to intelligently categorize emails
- **Multiple Classification Modes** - Basic, batch, and advanced classification with confidence scores
- **Google OAuth Integration** - Secure authentication with Gmail API access
- **Real-time Statistics** - Dashboard with email distribution charts and metrics
- **Priority Detection** - Automatically identifies high-priority emails
- **Action Detection** - Flags emails requiring immediate action
- **Confidence Scoring** - Shows classification confidence for each email
- **Local Storage** - Classifications stored locally for privacy
- **Dark Mode Support** - Full dark mode support with Tailwind CSS
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## Categories

The system classifies emails into six categories:

- **Important** - Urgent emails from colleagues, managers, or containing critical information
- **Promotions** - Marketing emails, sales offers, discounts, and newsletters
- **Social** - Social media notifications, friend requests, and comments
- **Marketing** - Company announcements, product updates, and marketing campaigns
- **Spam** - Unsolicited emails, phishing attempts, and suspicious content
- **General** - Regular correspondence, receipts, and confirmations

## Tech Stack

- **Frontend** - Next.js 16, React 19, TypeScript
- **Styling** - Tailwind CSS v4, shadcn/ui components
- **AI** - Vercel AI SDK with OpenAI GPT-4o-mini
- **Authentication** - Google OAuth 2.0
- **Email API** - Gmail API v1
- **Charts** - Recharts for data visualization
- **Icons** - Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Google Cloud Project with Gmail API enabled
- OpenAI API key

## Usage

### Authentication

1. Click "Sign in with Google" on the home page
2. Authorize the app to access your Gmail
3. You'll be redirected to the dashboard

### Classifying Emails

1. Click "Refresh Emails" to fetch your latest emails
2. Enter your OpenAI API key (stored locally only)
3. Click "Classify Emails" to start classification
4. View results with confidence scores and reasoning

### Filtering and Searching

- Use category buttons to filter emails by type
- Use the search bar to find specific emails
- View email distribution chart in the sidebar
- Click the star icon to mark important emails
