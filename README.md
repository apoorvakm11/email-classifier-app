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

### Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`env
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI (optional - can be provided in UI)
OPENAI_API_KEY=your_openai_api_key
\`\`\`

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd email-classifier
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
bun install
\`\`\`

3. Set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable Gmail API
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback`
   - Copy Client ID and Client Secret to `.env.local`

4. Run the development server:
\`\`\`bash
npm run dev
# or
bun dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

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

## API Endpoints

### POST `/api/classify-emails`

Classifies individual emails with detailed reasoning.

**Request:**
\`\`\`json
{
  "emails": [
    {
      "id": "email_id",
      "from": "sender@example.com",
      "subject": "Email Subject",
      "snippet": "Email preview text"
    }
  ]
}
\`\`\`

**Response:**
\`\`\`json
{
  "classifications": [
    {
      "id": "email_id",
      "from": "sender@example.com",
      "subject": "Email Subject",
      "snippet": "Email preview text",
      "category": "Important",
      "confidence": 0.95,
      "reasoning": "Email from manager with urgent request"
    }
  ]
}
\`\`\`

### POST `/api/classify-batch`

Optimized batch classification for multiple emails.

**Request:**
\`\`\`json
{
  "emails": [
    {
      "id": "email_id_1",
      "from": "sender1@example.com",
      "subject": "Subject 1"
    },
    {
      "id": "email_id_2",
      "from": "sender2@example.com",
      "subject": "Subject 2"
    }
  ]
}
\`\`\`

**Response:**
\`\`\`json
{
  "classifications": [
    {
      "id": "email_id_1",
      "category": "Important",
      "confidence": 0.92
    },
    {
      "id": "email_id_2",
      "category": "Promotions",
      "confidence": 0.88
    }
  ]
}
\`\`\`

### POST `/api/classify-advanced`

Advanced classification with priority, tags, and action detection.

**Request:**
\`\`\`json
{
  "emails": [
    {
      "id": "email_id",
      "from": "sender@example.com",
      "subject": "Email Subject",
      "snippet": "Email preview",
      "body": "Full email body (optional)"
    }
  ]
}
\`\`\`

**Response:**
\`\`\`json
{
  "classifications": [
    {
      "id": "email_id",
      "category": "Important",
      "confidence": 0.95,
      "priority": "high",
      "tags": ["urgent", "meeting", "followup"],
      "actionRequired": true,
      "reasoning": "Urgent meeting request from manager"
    }
  ]
}
\`\`\`

### GET `/api/auth/google`

Initiates Google OAuth flow.

### GET `/api/auth/callback`

Handles OAuth callback and token exchange.

## Project Structure

\`\`\`
email-classifier/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── google.ts          # Google OAuth initiation
│   │   │   └── callback.ts        # OAuth callback handler
│   │   ├── classify-emails.ts     # Basic classification endpoint
│   │   ├── classify-batch.ts      # Batch classification endpoint
│   │   └── classify-advanced.ts   # Advanced classification endpoint
│   ├── dashboard/
│   │   ├── page.tsx               # Main dashboard page
│   │   └── loading.tsx            # Loading skeleton
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home/login page
│   └── globals.css                # Global styles
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── email-stats.tsx            # Statistics cards
│   ├── email-list-item.tsx        # Email list item component
│   ├── classification-progress.tsx # Progress indicator
│   └── category-distribution.tsx  # Distribution chart
├── hooks/                         # Custom React hooks
├── lib/                           # Utility functions
├── public/                        # Static assets
└── README.md                      # This file
\`\`\`

## Data Privacy

- **Local Storage Only** - All email classifications are stored in your browser's local storage
- **No Server Storage** - Classifications are never sent to or stored on our servers
- **API Keys** - Your OpenAI API key is stored locally and only used for classification
- **Gmail Access** - We only read emails; we never modify or delete them
- **No Tracking** - No analytics or tracking of your email data

## Performance Tips

1. **Batch Classification** - Use the batch endpoint for better performance with multiple emails
2. **Limit Results** - Fetch fewer emails at a time for faster processing
3. **Cache Results** - Classifications are cached in local storage automatically
4. **API Rate Limits** - Be mindful of OpenAI API rate limits

## Troubleshooting

### "Failed to fetch emails"
- Check your internet connection
- Verify Google OAuth tokens are valid
- Try refreshing the page

### "Classification failed"
- Verify your OpenAI API key is correct
- Check OpenAI API rate limits
- Ensure you have sufficient API credits

### "Invalid emails"
- Make sure emails have valid `from` and `subject` fields
- Check email format in the request

### Dark mode not working
- Clear browser cache
- Check if dark mode is enabled in system settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on GitHub or contact support.

## Roadmap

- [ ] Email body analysis for better classification
- [ ] Custom category creation
- [ ] Email labeling and organization
- [ ] Scheduled classification
- [ ] Export classification results
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Browser extension

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- AI powered by [OpenAI](https://openai.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide React](https://lucide.dev)
