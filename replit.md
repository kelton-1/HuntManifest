# Hunt Manifest

## Overview
A Next.js application with Firebase integration. This appears to be a task/manifest management app with a modern blue gradient UI.

## Tech Stack
- Next.js 16.0.7 with Turbopack
- React 19.2.0
- TypeScript
- Tailwind CSS
- Firebase (Firestore)
- Framer Motion for animations

## Development
- Run `npm run dev` to start the development server
- The app runs on port 5000 (0.0.0.0:5000)

## Deployment
- Configured for static export (`output: 'export'`)
- Build output directory: `out/`
- Deploy with: `npm run build`

## Project Structure
- `/app` - Next.js app directory
- `/lib` - Shared utilities and configurations
- `/public` - Static assets
- `/Tasks` - Task-related components or data

## Firebase Collections
- `users/{userId}/profile` - User profile data
- `users/{userId}/inventory` - User gear inventory
- `users/{userId}/huntLogs` - Hunt log entries
- `users/{userId}/huntPlans` - Planned hunts
- `feedback` - User feedback submissions (authenticated users only)

## Environment Variables
- `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` - Google Places API key for location autocomplete

## Recent Changes
- Added Google Places location autocomplete for hunt plans and log entries
- Location selection auto-fetches weather data for that location
- Switched AI model to gemini-2.5-flash-lite for higher free tier limits (1000 requests/day)
- Optimized AI prompts to use 60-70% fewer tokens
- Added feedback/suggestions feature to profile page
- Added Firebase AI Logic (Gemini) integration with three AI features:
  1. AI Quick Tip on home page - weather-based hunting advice
  2. AI Hunting Tips on conditions page - detailed tips based on weather
  3. AI Hunt Analysis on hunt log details - analysis of completed hunts
