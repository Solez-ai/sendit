<h2 align="center">
  <b>SendIT</b><br>
  <img src="https://i.postimg.cc/6qFyJdCb/logo.png" width="80" alt="SendIT Logo"><br><br>
  <i>Fast, simple, secure file sharing up to 10GB — no signup, no email, no phone number.</i>
</h2>

---
<h2 align="center">🛠️ Built With</h2>

<p align="center">
  <a href="https://react.dev/"><img src="https://skillicons.dev/icons?i=react" width="40"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://skillicons.dev/icons?i=typescript" width="40"></a>
  <a href="https://vitejs.dev/"><img src="https://skillicons.dev/icons?i=vite" width="40"></a>
  <a href="https://tailwindcss.com/"><img src="https://skillicons.dev/icons?i=tailwind" width="40"></a>
  <a href="https://supabase.com/"><img src="https://skillicons.dev/icons?i=supabase" width="40"></a>
  <a href="https://developer.android.com/"><img src="https://skillicons.dev/icons?i=androidstudio" width="40"></a>
  <a href="https://pwa.dev/"><img src="https://i.postimg.cc/dQ6bHsJF/161-1612623-community-introduced-and-widely-adopted-pwa-logo-progressive-Photoroom.png" width="90"></a>
</p>

---

### ✨ Features
- ⚡ **Instant Sharing** — Upload and share files with a short one-time code  
- 📦 **Up to 10GB** — Large transfers made easy  
- 🔐 **Optional Protection** — Password-protected transfers  
- ⏱ **Auto-Cleanup** — Temporary storage with expiry  
- 📱 **PWA-Ready** — Installable on desktop and mobile  

---

### 🧠 Tech Stack
| Layer | Technologies |
|:------|:--------------|
| **Frontend** | React, TypeScript, Vite |
| **UI/UX** | Tailwind CSS, shadcn/ui |
| **Backend / Storage** | Supabase (Storage + Auth) |
| **PWA** | Web App Manifest + Service Worker |
| **Android** | Trusted Web Activity (TWA) |

---

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
Open Source (MIT License)

