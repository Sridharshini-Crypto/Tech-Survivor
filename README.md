<<<<<<< HEAD
# TECH SURVIVOR

**TEAM ASYMMETRIC PRESENTS**

The ultimate competitive technical event platform. Register your team, compete in rounds, and prove your supremacy.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Auth**: Custom session-based authentication
- **Realtime**: Supabase Realtime
- **State**: Zustand + TanStack React Query
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Notifications**: Sonner Toast
- **Icons**: Lucide React

## Features

- Premium dark-themed landing page with particle effects
- Admin panel with complete team/round/question management
- Team registration with approval workflow
- Real-time competition with timed questions
- Automatic scoring engine (MCQ, text, numeric)
- Manual review system for subjective answers
- Live leaderboard with animated rankings
- Security monitoring (fullscreen, tab switch, multi-tab detection)
- Announcement system
- Event control center
- Analytics dashboard
- Audit logging
- Winner ceremony with confetti
- PWA support
- Responsive mobile-first design

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Supabase account

### 1. Clone & Install

```bash
git clone <repo-url>
cd tech-survivor
pnpm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `sql/functions.sql` first
3. Then run `sql/schema.sql` to create all tables, indexes, triggers, and seed data
4. Enable Realtime for the tables (already configured in the schema)

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin@123`

## Deployment

### Vercel

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

## Project Structure

```
app/                    # Next.js App Router pages
  (auth)/               # Auth pages (login, register)
  (admin)/admin/        # Admin panel pages
  (team)/team/          # Team portal pages
  api/                  # API route handlers
  leaderboard/          # Public leaderboard
  winners/              # Winner ceremony page
components/
  ui/                   # Reusable UI components
  home/                 # Landing page sections
  admin/                # Admin-specific components
  team/                 # Team-specific components
  shared/               # Shared components (sidebar, etc.)
  animations/           # Animation components
hooks/                  # Custom React hooks
lib/                    # Utility libraries (Supabase, auth, utils)
types/                  # TypeScript type definitions
constants/              # App constants
providers/              # React providers
sql/                    # Database schema and functions
public/                 # Static assets
```

## Database Schema

The complete schema is in `sql/schema.sql`. Key tables:

- `admins` - Admin user accounts
- `teams` - Registered teams
- `rounds` - Competition rounds
- `questions` - Questions per round
- `submissions` - Team answer submissions
- `violations` - Security violations
- `announcements` - System announcements
- `audit_log` - Activity audit trail
- `event_settings` - Configurable event settings
- `team_presence` - Online status tracking
- `login_history` - Login activity

## License

Private - Team Asymmetric
=======
# Tech-Survivor
>>>>>>> a720eb973fae2fcbeef745729a54bf7d17a52559
