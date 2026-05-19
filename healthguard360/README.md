# Surveil

AI-Powered Integrated Rural Health Intelligence Platform

## Tech Stack

- React 18 + TypeScript (strict mode)
- Vite 8 with PWA plugin (offline-first)
- Tailwind CSS v4
- shadcn/ui-inspired component library
- React Query v5 (TanStack Query)
- Zustand (client-side state)
- React Router v7
- Leaflet.js + react-leaflet (GIS maps)
- Recharts (analytics dashboards)
- i18next (multilingual: EN, HI, KN, TA, TE, MR, BN, OR)
- Axios (HTTP with interceptors)
- vite-plugin-pwa (Workbox caching)

## Setup

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
pnpm preview
```

## Environment Variables

Create `.env` in project root:

```
VITE_API_URL=/api
```

## Routes

| Path         | Access          | Description                      |
| ------------ | --------------- | -------------------------------- |
| `/login`     | Public          | Role-based OTP login             |
| `/dashboard` | Authenticated   | Role-aware dashboard             |
| `/community` | Patient/ASHA/PHO| Symptom reports + outbreak map   |
| `/clinical`  | Nurse           | Patient risk monitoring          |
| `/emergency` | All             | Emergency resource radar (map)   |
| `/alerts`    | ASHA/PHO/Admin  | Unified alert hub                |
| `/admin`     | Admin           | User & district management       |

## Roles

- **Patient**: Report symptoms, find nearby facilities
- **ASHA Worker**: Community health worker dashboard
- **Nurse/Clinician**: Clinical risk monitor with patient drawer
- **Public Health Officer**: District outbreak management, alert broadcasting
- **Admin**: System administration, user management
