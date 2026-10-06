# Workout App Frontend

React Native (Expo) app for logging workouts and tracking calories. Talks to the
[workout-app-backend](https://github.com/balloon083/workout-app-backend) REST API.

## Features
- Live workout logging with a pausable timer, exercises, and per-set weight / reps
- Reusable workout programs
- Meal logging with macros, USDA food search, and serving-size scaling
- Calendar view of past activity
- Meal photo capture (the food recognition model is in progress; `src/services/mealAnalysis.ts`
  is the single place it plugs in)

## Project structure
```
src/
  app/                 screens (expo-router file-based routes)
  api/                 axios client, one module per resource, shared types
  components/
    ui/                generic building blocks (Button)
    workout/           workout and program components
    meal/              meal form, totals, entries, food search
    profile/           calendar
  hooks/               state logic pulled out of screens
                       (useWorkoutDraft, useStopwatch, useMealForm)
  services/            non-API logic (meal photo analysis)
  context/             auth state
  constants/           theme colors, shared styles, exercise list
  utils/               time formatting, error messages
```

Screens stay small: they load data, hold top-level state, and compose components.
Form state and edit logic live in hooks so they can be reasoned about (and tested)
without the UI.

## Setup
```bash
git clone https://github.com/balloon083/workout-app-frontend
cd workout-app-frontend
npm install
cp .env.example .env   # point EXPO_PUBLIC_API_URL at your backend
npm start
```

## Stack
React Native, Expo Router, TypeScript
