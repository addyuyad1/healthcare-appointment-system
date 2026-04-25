# 🏥 Healthcare Appointment System

🚀 A **production-grade React + TypeScript platform** for seamless doctor discovery, appointment booking, scheduling, and healthcare workflow management.

---

## 🌟 Overview

This application simulates a **real-world healthcare platform** (like Practo), enabling patients and doctors to interact through a structured, scalable system.

💡 Built with a strong focus on:

* Clean architecture 🧠
* Real-world workflows ⚙️
* Production-ready patterns 🚀

---

## 🎥 ScreenShot


<img width="959" height="445" alt="{92766827-835A-4005-BBA5-532AF76B24E5}" src="https://github.com/user-attachments/assets/4c0b5867-8d05-4379-9ac4-fa734aea4d8b" />
<img width="960" height="445" alt="{108D2D62-1A97-42B5-AD77-EC808071ED34}" src="https://github.com/user-attachments/assets/ba16c24f-06c3-4181-81af-071eb2fcb50d" />
<img width="471" height="441" alt="{EA932058-350C-474D-833D-1D030AF2532C}" src="https://github.com/user-attachments/assets/d7ae5aac-6f33-404b-a5d2-00df7cfdf077" />
<img width="479" height="445" alt="{B14E91D1-B927-43D2-A9FE-C7BF6EFA519B}" src="https://github.com/user-attachments/assets/9639a0b2-322e-45ae-9a31-f0d75027f99e" />
<img width="751" height="442" alt="{B162053A-67B3-43C8-9B5A-70142514C96A}" src="https://github.com/user-attachments/assets/f7804bc3-2d8f-4082-8d37-40b6079a7bc1" />
<img width="317" height="337" alt="{B6494B2E-31EC-49E4-A31B-29C934E8A7A4}" src="https://github.com/user-attachments/assets/c21b1fff-029a-4c20-a9b5-83ec1d9f16d3" />
<img wi

---

## ✨ Features

### 🔐 Authentication & Security

* 👤 Patient & Doctor login/signup
* 🔑 Token-based authentication (persisted)
* 🛡️ Protected routes with role-based access

---

### 🔍 Doctor Discovery

* 🔎 Search doctors by name
* 🎯 Filter by specialization, rating, availability
* 📄 Detailed doctor profiles

---

### 📅 Appointment Booking

* 🕒 Select time slots with validation
* ❌ Prevent double booking
* 🔄 Reschedule appointments
* 🗑️ Cancel appointments with confirmation

---

### 📆 Smart Calendar

* 🗓️ Monthly & weekly views (FullCalendar)
* 📍 Highlight booked slots
* 🔄 Real-time-like updates using polling

---

### 🔔 Notifications

* 🔔 In-app notifications
* 📧 Mock email reminders
* 🍞 Toast alerts for actions

---

### 🎨 UI/UX Excellence

* 💎 Clean modern UI
* ⚡ Loading skeletons
* 📱 Responsive design
* ♿ Accessibility-focused components

---

## 🏗️ Architecture

```id="arch3"
React UI (Feature-based)
        ↓
App Router + Guards
        ↓
State (Zustand)
        ↓
API Layer (Axios + Interceptors)
        ↓
Mock API Adapter
        ↓
Logger + Monitoring
```

---

## 🛠️ Tech Stack

### 💻 Frontend

* ⚛️ React 18 + TypeScript
* ⚡ Vite
* 🎨 TailwindCSS
* 🔀 React Router

### 🧠 State & Forms

* 🗂️ Zustand
* 🧾 React Hook Form + Zod

### 📡 API & Data

* 🌐 Axios
* 🧪 Mock API Adapter

### 📅 UI Libraries

* 📆 FullCalendar

### 🧪 Testing

* 🧪 Jest
* 🔍 React Testing Library

---

## 📂 Project Structure

```id="arch4"
src/
├── app/                ⚙️ App config & routing
├── features/           🧩 Feature modules
│   ├── auth/
│   ├── appointments/
│   ├── doctors/
│   ├── calendar/
│   └── notifications/
├── services/           🌐 API & utilities
├── shared/             ♻️ Reusable components
└── styles/             🎨 Global styles
```

---

## ⚡ Production-Quality Highlights

### 🧠 Architecture

* Centralized API abstraction
* Environment-based configuration
* Logging & monitoring services

---

### 🔐 Security

* Token-based authentication
* Role-based route protection
* Authorization checks

---

### ⚡ Performance

* Code splitting (React.lazy)
* Memoization for components
* Optimized search with debouncing

---

### ♿ Accessibility

* ARIA-compliant modals
* Keyboard navigation support
* Screen-reader friendly alerts

---

## ⚙️ Setup & Installation

### 1️⃣ Clone Repository

```bash id="cmd5"
git clone https://github.com/your-username/healthcare-appointment-system.git
cd healthcare-appointment-system
```

---

### 2️⃣ Install Dependencies

```bash id="cmd6"
npm install
```

---

### 3️⃣ Configure Environment

```bash id="env2"
VITE_APP_NAME=Healthcare Appointment System
VITE_API_BASE_URL=/api
VITE_ENABLE_API_LOGGING=true
VITE_ENABLE_MONITORING=true
```

---

### 4️⃣ Run Development Server

```bash id="cmd7"
npm run dev
```

---

## 🧪 Testing

```bash id="cmd8"
npm test
```

✅ Includes:

* Auth validation testing
* Protected route testing
* Double booking prevention logic

---

## 🚀 Deployment

### 🌐 Platforms

* Frontend: **Vercel / Netlify**
* Backend (future): **Render / Railway / Azure**

---

## 🔐 Demo Credentials

👤 Patient

* Email: `patient@care.com`
* Password: `password123`

👨‍⚕️ Doctor

* Email: `doctor@care.com`
* Password: `password123`

---

## 📊 Future Enhancements

* 💳 Payment integration (Stripe)
* 🤖 AI symptom checker (GenAI 🚀)
* 📡 WebSocket real-time updates
* 📈 Analytics dashboard

---

## 🧠 Learnings

* Built scalable feature-based architecture
* Implemented real-world scheduling constraints
* Designed production-ready UI/UX
* Managed complex state & API flows

---


---

## ⭐ Support

If you like this project, give it a ⭐ — it helps a lot! 💙

---
dth="317" height="191" alt="{7A8B202C-29B8-4A4E-A310-F643293773B8}" src="https://github.com/user-attachments/assets/820c9da7-cc39-46fa-9d4f-730b52dd4dd0" />
