# Campus Lost & Found Portal (MERN)

Students can post items they've lost or found, browse all posts, and search by category or keyword.

- **Report:** [`report/Lost_and_Found_Portal_Report.pdf`](report/Lost_and_Found_Portal_Report.pdf) (source: `report/REPORT.md`)
- **Backend:** Node.js + Express + Mongoose (`backend/`)
- **Frontend:** React + Vite (`frontend/`)

## Run locally

Requires Node.js 18+ and MongoDB (local or Atlas).

```bash
# Backend  → http://localhost:5050
cd backend
cp .env.example .env      # edit MONGO_URI if using Atlas
npm install
npm run seed              # optional: sample posts
npm start

# Frontend → http://localhost:5173  (new terminal)
cd frontend
npm install
npm run dev
```

> Port 5050 is used instead of 5000 because macOS reserves 5000 for AirPlay Receiver.

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/posts?category=&type=&status=&q=&page=&limit=` | List / filter / search posts |
| GET | `/api/posts/categories` | Categories with open-post counts |
| GET | `/api/posts/:id` | Single post |
| POST | `/api/posts` | Create post |
| PUT | `/api/posts/:id` | Update post / mark resolved |
| DELETE | `/api/posts/:id` | Delete post |
