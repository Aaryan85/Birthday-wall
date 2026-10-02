# Birthday Wall 🎂

A minimal editorial public birthday wall built with React, Vite, Tailwind CSS, Express, and MongoDB.

## Project Structure

```
Birthday calender/
├── frontend/             # React + Vite + Tailwind CSS Frontend
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/   # Navbar, Hero, TodaySection, BirthdayList, AddBirthdayModal, FooterCta
│   │   ├── data/         # mockBirthdays.js
│   │   ├── services/     # api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/              # Node.js + Express + MongoDB Backend
│   ├── models/           # Birthday.js (Mongoose Model)
│   ├── routes/           # birthdayRoutes.js (API Endpoints)
│   ├── services/         # emailService.js, scheduler.js (12 AM Wish Automation)
│   ├── .env              # Backend configuration (SMTP, MongoDB URI, URLs)
│   ├── package.json
│   └── server.js         # Express server entrypoint
│
└── package.json          # Root helper scripts
```

## How to Run

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 2. Backend
```bash
cd backend
npm install
npm start
```
