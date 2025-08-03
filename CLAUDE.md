# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This project uses pnpm as the package manager:

- `pnpm dev` - Start development server (Vite)
- `pnpm build` - Build for production (TypeScript compilation + Vite build)
- `pnpm preview` - Preview production build

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