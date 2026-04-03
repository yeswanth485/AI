# PackAI — Deployment Guide

## Project Structure

```
D:\AI PACK/
├── main.py                      # FastAPI backend entry point
├── routers.py                   # All API endpoints (auth, orders, inventory, analytics)
├── models.py                    # SQLAlchemy database models
├── schemas.py                   # Pydantic request/response schemas
├── database.py                  # DB connection (SQLite local, PostgreSQL production)
├── decision_service.py          # Core optimization engine
├── cost_service.py              # Shipping cost calculations
├── packing_service.py           # 3D box packing algorithm
├── validation_service.py        # Cost validation & logging
├── seed.py                      # Database seeder (products, boxes, shipping rates)
├── requirements.txt             # Python dependencies
├── Procfile                     # Render start command
├── .gitignore                   # Git ignore rules
└── frontend/                    # Next.js 14 frontend
    ├── app/                     # All pages
    ├── components/              # UI, tables, charts, forms
    ├── services/                # API client layer
    ├── context/                 # Auth + App state
    ├── hooks/                   # Custom React hooks
    ├── types/                   # TypeScript interfaces
    └── lib/                     # Utility functions
```

---

## Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login → returns JWT token |
| GET | `/orders` | List all orders |
| GET | `/orders/{id}` | Get order detail with items |
| POST | `/orders` | Create new order |
| POST | `/optimize-packaging/{id}` | Run optimization on order |
| GET | `/inventory` | List all box types |
| POST | `/inventory` | Add new box type |
| PATCH | `/inventory/{id}` | Update box quantity |
| GET | `/analytics` | Get analytics summary |

---

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm

### Backend (Terminal 1)
```powershell
# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "DATABASE_URL=sqlite:///./packai.db" > .env
echo "SECRET_KEY=your-secret-key-here" >> .env

# Seed database with sample data
python seed.py

# Start backend
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### Frontend (Terminal 2)
```powershell
cd frontend

# Install dependencies (if not already done)
npm install

# Create .env.local (if not exists)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:3000`

### Default Login Credentials
- Email: `admin@packai.com`
- Password: `admin123`

---

## Deploy to Render (Step-by-Step)

### Step 1: Push to GitHub

```powershell
# In D:\AI PACK directory
git init
git add .
git commit -m "Initial commit: PackAI full stack"

# Add your GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Step 2: Create PostgreSQL Database on Render

1. Go to https://render.com → Dashboard → New → PostgreSQL
2. Name: `packai-db`
3. Region: Choose closest to you
4. Click **Create Database**
5. Copy the **Internal Database URL** (looks like: `postgresql://user:pass@host:5432/dbname`)

### Step 3: Deploy Backend on Render

1. Dashboard → New → **Web Service**
2. Connect your GitHub repository
3. Configure:

| Setting | Value |
|---|---|
| **Name** | `packai-api` |
| **Region** | Same as database |
| **Branch** | `main` |
| **Root Directory** | Leave blank (root) |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt && python seed.py` |
| **Start Command** | `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT` |
| **Instance Type** | Free |

4. Add Environment Variables:

| Key | Value |
|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/dbname` (from Step 2) |
| `SECRET_KEY` | Generate a random string (e.g., `openssl rand -hex 32`) |

5. Click **Create Web Service**
6. Wait for deployment (3-5 minutes)
7. Copy the backend URL (e.g., `https://packai-api.onrender.com`)

### Step 4: Deploy Frontend on Render

1. Dashboard → New → **Static Site**
2. Connect your GitHub repository
3. Configure:

| Setting | Value |
|---|---|
| **Name** | `packai-frontend` |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-URL.onrender.com npm run build` |
| **Publish Directory** | `.next/standalone` |

**IMPORTANT**: Replace `https://YOUR-BACKEND-URL.onrender.com` with your actual backend URL from Step 3.

4. Click **Create Static Site**

### Alternative: Deploy Frontend on Vercel (Recommended for Next.js)

1. Go to https://vercel.com → New Project
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add Environment Variable:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-BACKEND-URL.onrender.com` |

5. Deploy

---

## Environment Variables Summary

### Backend (.env for local, Render env vars for production)

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=your-random-secret-key-minimum-32-chars
```

### Frontend (.env.local for local, Vercel/Render env vars for production)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000          # Local
NEXT_PUBLIC_API_URL=https://your-api.onrender.com   # Production
```

---

## Database Configuration

| Environment | Database | Configuration |
|---|---|---|
| **Local Dev** | SQLite (file-based) | `DATABASE_URL=sqlite:///./packai.db` |
| **Render Production** | PostgreSQL | `DATABASE_URL=postgresql://...` from Render dashboard |

The `database.py` automatically detects the database type and configures connection pooling for PostgreSQL.

---

## Commands Quick Reference

### Backend
```powershell
# Local development
uvicorn main:app --reload --port 8000

# Production (Render uses Procfile)
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT

# Seed database
python seed.py
```

### Frontend
```powershell
# Development
npm run dev

# Production build
npm run build

# Production start
npm start
```

---

## Verification After Deployment

1. **Backend Health**: Visit `https://YOUR-API.onrender.com/docs` → should show Swagger UI
2. **Frontend**: Visit `https://YOUR-FRONTEND.vercel.app` → should show landing page
3. **Register**: Create a new account via `/register`
4. **Login**: Login with credentials → redirected to dashboard
5. **Create Order**: Go to Orders → New Order → create one
6. **Optimize**: Go to Optimization → select order → run optimization
7. **Analytics**: Check Analytics page for charts and stats
8. **Inventory**: Check Inventory page shows seeded box types

---

## Troubleshooting

### Backend won't start on Render
- Check logs in Render dashboard
- Verify `DATABASE_URL` is correct PostgreSQL URL
- Verify `SECRET_KEY` is set
- Ensure `seed.py` runs without errors

### Frontend shows API errors
- Verify `NEXT_PUBLIC_API_URL` points to your deployed backend URL
- Check browser console for CORS errors (backend allows all origins by default)
- Ensure backend is running and accessible

### Database connection fails
- For local SQLite: ensure write permissions in directory
- For Render PostgreSQL: verify Internal Database URL is used (not External)
- Check that PostgreSQL database is in same region as web service

### Frontend build fails
- Run `npm run build` locally first to catch errors
- Ensure all TypeScript types are correct
- Check that `NEXT_PUBLIC_API_URL` is set during build
