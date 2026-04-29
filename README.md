# 📰 AI News Briefing

An AI-powered news aggregator that fetches top stories from multiple global outlets, deduplicates overlapping coverage, and generates a concise daily briefing with source links.

---

## ✨ Features

- 🌍 Aggregates news from multiple sources (BBC, CNN, Sky News, Al Jazeera, DW, etc.)
- 🧠 Deduplicates overlapping stories across outlets
- 🤖 Generates AI-powered summaries using OpenAI
- ⚡ Fast responses with Redis caching
- 🎯 Clean, responsive UI built with Next.js
- 🔎 Search and filter by source
- 📱 Fully mobile responsive
- 🔗 Direct links to original articles

---

## 🏗️ Architecture
Frontend (Next.js)
↓
Backend API (Node.js / Express)
↓
News Sources (RSS feeds)
↓
Deduplication Engine
↓
OpenAI Summarization
↓
Redis Cache (performance + cost optimization)


---

## 🚀 Demo

## 📦 Tech Stack

### Frontend
- Next.js
- Tailwind CSS
- Framer Motion
- Lucide React
- React Markdown

### Backend
- Node.js
- Express
- OpenAI API
- Redis
- rss-parser

---

## ⚙️ Setup

### 1. Clone the repo
git clone https://github.com/your-username/ai-news-briefing.git

cd ai-news-briefing

---

### 2. Backend setup
cd backend
npm install
Create `.env`:
OPENAI_API_KEY=your_openai_key
REDIS_URL=redis://localhost:6379
CLIENT_URL=http://localhost:3000
PORT=4000
Run backend:
npm run dev

---

### 3. Run Redis
docker run --name news-redis -p 6379:6379 -d redis:7

---
### 4. Frontend setup
cd ../frontend
npm install
Create `.env.local`:
NEXT_PUBLIC_NEWS_API_URL=http://localhost:4000/api/news
Run frontend:
npm run dev

---

#### Example
curl "http://localhost:4000/api/news?limit=5"

---

## 🧠 Deduplication StrategyStories are grouped using:- Title normalization- String similarity matching- Threshold-based clusteringThis ensures multiple outlets reporting the same story are merged into one.

---

## ⚡ Caching Strategy- Redis used to cache responses- TTL-based invalidation- Optional manual refresh via `refresh=true`
Cache Key: news:<limit>:<threshold>:<ai>

---

## 📱 UI Highlights- Responsive grid layout- Source badges with branding- Animated story cards- Search + filtering- Markdown-rendered summaries

---

## 🧪 Testing
npm test
Uses:- Vitest

---

## 📄 License

MIT

---

## 🙌 Author
Femi Abejide

Built with ❤️ — production-grade AI + full-stack system 🚀