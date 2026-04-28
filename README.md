# CineStream

A clean, cinematic streaming dashboard built with Next.js. CineStream is designed as a personal entertainment app for browsing movies and TV shows, managing profiles, saving a watchlist, and resuming playback from where you left off.

## Features

- Browse movies, TV shows, and trending releases
- Search titles with instant results
- Multi-profile support
- Continue Watching and My List sections
- Title detail pages with cast, seasons, and recommendations
- Responsive watch experience with a dedicated player view
- Authentication, watchlist, and profile APIs

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma
- MongoDB
- NextAuth
- Framer Motion

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root and add the values your setup needs. Common variables used by the app include:

```env
MONGODB_URI=
TMDB_API_KEY=
TMDB_BASE_URL=https://api.tmdb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
VIDKING_BASE_URL=https://www.vidking.net
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm run start` - run the production server
- `npm run lint` - run ESLint

## Project Structure

- `src/app` - routes, layouts, and pages
- `src/components` - shared UI and feature components
- `src/lib` - database, auth, TMDB, and utility helpers
- `src/store` - client-side state
- `prisma` - database schema and Prisma setup

## Notes

- This project is intended for personal use.
- Make sure you only use content and sources you have rights to access.
- The app relies on external services for metadata and playback.
