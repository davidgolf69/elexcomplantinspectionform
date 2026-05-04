# Elexcom Vehicle Daily Inspection — PWA

A mobile-first Progressive Web App that lets Elexcom Pty Ltd employees complete a daily pre-start vehicle inspection from any phone, tablet or PC. Once installed on a phone, it works offline and feels like a native app.

## What's in the box

| File | Purpose |
|------|---------|
| `index.html` | The inspection form — UI, checklist, photo handling, submission, PDF |
| `admin.html` | Inspection tracker — history, stats, filtering, CSV/JSON export |
| `manifest.json` | PWA manifest (app name, icons, theme colour, install behaviour) |
| `service-worker.js` | Caches the app for offline use, including jsPDF library |
| `icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | App icons used when installed |
| `icons/logo-placeholder.svg` | Placeholder header logo — swap with your real logo |
| `README.md` | This file |

## Features

**Inspection form (`index.html`):**
- Full Australian-style pre-start checklist across five sections (42 items)
- Required fields: driver name, employee ID, rego, odometer, depot, date, time
- Defects free-text plus multi-photo upload (camera or gallery, auto-compressed)
- Pass / Fail / N/A buttons for every item, with running summary
- Recipient picker — employee chooses who to send to at submission, plus optional cc
- **Two submission options at the end:**
  - **Send by Email / Share** — uses Web Share API on mobile (with photo attachments) or mailto fallback on desktop
  - **Save as PDF** — generates a polished branded PDF report including all photos, ready to print or file
- Every submission is also saved to **this device's local history** for the tracker

**Inspection tracker (`admin.html`):**
- Dashboard stats: total inspections, vehicles safe vs. removed, total fail items, drivers, vehicles
- "Top failed items" leaderboard — surfaces the recurring problems across your fleet
- Sortable, filterable history table — search by driver/rego/notes, filter by status, fails or date range
- Click any row for full inspection breakdown (every checklist item with its result)
- **CSV export** — open in Excel for further analysis
- **JSON backup export & import** — to consolidate submissions from multiple devices
- Local-only: all data lives in the device's browser storage, nothing transmitted

**Both:**
- Installs to phone home screens, works offline once cached
- Elexcom branded (blue + yellow), responsive on phones, tablets and desktops

## How to deploy

A PWA needs to be served over **HTTPS** (or `localhost`) for installability and the service worker to function. Pick whichever option suits you:

### Option 1 — Simplest: GitHub Pages (free)
1. Create a new GitHub repo, e.g. `elexcom-inspection`.
2. Upload all files from this folder (preserve the `icons/` subfolder).
3. In **Settings → Pages**, choose `main` branch, root folder, save.
4. After ~30 seconds your app is live at `https://<your-org>.github.io/elexcom-inspection/`.
5. Send the link to your employees and ask them to install it (instructions below).

### Option 2 — Cloudflare Pages, Netlify or Vercel (free, drag-and-drop)
Drag the whole folder onto their dashboard. You'll get an HTTPS URL in seconds.

### Option 3 — Your own web hosting / cPanel
Upload the folder via FTP. Make sure your server serves files over HTTPS.

### Option 4 — Internal server (intranet)
Any web server (IIS, Apache, nginx) will do. Make sure HTTPS is configured.

## How employees install it on their phones

**iPhone (Safari):**
1. Open the link in Safari.
2. Tap the Share button → **Add to Home Screen** → **Add**.

**Android (Chrome):**
1. Open the link in Chrome.
2. Tap the menu (⋮) → **Install app** (or **Add to Home Screen**).

The app then appears with the Elexcom icon and launches like a native app.

## Customising the app

Open `index.html` and search for **`const CONFIG`** near the top of the `<script>` block. You'll see:

```js
const CONFIG = {
  companyName: "Elexcom Pty Ltd",
  abn: "ABN: __ ___ ___ ___",  // <<< replace with your ABN
  recipients: [
    { label: "David Sharp (Director)", email: "david.sharp@elexcom.com.au" },
    { label: "Fleet Manager", email: "fleet@elexcom.com.au" },
    { label: "Workshop / Maintenance", email: "workshop@elexcom.com.au" },
    { label: "Safety Officer", email: "safety@elexcom.com.au" }
  ],
  emailSubjectPrefix: "Vehicle Daily Inspection"
};
```

