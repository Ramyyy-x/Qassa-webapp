# Qassa (قَصَّة) - Premium Barber Shop Appointment System

A full-stack, highly scalable appointment scheduling and management system built with Next.js 15, Tailwind CSS v4, and Supabase. Designed with a premium Arabic UI (RTL) and robust backend architecture to handle real-world business scenarios.

## 🚀 Features

### Customer Experience
- **Premium UI/UX:** Stunning dark-mode interface with smooth Framer Motion animations.
- **Smart Booking:** Intelligent time-slot generation based on service duration and business hours.
- **Real-time Notifications:** Instant alerts for booking confirmations and status updates.
- **Reviews System:** Ability to leave feedback and ratings for completed appointments.

### Admin Dashboard
- **Role-Based Access:** Secure admin-only routes and dashboard.
- **Appointment Management:** Approve, decline, or mark appointments as completed.
- **Services Management:** Create and update barber services dynamically.
- **Working Hours Control:** Set business hours and off-days to automatically prevent bookings.
- **Live Notifications:** Get notified instantly via WebSockets when a new booking or review is submitted.

---

## 🏗️ Architecture Highlights

This project goes beyond a simple CRUD application. It is engineered with robust backend patterns to ensure data integrity, security, and performance.

### 1. Database Triggers for Notifications
Instead of handling notification logic within the application layer (which can fail during network issues), the system relies on **PostgreSQL Triggers**.
- When an appointment is created, updated, or a review is submitted, the database automatically executes a PL/pgSQL function to insert the appropriate notification. This guarantees 100% reliability and data consistency.

### 2. Supabase Realtime Subscriptions
The notification bell uses **Supabase Realtime (WebSockets)** to listen to `postgres_changes`.
- `filter: user_id=eq.${userId}` ensures users only receive their own events.
- **Robust Cleanup:** Implemented strict cleanup `channel.unsubscribe()` on component unmount to prevent memory leaks and zombie connections in React Strict Mode.

### 3. Row Level Security (RLS)
Security is enforced at the database level using PostgreSQL Row Level Security.
- **Customers** can only view and update their own appointments and profiles.
- **Admins** have elevated policies to view and manage all records.
- Even if the API is bypassed, the database strictly denies unauthorized access.

### 4. Role-Based Access Control (RBAC)
User roles (`admin`, `customer`) are securely stored in the `profiles` table. Next.js Server Actions and Layouts verify this role on the server-side before rendering admin pages or executing sensitive mutations, ensuring zero client-side spoofing.

### 5. Advanced Double Booking Prevention (Challenge Solved)
Handling concurrency in booking systems is notoriously difficult. The system solves this using a two-layered approach:
- **Presentation Layer:** The time-slot generator algorithm checks business hours (`working_hours`), iterates through 30-minute intervals, and calculates `duration_minutes` of existing bookings to hide overlapping slots.
- **Database/Mutation Layer:** Before inserting a booking, a server action performs a microsecond check for existing appointments at the exact date and time. It also limits active appointments per user (max 5) to prevent spam and system abuse.

---

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router, Server Actions, Server Components)
- **Styling:** Tailwind CSS v4 & Framer Motion
- **Database & Auth:** Supabase (PostgreSQL, Supabase Auth PKCE, Realtime)
- **Email:** Resend
- **Deployment:** Vercel
