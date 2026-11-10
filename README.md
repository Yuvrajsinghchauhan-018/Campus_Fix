# CampusFix

CampusFix is a full-stack campus complaint and maintenance management platform designed for college environments. It helps students report issues, authorities review and assign tasks, and maintainers resolve them efficiently with live updates, analytics, and notifications.

## Overview

The project is structured as a multi-role system with three interfaces:

- Web portal for students, authorities, and maintainers
- Mobile app for field maintenance and faster updates
- Backend API for authentication, complaints, notifications, analytics, and assignments

It combines a modern React frontend with an Express + MongoDB backend and an Expo mobile app, making it suitable for demo deployments, academic projects, and campus operations workflows.

## Features

- Student complaint submission with category selection and issue reporting
- AI-assisted complaint prioritization and content safety checks using Groq
- Role-based dashboards for students, maintainers, and college authority
- Complaint assignment to specific maintainers with deadlines and internal notes
- Real-time updates via Socket.IO
- Notifications and announcements for users and departments
- Department management and maintainer tracking
- Analytics dashboard with complaint trends and resolution statistics
- PDF/report generation support and QR-based workflow helpers
- Mobile app support for on-the-go maintenance

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT auth
- Socket.IO
- Groq SDK for AI prioritization
- Multer + Cloudinary for uploads
- Nodemailer / Twilio support for notifications and OTP flows

### Frontend

- React
- Vite
- Tailwind CSS
- Recharts for analytics views
- Socket.IO client
- React Router

### Mobile

- Expo
- React Native
- React Navigation
- Secure storage for tokens
- Socket.IO client

## Project Structure

```text
Campus_Fix/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── uploads/
│   ├── utils/
│   ├── .env.example (create manually)
│   ├── package.json
│   ├── server.js
│   ├── seeder.js
│   └── ...
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── mobile/
│   ├── src/
│   ├── app.json
│   ├── package.json
│   └── ...
├── Campus_Fix_Chen_ER_Diagram.mmd
├── README.md
└── ...
```

## Prerequisites

Before running the project, make sure you have:

- Node.js 18+ and npm
- MongoDB running locally or via MongoDB Atlas
- A Groq API key for complaint analysis
- Optional Twilio credentials for SMS OTP flows

## Environment Setup

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/campusfix
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=30d
ADMIN_SECRET_KEY=your_admin_secret_key
CLIENT_URL=http://localhost:5173
GROQ_API_KEY=your_groq_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

Notes:

- `MONGO_URI` is required for the backend to connect to MongoDB.
- `GROQ_API_KEY` is used for complaint categorization and safety checks.
- Twilio keys are optional if SMS is not being used in your setup.
- The frontend web app expects the API at `http://localhost:5000/api` by default.

## Installation

### 1) Install backend dependencies

```bash
cd backend
npm install
```

### 2) Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 3) Install mobile dependencies

```bash
cd ../mobile
npm install
```

## Running the Project

### Start the backend

```bash
cd backend
npm run dev
```

The API will run on:

- http://localhost:5000

### Start the web app

```bash
cd frontend
npm run dev
```

The frontend usually runs on:

- http://localhost:5173

If needed, set `VITE_API_URL` in the frontend environment to point to your backend URL.

### Start the mobile app

```bash
cd mobile
npm start
```

For Expo devices on the same network, you can optionally set a custom backend URL in `mobile/app.json` under `expo.extra.apiBaseUrl`.

## Database Seeding

To seed the initial authority account and default departments:

```bash
cd backend
node seeder.js
```

Default seeded authority login:

- Email: `authority@campusfix.com`
- Password: `Authority@123`

## Core API Modules

The backend exposes routes for:

- Authentication: `/api/auth`
- Complaints: `/api/complaints`
- Users: `/api/users`
- Maintainers: `/api/maintainers`
- Departments: `/api/departments`
- Notifications: `/api/notifications`
- Analytics: `/api/analytics`
- Announcements: `/api/announcements`

## Typical Workflow

1. A student logs in and submits a campus complaint.
2. The backend analyzes the complaint using AI categorization and priority logic.
3. The authority reviews pending complaints and assigns a maintainer.
4. The maintainer receives the work and updates status to resolved or rejected.
5. The student and authority receive notifications and analytics updates.

## Notes

- This project is built for academic/demo use and can be extended for real campus management operations.
- If the Groq API key is missing or the external service fails, complaint analysis may fallback gracefully rather than stopping the request completely.
- The project uses a simulated email sender in the current setup, so production email delivery may require a real SMTP provider integration.

## License

This project currently uses the ISC license in the backend package configuration and is intended for internal or educational use unless otherwise specified.
