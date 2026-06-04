# VMS Login-BE — Visitor Management System

Full-stack authentication implementation for SCRUM-17: Backend Signup Visiter Page.

## Stack
- **Frontend**: React 18 + TypeScript + Vite 5 (port 5173)
- **Backend**: ASP.NET Core 8 Web API (port 8000)
- **Database**: PostgreSQL + EF Core 8 + BCrypt.Net-Next

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```
→ http://localhost:5173

### Backend
```bash
cd backend
dotnet restore
dotnet run --urls http://localhost:8000
```
→ http://localhost:8000  
→ Swagger: http://localhost:8000/swagger

## Features
- ✅ User Registration with validation
- ✅ Email verification
- ✅ Password hashing with BCrypt
- ✅ Field-level error handling
- ✅ Responsive UI with hero image
- ✅ Full test coverage

## Demo Credentials
Register a new account via http://localhost:5173/register

---

**SCRUM-17 Implementation Complete** — All ACs implemented and tested.
