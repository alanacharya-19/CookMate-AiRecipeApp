# CookMate

Production-style **AI recipe app** built with **Expo + Expo Router**, using:

- **Firebase Auth**: Email/Password + Google Sign-in
- **Firestore (lite)**: Save generated recipes + user cookbook
- **OpenRouter**: AI recipe suggestions + full recipe generation
- **Cloudinary (optional)**: image hosting hooks (env prepared)

The app includes a landing page, auth flow, tab navigation (Home / Explore / Cookbook / Profile), category browsing, AI recipe generation, and a detailed `FoodRecipes` screen UI with save/unsave.

---

## Screens
<p float="left">
  <img src="../ss/landing.jpeg" width="150" />
  <img src="../ss/login.jpeg" width="150" />
  <img src="../ss/home1.jpeg" width="150" />
  <img src="../ss/explore.jpeg" width="150" />
  <img src="../ss/recipe.jpeg" width="150" />
  <img src="../ss/cookbook.jpeg" width="150" />
  <img src="../ss/profile.jpeg" width="150" />
</p>

<p float="left">
  <b>Landing Page</b>&nbsp;&nbsp;&nbsp;&nbsp;
  <b>Login Page</b>&nbsp;&nbsp;&nbsp;&nbsp;
  <b>Home Page</b>&nbsp;&nbsp;&nbsp;&nbsp;
  <b>Explore Page</b>&nbsp;&nbsp;&nbsp;&nbsp;
  <b>Recipe Page</b>&nbsp;&nbsp;&nbsp;&nbsp;
  <b>CookBook Page</b>&nbsp;&nbsp;&nbsp;&nbsp;
  <b>Profile Page</b>
</p>
---

## Tech stack

- **Expo / React Native**
- **expo-router** (file-based navigation)
- **Firebase v11** + `firebase/firestore/lite` (Expo-friendly)
- **@react-native-async-storage/async-storage** (used for recently visited recipes)

---

## Getting started (Windows)

### 1) Install dependencies

```bash
npm install
```

### 2) Create `.env`

Create a file named `.env` in the project root and set these keys:

```bash
# OpenRouter (AI)
EXPO_PUBLIC_OPENROUTER_API=YOUR_OPENROUTER_KEY
EXPO_PUBLIC_OPENROUTER_MODEL=openai/gpt-5.2

# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID

# Google Sign-In (Expo Auth Session)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_OAUTH_CLIENT_ID

# Cloudinary (optional)
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
EXPO_PUBLIC_CLOUDINARY_API_KEY=YOUR_API_KEY
EXPO_PUBLIC_CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

Notes:
- **Never commit** real secrets. Rotate keys if they were shared publicly.
- Firebase Auth persistence in React Native can warn if AsyncStorage persistence isn’t configured. This project currently uses the Expo-compatible setup.

### 3) Run the app

```bash
npx expo start
```

If Metro port is busy:

```bash
npx expo start --port 8082
```

---

## Data model (Firestore)

- **`recipes`**: generated recipe documents
  - `uid`, `title`, `description?`, `category`, `vegType`, `ingredients[]`, `instructions[]`, `tips[]`, `caloriesKcal?`, `timeMinutes?`, `createdAt`
- **`cookbook`**: user saved recipes
  - `uid`, `recipeId`, `createdAt`

---

## Project structure

- `app/` – screens + navigation (Expo Router)
- `components/` – UI components
- `services/` – Firebase, AI, cookbook, recipe services
- `assets/images/` – icons and artwork

