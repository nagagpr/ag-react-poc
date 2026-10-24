# AG Grid POC: React → AWS Amplify → OutSystems 11

A single-page React + AG Grid app, hosted on AWS Amplify (HTTPS), shown inside an
OutSystems 11 Traditional Web screen through an `<iframe>`.

```
OutSystems 11 screen (your server)
└── Expression widget with <iframe src="https://main.xxxx.amplifyapp.com">
        └── React + AG Grid app (static files hosted by AWS Amplify)
                └── data: built-in sample rows, or your API (optional, e.g. FastAPI)
```

The grid shows 500 sample orders with sorting, column filters, a search box, paging,
row checkboxes, CSV export, and editable **Qty** and **Status** cells (Total recalculates).

---

## Step 0: Install the tools (one time)

| Tool | Why | Get it |
|---|---|---|
| Node.js **22 LTS** (or 20.19+) | Runs and builds the React app | https://nodejs.org |
| Git | Needed only for the GitHub deploy option | https://git-scm.com |
| AWS account | Hosts the app on Amplify | https://aws.amazon.com |
| OutSystems Service Studio 11 | Builds the screen that embeds the grid | Your OutSystems environment |

Check them in a terminal (PowerShell is fine):

```powershell
node -v
npm -v
git --version
```

---

## Step 1: Run the app on your computer

Open a terminal in this folder (`D:\Work\AI_Work\ag-react-poc`):

```powershell
npm install
npm run dev
```

Open **http://localhost:5173**. You should see the Orders grid. Try:

- Typing in **Search all columns** (for example `Contoso Germany`)
- Clicking a column header to sort, or typing in the small box under a header to filter
- Double-clicking a **Qty** or **Status** cell to edit it
- Ticking rows, then **Export N selected**

Edit any file in `src/` and the browser updates immediately. Press `Ctrl+C` in the terminal to stop.

### What each file does

| File | Purpose |
|---|---|
| `src/App.jsx` | The page: toolbar, grid, column definitions, grid options |
| `src/App.css` | Page styling (full height, so the grid fills the iframe) |
| `src/data/sampleData.js` | Generates the 500 sample orders |
| `src/data/loadRows.js` | Loads rows from sample data, or from an API if `VITE_API_URL` is set |
| `index.html`, `src/main.jsx` | Entry point that mounts React |
| `vite.config.js` | Build settings (`base: './'` makes asset paths relative) |
| `amplify.yml` | Build instructions Amplify uses when deploying from GitHub |
| `iframe-test.html` | Local "pretend OutSystems" page to test the iframe (dev only, not deployed) |
| `.env.example` | Template for pointing the grid at a real API |

---

## Step 2: Build the production version

```powershell
npm run build
```

This creates a `dist` folder containing `index.html` and an `assets` folder. **That folder is the
whole website.** Preview exactly what will be deployed:

```powershell
npm run preview
```

Open **http://localhost:4173**.

---

## Step 3: Test inside an iframe locally (before touching OutSystems)

Keep `npm run preview` running, open a **second** terminal, and run `npm run dev`. Then open:

```
http://localhost:5173/iframe-test.html?src=http://localhost:4173/
```

The grid should appear inside the dark-headed "pretend OutSystems" page. This is the same
`<iframe>` markup you will put in OutSystems. You can paste any URL in the box at the top,
including your Amplify URL after Step 4.

---

## Step 4: Deploy to AWS Amplify (HTTPS hosting)

Choose **one** option. Option A is quickest for a first POC. Option B redeploys automatically every
time you push code.

### Option A: Upload a zip file (no Git needed)

1. Build and zip the site in one command:

   ```powershell
   npm run zip
   ```

   This creates `ag-grid-poc.zip` in the project folder, with `index.html` at the top level.
   Don't zip `dist` by right-clicking it or with PowerShell's `Compress-Archive`. Those either
   wrap the files in a `dist` folder or store paths with backslashes, and Amplify then serves a
   blank page. `npm run zip` uses Windows' built-in `tar`, which avoids both problems.

