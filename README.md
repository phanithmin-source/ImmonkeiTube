# ImmonkeiTube - YouTube Video Player (YouTube Data API v3)

A modern, responsive YouTube video player and explorer web application built with **React**, **TypeScript**, **Tailwind CSS**, and the official **Google YouTube Data API v3**.

---

## 🚀 Quick Start

To run the application locally:

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Start the development server
npm run dev
```

Then open your browser at **[http://localhost:5173](http://localhost:5173)**.

To create an optimized production build:
```bash
npm run build
npm run preview
```

---

## 🔑 Configured API Key

The application is pre-configured with your provided YouTube Data API v3 key:

```text
AIzaSyDtiy5eYjQJi3h2JZfJNFI58PI6EUa2Kvo
```

You can also test, inspect, or change the API key anytime directly inside the app using the **Key** icon button in the header.

---

## ✨ Features

- **Trending & Popular Feed**: Real-time popular videos loaded via `videos.list` (chart=mostPopular).
- **Keyword Search**: Instant search for any topic, creator, or song using `search.list` with batch statistics lookup.
- **Category Filter Pills**: Fast filtering by categories (All, Trending, Music, Gaming, Tech & AI, Lo-Fi Chill, Movie Trailers, Sports, Nature 4K).
- **Embedded YouTube Video Player**:
  - 16:9 responsive embedded player (`youtube-nocookie.com/embed`)
  - **Theater Mode** toggle (collapses sidebar, expands player)
  - **Ambient Glow effect** toggle (cinematic ambient lighting around the video)
  - Fullscreen and responsive playback controls
- **Interactive Actions**:
  - Like / Dislike with count increments
  - Subscribe / Subscribed channel toggle
  - **Share** button: One-click copy of YouTube video URL to clipboard with toast notification
  - **Watch Later / Bookmark**: Save any video to your personal library
- **Real YouTube Comments**:
  - Fetches top comments using `commentThreads.list`
  - Interactive "Add a comment..." form that posts directly to the local feed
- **Play Any YouTube Video by Link or ID**:
  - Click **"Play URL / ID"** in the header
  - Paste any `https://www.youtube.com/watch?v=...`, `youtu.be/...`, `youtube.com/shorts/...`, or raw 11-character Video ID to immediately load and stream it
- **Watch History & Library**:
  - Automatically remembers recently watched videos
  - Stored locally in `localStorage`
- **Graceful Quota Handling**:
  - If Google YouTube API limits (10,000 quota units/day) are reached or offline, the site seamlessly displays curated playable demo videos so playback never fails.
