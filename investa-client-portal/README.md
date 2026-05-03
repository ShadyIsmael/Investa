# Investa — Client Portal

Angular 19 web application for **external investors and clients** on the Investa platform. Allows users to browse investment opportunities, manage their profile, view credit history, and submit KYC documentation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 19+ (standalone components) |
| State Management | Angular Signals |
| Styling | Tailwind CSS + SCSS |
| HTTP | Angular `HttpClient` with interceptors |
| Routing | Angular Router (lazy-loaded routes) |
| Auth | JWT with HTTP interceptor injection |
| Change Detection | Zoneless (OnPush) |

---

## Project Structure

```
src/app/
├── config/          # App-level configuration (API base URL, constants)
├── core/            # Singleton services (Auth, API, Storage)
├── guards/          # Route guards (auth, role-based)
├── interceptors/    # HTTP interceptors (token injection, error handling)
├── models/          # TypeScript interfaces and domain models
├── services/        # Feature services (investments, profile, KYC)
├── pages/
│   ├── home/        # Landing / investment listings
│   ├── login/       # Authentication
│   ├── signup/      # Registration
│   ├── about/       # About page
│   ├── blog/        # Blog listing
│   ├── blog-post/   # Blog detail
│   ├── contact/     # Contact form
│   └── services/    # Services overview
├── components/      # Shared UI components
├── directives/      # Custom Angular directives
├── pipes/           # Custom Angular pipes
└── shared/          # Shared modules and utilities
```

---

## Quick Start

**Prerequisites:** Node.js 18+

```bash
npm install
npm run start     # development server (http://localhost:4200)
npm run build     # production build
```

---

## API Base URL Configuration

The client resolves the backend API base URL at runtime with the following precedence (no rebuild required):

1. **Runtime global** — set in `index.html` before the app boots:
   ```html
   <script>
     window.__INVESTA_API_BASE = 'http://localhost:5235';
   </script>
   ```

2. **Meta tag** — injected by your server or hosting platform:
   ```html
   <meta name="investa-api-base" content="http://localhost:5235" />
   ```

3. **Bootstrap token** — configure in `src/main.ts` via the `API_BASE_URL` injection token.

4. **Default** — falls back to `http://localhost:5000` if nothing else is set.

---

## Key Features

- **Investment Listing**: Browse active investment opportunities with filters
- **Authentication**: JWT-based login and registration
- **Profile Management**: Edit personal info, change password
- **KYC**: Submit identity and compliance documents
- **Credit History**: View credit score and transaction history
- **Bilingual**: AR/EN localization support
- **Responsive**: Mobile-first layout with Tailwind CSS

---

## Code Quality (May 2026)

- All debug `console.log` / `console.debug` / `console.info` statements removed
- Standalone components throughout (no `NgModule` boilerplate)
- All HTTP calls go through centralized interceptors
- Lazy-loaded routes to minimize initial bundle size
