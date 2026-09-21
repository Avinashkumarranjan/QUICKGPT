# QuickGPT

Full-stack AI chat + image generation app — JWT auth, MongoDB chat history, credits system, Stripe payments, aur community image gallery ke saath.

- Frontend: React + Vite + Tailwind
- Backend: Node.js (Express) + MongoDB (Mongoose)
- Text AI: OpenAI SDK pointed to Google Gemini (OpenAI-compatible endpoint)
- Image AI: ImageKit (generate + upload)

## Features (Highlights)

- Email/password auth (JWT)
- Multi-chat threads (create/list/delete)
- Text generation (cost: 1 credit/message)
- Image generation (cost: 2 credits/image)
- Credits purchase plans via Stripe Checkout
- Stripe webhook + server-side verification (credits top-up)
- Community gallery (published images)
- Light/Dark theme (frontend)

## Credits System

- New user default credits: `20` (see `server/models/User.js`)
- Text message cost: `-1` credit (see `server/controllers/messageController.js`)
- Image generation cost: `-2` credits
- Stripe planIds: `basic`, `pro`, `premium` (see `server/controllers/creditController.js`)

## AI Provider Note

Backend uses `openai` npm SDK but points it to Gemini's OpenAI-compatible endpoint (`server/configs/openai.js`). Text chat currently requests model `gemini-3-flash-preview` (see `server/controllers/messageController.js`).

## Project Structure

```
QUICKGPT/
  server.js                 # entry (imports backend)
  server/                   # Express API + DB + Stripe + AI configs
  client/                   # React + Vite UI
  start-backend.cmd         # Windows helper scripts
  start-frontend.cmd
  start-all.cmd
  DEV.md
```

## Prerequisites

- Node.js 18+
- MongoDB (Atlas/local) connection string
- Google Gemini API key (recommended)
- ImageKit account (public/private key + urlEndpoint)
- Stripe account (secret key + webhook secret)

## Environment Variables

### Backend: `server/.env`
Create `QUICKGPT/server/.env` (secrets commit mat karo). Backend ke liye required keys:

```bash
# App
PORT=3000
CLIENT_URL=http://localhost:5173

# Auth
JWT_SECRET=your_long_random_secret

# Database
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?retryWrites=true&w=majority

# AI (this project uses OpenAI SDK with Gemini baseURL)
GEMINI_API_KEY=your_gemini_key

# ImageKit
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/<your_id>

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Notes:
- Backend env `server/configs/env.js` se `server/.env` read karta hai.
- `CLIENT_URL` Stripe success/cancel redirects aur `/loading` fallback route ke liye use hota hai.

### Frontend: `client/.env`
Create `QUICKGPT/client/.env`:

```bash
VITE_API_URL=http://localhost:3000
```

## Local Setup (Windows)

From `QUICKGPT/`:

```bash
npm install
cd client
npm install
```

Start:
- Backend only: run `start-backend.cmd` (http://localhost:3000)
- Frontend only: run `start-frontend.cmd` (http://localhost:5173)
- Both: run `start-all.cmd`

## Local Setup (Any OS)

```bash
# backend (from QUICKGPT/)
npm install
npm run server

# frontend (new terminal, from QUICKGPT/)
npm --prefix client install
npm --prefix client run dev
```

## API Overview

Base URL (local): `http://localhost:3000`

Protected routes ke liye auth header:

```text
Authorization: Bearer <JWT_TOKEN>
```

### User
- POST `/api/user/register` -> `{ name, email, password }`
- POST `/api/user/login` -> `{ email, password }`
- GET `/api/user/data` (protected) -> current user (includes `credits`)
- GET `/api/user/published-images` -> community gallery feed

### Chat
- POST `/api/chat/create` (protected)
- GET `/api/chat/get` (protected)
- DELETE `/api/chat/delete/:id` (protected)

### Messages (AI)
- POST `/api/message/text` (protected) -> `{ chatId, prompt }` (cost: 1 credit)
- POST `/api/message/image` (protected) -> `{ chatId, prompt, isPublished? }` (cost: 2 credits)

### Credits / Stripe
- GET `/api/credit/plans` -> list of plans
- POST `/api/credit/purchase` (protected) -> `{ planId }` (returns Stripe Checkout URL)
- GET `/api/credit/verify?session_id=...` (protected) -> server verification for session
- POST `/api/stripe` -> Stripe webhook endpoint (requires raw body + signature)

## Stripe Flow (Credits kaise add hote hain)

1. Frontend calls POST `/api/credit/purchase` -> gets `session.url`
2. User completes Checkout
3. Credits are applied via:
   - Webhook: POST `/api/stripe` (recommended), or
   - Fallback verification: frontend hits GET `/api/credit/verify?session_id=...`

## Deployment Notes

- Backend has `server/vercel.json` for Vercel serverless deployment.
- Frontend has `client/vercel.json` rewrites for SPA routes.
- In production, set:
  - `CLIENT_URL` = your deployed frontend URL
  - `VITE_API_URL` = your deployed backend URL
  - Stripe webhook secret generated for your production endpoint
- For a Render Static Site using React Router, add the SPA rewrite: `/*` to `/index.html`.

## Troubleshooting

- "Unable to connect to the server": verify the frontend's `VITE_API_URL` points to the deployed backend.
- Mongo error "MONGODB_URI is not set": add `MONGODB_URI` in `server/.env`.
- AI errors: ensure `GEMINI_API_KEY` is set (see `server/configs/openai.js`).
- Image generation fails: ensure ImageKit env vars are correct.
- Stripe webhook signature failing: verify `STRIPE_WEBHOOK_SECRET` matches the endpoint used by Stripe.
