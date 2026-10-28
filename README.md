# HelpHub AI — Frontend Web Application

> **"Report a problem. Find a solution. Build a better community."**

HelpHub AI is a modern, responsive, open-source civic problem-solving platform connecting citizens, volunteers, community organizers, and authorities to report, track, and remediate local infrastructure concerns (sanitation, potholes, broken streetlights, water leaks, public accessibility).

---

## Key Features

- **Multilingual Support**: Real-time interface toggling between **English**, **हिन्दी (Hindi)**, and **ଓଡ଼ିଆ (Odia)**.
- **Interactive Map**: OpenStreetMap & Leaflet geospatial report feed with pin clustering and coordinate filtering.
- **Role-Aware Dashboards**: Tailored views and capabilities for **Guests**, **Citizens**, **Volunteers**, **NGO Organizers**, **Moderators**, and **Administrators**.
- **AI Gemma 4 Integration**: Civic assistant modal for drafting polite complaint letters and auto-structuring community reports.
- **Fast & Accessible UI**: Built with React 18, Vite, Tailwind CSS, and Lucide icons.

---

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Bundler & Dev Server**: Vite 5
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Maps**: Leaflet & React-Leaflet
- **Testing**: Vitest & React Testing Library
- **Authentication & Backend Client**: Supabase JS Client & Axios/Fetch

---

## Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

Create `.env` based on `.env.example`:

```bash
cp .env.example .env
```

Set your configuration:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-key
VITE_API_BASE_URL=http://localhost:8000
VITE_DEMO_MODE=false
```

### 3. Run Development Server

```bash
npm run dev
```

App will run at `http://localhost:5173`.

### 4. Build for Production

```bash
npm run build
```

Assets will be output to `dist/`.

### 5. Run Tests

```bash
npm run test
```

---

## License

This project is licensed under the MIT License.