**Update:**
- `abn` — drop in your real ABN
- `recipients` — add, remove or rename the email choices employees see at submission. Add as many as you need, each with `{ label, email }`. Remove the placeholder addresses you don't actually use.

You can also edit the `CHECKLIST` object directly below CONFIG to add or remove inspection items per section.

## Adding your real logo

1. Save your logo as `logo.png` (or `logo.svg`) in the `icons/` folder. A square or short-rectangle logo works best.
2. In `index.html`, find this line near the top of `<body>`:
   ```html
   <div class="logo-box" id="logoBox">
     <span class="logo-fallback">EX</span>
   </div>
   ```
   Replace it with:
   ```html
   <div class="logo-box" id="logoBox">
     <img src="icons/logo.png" alt="Elexcom logo">
   </div>
   ```
3. Optional: replace `icons/icon-192.png`, `icon-512.png` and `icon-maskable-512.png` with PNGs based on your logo so the home-screen icon matches. The `maskable` version should have ~20% padding around the logo so Android doesn't crop it.

After changing files, bump `CACHE_VERSION` in `service-worker.js` (e.g. `v1.0.0` → `v1.0.1`) so installed copies pick up the update.

## How the email submission works

When the employee taps **Submit Inspection** they get two choices:

**📧 Send by Email / Share:**
- **On modern phones (iOS/Android, Chrome/Safari, Edge):** the device's native share sheet opens with the report as a `.txt` attachment plus all defect photos. The employee picks Gmail, Outlook, the work email app — whatever they use. The chosen recipient is pre-filled.
- **On older devices or PCs:** the default mail program opens (Outlook, Mail, etc.) with the recipient and full report body pre-filled. Photos are downloaded to the device for the employee to attach manually.

**📄 Save as PDF:** generates a branded multi-page PDF (header, vehicle details, full checklist as colour-coded tables, defects, full-page photos at the back) and downloads it to the device. The employee can then email/share it however they want, or file it.

Either way, the inspection is also saved to the device's history for the tracker.

No data is sent to any server — everything stays on the employee's device.

## Using the inspection tracker (`admin.html`)

Open `admin.html` (or tap the **📊 History** button in the header of the main app) to access the tracker.

**On a single shared device** (e.g. one tablet at the workshop): every inspection submitted from that device is automatically there. Perfect for a small fleet running off a single tablet.

**Across multiple devices** (e.g. each driver has their own phone): each device only shows its own submissions. To consolidate:
1. On each driver's device, open `admin.html` → tap **⬇ Export JSON Backup**.
2. They send you the resulting `.json` file (email, AirDrop, USB — whatever).
3. On your manager device, open `admin.html` → tap **⬆ Import JSON Backup** and select the file.
4. Submissions from that device are merged into your tracker. Duplicates are detected and skipped automatically.
5. Export the consolidated data to CSV any time from the same screen.

**Tip:** keep a regular JSON backup of your manager device — it's the only copy of historical data, since this is local-only by design.

If you outgrow the local-only model and want a proper centralised dashboard, the next step is connecting to a backend (Google Sheets via Apps Script, Airtable, Firebase, etc.). Drop me a line and I can wire that up.

## Browser support

- iOS Safari 14+
- Android Chrome / Edge / Samsung Internet (last 2 years)
- Desktop Chrome, Edge, Firefox, Safari (latest)

## Troubleshooting

**"Install" prompt doesn't appear** — Make sure the app is being served over HTTPS, not file:// or http://. Reload once the service worker is registered. iPhone users always install via Share → Add to Home Screen (no prompt by design).

**Updates aren't showing up** — Bump `CACHE_VERSION` in `service-worker.js`. Users may need to close and reopen the app once.

**Email opens but is empty** — The mailto fallback has a length limit on some clients. Most modern devices use the Web Share API instead, which has no such limit.

---

Built for Elexcom Pty Ltd. Adjust freely as your fleet processes evolve.
