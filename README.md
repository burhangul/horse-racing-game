# Horse Racing Game

Production-quality Vue 3 horse racing dashboard built as a frontend project.

## Project Overview

- 20 unique horses are generated with unique names/colors and condition scores.
- A 6-round program is generated (1200m to 2200m), with 10 random horses per round.
- Races run sequentially round-by-round with animated lane progression.
- Results are appended and persisted in order as each round is completed.

## Tech Stack

- Vue 3 + Composition API
- TypeScript
- Vuex 4
- Vue Router 4
- Vuetify 3
- Vitest (unit)
- Playwright (E2E)
- ESLint + Prettier

## Setup

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

## Architecture Decisions

- Business/domain logic is isolated in composables:
  - `useHorseGenerator` for horse and schedule generation
  - `useRaceEngine` for pure race simulation
- Vuex modules separate concerns:
  - `horses` module for horse initialization
  - `race` module for schedule, lifecycle, current round, and results
- UI components are split between:
  - Reusable primitives (`AppButton`, `AppCard`)
  - Race features (`HorseList`, `RaceSchedule`, `RaceTrack`, `RaceResults`)
- Constants centralize all key numeric rules to avoid magic numbers.

## Quality Commands

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:e2e
```

## Build

```bash
npm run build
```
