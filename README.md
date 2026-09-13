# EcoEats — Food Donation & Waste Management System

A full-stack platform connecting food donors (restaurants, households, event organizers) with NGOs and collectors, to reduce food waste and get surplus food to people who need it.

**Live app:** https://food-management-system-nine.vercel.app

## What it does

- **Donors** can list surplus food with quantity, expiry time, pickup location (with map coordinates), and contact info.
- **NGOs / Collectors** can browse nearby available donations and accept them for pickup.
- **Admins** get an overview dashboard to monitor the platform.
- Every donation moves through a tracked status lifecycle: `pending → requested → accepted → in-transit → collected → delivered`.
- Built-in messaging lets donors and collectors coordinate pickup details directly.
- Donations are geotagged, so collectors can find and prioritize pickups near them.

## Tech stack

**Frontend:** React 19, Vite, React Router, Axios, Leaflet (for maps)
**Backend:** Node.js, Express 5, MongoDB with Mongoose
**Auth:** JWT-based authentication with bcrypt password hashing
**Deployment:** Frontend on Vercel, backend on Render, database on MongoDB Atlas

## Project structure
