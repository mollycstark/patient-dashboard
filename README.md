# 🩺 Patient Dashboard (Finni Take-Home)

A simple full-stack CRUD app for managing patient records. Built with **React (Vite + TypeScript)** on the frontend and **Flask + SQLite (via SQLAlchemy)** on the backend.

## 🚀 Running the App

🔧 Development Mode

Run frontend and backend separately (recommended for live pairing / fast dev):

1. **Start Flask backend**
   ```bash
   cd patient-dashboard
   python3 -m venv venv
   source venv/bin/activate
   pip3 install -r requirements.txt
   python run.py
   ```

2. **Start React frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Frontend runs on `http://localhost:5173` and proxies `/api` requests to Flask running at `http://127.0.0.1:5000`.

### ✅ Implemented

- Name fields (first, middle, last) are stored separately
  - Middle name is optional
  - Auto-capitalized and trimmed for consistency
  - Character limits enforced at the database level (50 characters each)
- Status is limited to 4 predefined values: Inquiry, Onboarding, Active, Churned
- DOB is required, must be in the past, and uses a date picker
- Address is stored as a flat string
  - UI includes a format hint: "123 Main St, San Francisco, CA 94110"
  - Future versions may split this into structured fields
- SQLAlchemy + SQLite used for persistent backend storage
- React (Vite + TypeScript) communicates with Flask via proxied REST API
- MUI used for layout and form components
  - Provides built-in validation and accessibility support
- Patient data persists across refreshes via database
- Flask backend is structured to support lightweight unit tests (e.g. using `pytest` or Flask’s built-in test client)

### ❓ Questions

- Should address fields be broken into city/state/zip in the DB?
- Should patient records be editable/deletable?
- Should providers be able to filter/search by status or DOB?
- Should the table be sortable by columns (e.g. last name, DOB)?
- Should providers be able to click into a detailed view of a patient?
- Will multi-provider support (multi-tenancy) be needed?

## 🛠️ Tech Stack

- Frontend: React, Vite, TypeScript, Material UI
- Backend: Flask, SQLAlchemy, SQLite
- Dev Tools: Vite proxy, virtualenv, RESTful API design
