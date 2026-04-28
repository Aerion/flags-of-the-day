# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This project uses pnpm as the package manager:

- `pnpm dev` - Start development server (Vite)
- `pnpm build` - Build for production (TypeScript compilation + Vite build)
- `pnpm preview` - Preview production build
- Use pnpm build to check that everything is building
- Don't run pnpm dev, it's already running at port 5174
- `pnpm dev --port <port> --host` - Start dev server accessible from remote machines

## Architecture Overview

This is a React-based "Flag of the Day" game built with TypeScript and Vite. The application presents users with 5 daily flag guessing challenges.

### Core Structure

- **Game State Management**: `useGameLogic` hook handles game progression, scoring, and daily persistence using localStorage
- **Daily Flag Selection**: Uses seeded randomization based on current date to ensure all players get the same 5 flags each day
- **Autocomplete System**: `useAutocomplete` hook with Fuse.js provides fuzzy search for country names
- **Two Main Views**: 
  - `GameView` - Active gameplay with flag display and input
  - `ResultsView` - Final scores and review of answers

### Key Files

- `src/FlagGame.tsx` - Main component orchestrating game flow between playing and results phases
- `src/hooks/useGameLogic.ts` - Core game logic, daily flag generation, and localStorage persistence
- `src/hooks/useAutocomplete.ts` - Fuzzy search functionality for country input
- `src/types.ts` - Contains complete FLAGS array with all world countries and flag emojis
- `src/components/GameView.tsx` - Game interface with flag display and autocomplete input
- `src/components/ResultsView.tsx` - End-game results display

### Technical Details

- Uses deterministic daily flag selection via date-based seeding
- Implements answer normalization (removes "the" prefix, normalizes whitespace)
- Keyboard navigation support for autocomplete (arrow keys, enter, escape)
- LocalStorage persistence prevents multiple plays per day
- TypeScript strict mode enabled with comprehensive linting rules

## Maintenance Tasks

### Excluding a territory that shares its flag with another country

1. Add its ISO 3166-1 alpha-2 code (uppercase) to `EXCLUDED_CODES` in `src/types.ts`.
2. Check if it was drawn for today (or any affected day) by simulating the RNG — excluding the code changes the FLAGS array length and shifts all draws. If it was drawn, add a `HARDCODED_DAYS` entry replacing it with the intended country (see *Fixing a wrong flag* below).

### Fixing a wrong flag for a specific day

If a bad flag was already drawn for today and needs replacing:

1. Compute the day number: days between `2025-08-01` and today (inclusive of today) + 1.
   - Formula: `Math.floor((Date.UTC(Y,M-1,D) - Date.UTC(2025,7,1)) / 86400000) + 1`
2. Add an entry to `HARDCODED_DAYS` in `src/hooks/useGameLogic.ts`:
   ```ts
   249: ['ls', 'br', 'rs', 'nl', 'jp'], // example: day 249 = 2026-04-06
   ```
   Use lowercase ISO codes in the desired order. The existing shuffled result is fully replaced.
3. Run `pnpm build` to verify.