2. Sign in to the AWS Console and open **AWS Amplify** (https://console.aws.amazon.com/amplify).
   Pick a region near your users (top-right corner).
3. Click **Create new app**, then choose **Deploy without Git**, then **Next**.
4. Enter an **App name** (for example `ag-grid-poc`) and a **Branch name** (for example `main`).
5. Choose **Drag and drop**, drop `ag-grid-poc.zip`, and click **Save and deploy**.
6. After about a minute the status shows **Deployed**. Copy the **Domain** URL. It looks like
   `https://main.d1a2b3c4d5e6f7.amplifyapp.com`.

**To update later:** run `npm run zip` again. Then in Amplify open the app, open the branch,
choose **Deploy updates**, and drop the new zip.

### Option B: Connect GitHub (automatic deploys)

1. On https://github.com create an **empty** repository named `ag-react-poc` (no README).
2. In this folder, run these commands, replacing `<your-user>` with your GitHub username:

   ```powershell
   git init
   git add .
   git commit -m "AG Grid POC"
   git branch -M main
   git remote add origin https://github.com/<your-user>/ag-react-poc.git
   git push -u origin main
   ```

   `.gitignore` already excludes `node_modules`, `dist` and `*_pat.txt` token files. Amplify
   builds the app itself. Before the first push, run `git status` and make sure no secrets are
   listed. On the first `git push`, Git for Windows opens a browser window to sign in to
   GitHub, so you don't need to keep a personal access token in a file.
3. In the Amplify console click **Create new app**, choose **GitHub**, authorize AWS, then pick the
   repository and the `main` branch.
4. Amplify detects `amplify.yml` from this repo, which installs Node 22, runs `npm ci` and
   `npm run build`, and publishes `dist`. Keep it as is and click **Next**, then **Save and deploy**.
5. Copy the **Domain** URL when the build turns green.

**To update later:** `git add .`, then `git commit -m "..."`, then `git push`. Amplify rebuilds automatically.

### Check the deployment

- Open the Amplify URL directly. The grid should load.
- Open `http://localhost:5173/iframe-test.html?src=<your Amplify URL>` (with `npm run dev`
  running). The grid should load inside the frame.

---

## Step 5: Embed it in OutSystems 11 (Traditional Web)

1. Open your Traditional Web module in **Service Studio**.
2. **Interface** tab → **UI Flows** → right-click **MainFlow** → **Add Web Screen** → choose an
   empty screen → name it `AGGridPOC`.
3. From the widget toolbox, drag an **Expression** widget onto the screen's main content area.
4. Select the Expression and set these properties:
   - **Escape Content** = `No` (otherwise the browser shows the HTML as text)
   - **Value**: paste the following. It is an OutSystems text, so it is wrapped in double quotes
     and the HTML inside uses single quotes. Replace the URL with yours:

   ```
   "<iframe src='https://main.d1a2b3c4d5e6f7.amplifyapp.com/' title='AG Grid POC' width='100%' height='800' style='border:0;display:block;'></iframe>"
   ```

5. Check the screen's **Roles** (Anonymous, or Registered if users must log in).
6. Click **1-Click Publish**, then **Open in Browser**, and navigate to the `AGGridPOC` screen.

### Make the URL configurable (recommended once it works)

1. **Data** tab → right-click **Site Properties** → **Add Site Property**. Name it `AGGridUrl`,
   set Data Type to `Text`, and set Default Value to `"https://main.d1a2b3c4d5e6f7.amplifyapp.com/"`.
2. Change the Expression **Value** to:

   ```
   "<iframe src='" + Site.AGGridUrl + "' title='AG Grid POC' width='100%' height='800' style='border:0;display:block;'></iframe>"
   ```

3. Publish. In each environment you can now change the URL in **Service Center** → **Factory** →
   **Modules** → your module → **Site Properties** without republishing.

**Height:** the grid fills whatever height the iframe has, so change `height='800'` to suit your layout.

---

## Step 6: Lock down who can embed the grid (security headers)

Do this **after** Step 5 works, so you know any new blank iframe is caused by this step.

### A. Amplify side: allow only your OutSystems server to frame the app

In Amplify: open your app → **Hosting** → **Custom headers** → **Edit**, and paste the YAML
below. Replace the origin with the **exact** scheme, host and port shown in the browser address
bar on your OutSystems page (for example `http://localhost`, `http://my-pc`, or
`https://myserver.company.com`):

```yaml
customHeaders:
  - pattern: '**'
    headers:
      - key: 'Content-Security-Policy'
        value: "frame-ancestors 'self' https://your-outsystems-server"
```

To list several allowed parents, separate them with spaces, for example
`frame-ancestors 'self' http://localhost:5173 https://your-outsystems-server`. Add
`http://localhost:5173` if you still want `iframe-test.html` to work. With Option B (GitHub) you
can instead commit this YAML as `customHttp.yml` in the repo root.

### B. OutSystems side: only needed if Content Security Policy is enabled

If your OutSystems environment has CSP turned on, it must allow the Amplify URL as a frame
source. Open **LifeTime** → **Environments** → *your environment* → **Environment Security** →
**Content Security Policy**. On installations without LifeTime, use **Service Center** →
**Administration** → **Security**. Add your Amplify origin (for example
`https://main.d1a2b3c4d5e6f7.amplifyapp.com`) to **Child-src**, then save. OutSystems turns
**Child-src** into the page's `frame-src` rule. Menu names can differ slightly between platform
versions. If you can't see these settings, ask your OutSystems platform administrator. Don't
replace the policy with a `*` wildcard.

---

## Step 7 (optional): Load real data from an API such as FastAPI

Out of the box the grid uses built-in sample data. To use an API:

1. Make the API return a JSON array with these field names. You can also change the `field`
   names in `columnDefs` in `src/App.jsx` to match your API:

   ```json
   [{ "orderId": "ORD-1", "orderDate": "2026-05-11", "customer": "Contoso Ltd", "country": "India",
      "product": "Webcam HD", "category": "Electronics", "quantity": 3, "unitPrice": 89, "status": "Pending" }]
   ```

2. Allow the grid's origin in FastAPI (CORS):

   ```python
   from fastapi.middleware.cors import CORSMiddleware

   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173", "https://main.d1a2b3c4d5e6f7.amplifyapp.com"],
       allow_methods=["GET"],
       allow_headers=["*"],
   )
   ```

3. Copy `.env.example` to `.env` and set `VITE_API_URL`, for example
   `VITE_API_URL=http://localhost:8000/orders` for local testing. Restart `npm run dev`.
   The footer shows which data source is in use.
4. **For the hosted app**, the API must be on a public **HTTPS** address. An HTTPS page on Amplify
   can't reliably call `http://localhost:8000`, and other users' browsers can never reach your PC.
   - Option A (zip): put the HTTPS URL in `.env`, run `npm run zip` again, and re-upload.
     The URL is fixed when the app is built.
   - Option B (GitHub): add `VITE_API_URL` under Amplify → **Hosting** → **Environment
     variables**, then redeploy.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| OutSystems shows the `<iframe ...>` text instead of the grid | Escape Content is `Yes` | Set the Expression's **Escape Content** to `No` |
| Service Studio shows a syntax error in the Expression | Double quotes inside the text | Use single quotes inside the HTML, as in Step 5 |
| Iframe blank; console says *Refused to frame … violates … "frame-ancestors"* | Amplify header doesn't list your OutSystems origin | Fix the origin in Step 6A (scheme + host + port must match exactly) |
| Iframe blank; console says *Refused to frame … "frame-src"* or *"child-src"* | OutSystems CSP blocks the Amplify URL | Step 6B |
| Iframe blank with a *mixed content* error | OutSystems page is HTTPS but the iframe URL is `http://` | Use the HTTPS Amplify URL |
| Amplify URL shows a white page or 404s | Zip has a `dist` folder inside, or backslash paths (`Compress-Archive`) | Create the zip with `npm run zip` (Option A) |
| Amplify build fails with *Vite requires Node.js version 20.19+* | Old Node on the build image | Keep the `nvm install 22` lines in `amplify.yml` |
| Red banner *Could not load data* | API URL wrong, CORS not allowed, or HTTP API from an HTTPS page | Step 7; check the browser DevTools **Network** tab |
| Grid is squashed or has a double scrollbar | Iframe too short | Increase `height` in the iframe markup |

To open DevTools in Chrome or Edge, press `F12` and look at the **Console** tab.

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (first time, or after pulling changes) |
| `npm run dev` | Development server at http://localhost:5173 with live reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve `dist/` at http://localhost:4173 |
| `npm run zip` | Build, then create `ag-grid-poc.zip` for Amplify drag-and-drop |
