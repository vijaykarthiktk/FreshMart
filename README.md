# FreshMart Full-Stack App

## Overview
- **Frontend**: React Router + Vite
- **Backend**: Node.js + Express + TypeScript
- **Auth**: Firebase Authentication (Email/Password + Google)
- **Database**: MongoDB Atlas (Products, Feedback, Price History)
- **Realtime**: Firestore (notifications, product mirror)

## Features
- **User Auth**: Login/Register via Firebase; session token sent as Bearer to API.
- **Products**: CRUD (admin), fields: `name`, `description`, `price`, `inventory`, `seasonalTag`, `avgRating`.
- **Feedback**: Logged-in users submit rating/comment; average rating denormalized on product.
- **Dynamic Pricing**: Admin manual updates; optional `auto-adjust` endpoint by rating/inventory.
- **Realtime Notifications**: Admin broadcasts to Firestore; clients show instantly.
- **Admin Dashboard**: Overview metrics, ratings, price trends chart, broadcast, auto-adjust.

## Setup
1) Clone and install
```bash
npm install
cd server && npm install && cd ..
```

2) Configure environment
- Copy `.env.example` to `.env` in project root and fill VITE_* Firebase web config.
- Copy `server/.env.example` to `server/.env` and set:
  - `MONGODB_URI` (MongoDB Atlas connection string)
  - `ADMIN_EMAILS` (comma-separated admin emails)
  - `FIREBASE_SERVICE_ACCOUNT_JSON` (JSON string of a Firebase service account)

3) Run locally
```bash
# terminal 1 (API)
cd server
npm run dev
# API at http://localhost:4000

# terminal 2 (Web)
npm run dev
# Web at http://localhost:5173
```

4) Login flow
- Open `/products` -> not logged in -> login panel appears.
- Login via email/password or Google.
- After login, browse products, submit feedback, see notifications.

5) Admin
- Ensure your Firebase user email is in `ADMIN_EMAILS`.
- Visit `/admin` for dashboard, broadcast notifications, price auto-adjust, and price trends.

## API Endpoints
- `GET /api/health`
- `GET /api/products` – list products
- `GET /api/products/:id` – get product
- `POST /api/products` – create (admin)
- `PUT /api/products/:id` – update (admin) – records PriceHistory and mirrors to Firestore
- `DELETE /api/products/:id` – delete (admin)
- `POST /api/products/:id/auto-adjust` – optional auto price adjust (admin)
- `POST /api/feedback/:productId` – add feedback (auth)
- `GET /api/feedback/:productId` – list recent feedback for a product
- `POST /api/notifications/broadcast` – send realtime notification (admin)
- `GET /api/admin/analytics/overview` – counts
- `GET /api/admin/analytics/ratings` – avg rating per product
- `GET /api/admin/analytics/price-trends/:productId` – price history timeline
- `GET /api/me` – auth state (uid/email/isAdmin)

## MongoDB Schemas
- Product: `{ name, description, price, inventory, seasonalTag?, avgRating, createdAt, updatedAt }`
- Feedback: `{ productId(ObjectId), userId(string), rating(1-5), comment?, createdAt }`
- PriceHistory: `{ productId(ObjectId), oldPrice, newPrice, changedBy, reason?, createdAt }`

## Realtime Updates
- On product create/update/delete the API mirrors data to Firestore `products/{id}`.
- Admin broadcasts notifications to Firestore `notifications`.
- Frontend listens to `notifications` and can be extended to listen to `products` for live price/inventory.

## Deployment (Firebase Hosting demo)
1) Create Firebase project and enable:
   - Authentication (Email/Password + Google)
   - Firestore (in Native mode)
2) Add web app; copy config to `.env` (VITE_* keys).
3) Service account JSON -> set in `server/.env` `FIREBASE_SERVICE_ACCOUNT_JSON`.
4) Deploy options:
   - Simple: host frontend on Firebase Hosting; host backend separately (Render/Fly/Railway). Set `VITE_API_BASE` to the backend URL.
   - Advanced: Use Cloud Run for backend; add rewrite/proxy from Hosting to API.

## Example Workflow
1) User signs up/login via Firebase.
2) User browses products `/products`, submits feedback, and sees notifications instantly.
3) Admin opens `/admin`, views analytics and price history, adjusts a price or triggers auto-adjust.
4) All users receive a real-time notification of the price change.
5) Dashboard charts update accordingly.