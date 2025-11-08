## SendIT

Fast, simple, secure file sharing. Send files up to 10GB using a one-time code — no signup, no email, no phone number.

### Features
- **Instant sharing**: Upload and share with a short code.
- **Up to 10GB**: Large transfers without hassles.
- **Optional protection**: Support for password-protected transfers.
- **Auto-cleanup**: Temporary storage with automatic expiry.
- **PWA**: Installable on desktop and mobile.

### Tech stack
- **Frontend**: React, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui
- **Data/Storage**: Supabase
- **PWA**: Web App Manifest + Service Worker
- **Android**: Trusted Web Activity (TWA)

### Getting started
1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in `sendit/` with:
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

### Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview the production build
- `npm run lint`: Lint the project

### PWA
- Manifest: `public/manifest.json`
- Service worker: `public/service-worker.js`
- The app is installable; ensure HTTPS in production.

### Android (TWA)
The Android wrapper opens the web app in a Trusted Web Activity. The configured host is `sendit-now.vercel.app`. Key files:
- `app/build.gradle` (hostName, manifest URLs)
- `twa-manifest.json` (host, iconUrl, webManifestUrl, fullScopeUrl)
- `app/src/main/res/values/strings.xml` (Digital Asset Links)

If you change the production domain, update these values accordingly and rebuild the Android project.

### License
Proprietary – all rights reserved.

