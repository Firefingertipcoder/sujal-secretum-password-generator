# 🛡️ Secure WebAssembly (C++) Password Generator

Welcome to **Secretum Engine**, a modern, high-performance, cryptographically secure offline password and passphrase generator designed with a native **C++ WebAssembly (WASM)** core and a fully responsive **React/Tailwind CSS** application interface. 

This project operates entirely on the client-side of the user's browser, enforcing complete data isolation and ensuring generated credentials never leave your workspace.

**Project Author:** Dornal (sujaldornal270506@gmail.com)

---

## ✨ Primary Capabilities

1. **⚡ Cryptographic WebAssembly Mapping Engine:** Uses a compiled high-performance linear congruential logic module from native **C++** in WebAssembly (`generate_password_index`), eliminating typical scripting bias or visual repeating patterns.
2. **🕹️ Intuitive Parameter Controls:** Supports standard, readable (phonetic), or standard multi-word passphrase selections. Includes sliders for size tuning, toggles for lower/upper/number/symbol pools, and custom literal inclusions/exclusions.
3. **📊 Theoretical and Real-time Structural Metrics:** Dynamically assesses password strength through pool complexity (Total Potential Entropy Bits) and literal character repetition (Shannon Entropy Index).
4. **🕰️ Multi-tier Brute Force Time Predictor:** Maps crack speeds across consumer computers, custom high-performance mining GPU loops, specialized supercomputer scientific clusters, and potential quantum decrypt attacks (using Grover's search boundaries, $O(\sqrt{N})$ complexity).
5. **📦 Multi-row Bulk Batch Generator:** Dynamically compiles batches of up to 100 high-entropy passwords simultaneously, with individual metric logs, spreadsheet layout displays, and instant local exports (clean `.txt`, `.csv`, or structured `.json` formats).
6. **🔑 Reversible-proof Hashing Viewer:** Dynamically generates SHA-256 digests of active credentials completely client-side utilizing the local browser Web Cryptography APIs.

---

## 🛠️ System Architecture

The application couples robust native logic with modern reactive view design:

```
[Web Browser Client]
   │
   ├──> React Frontend (App.tsx & Tailwind UI Utilities)
   │       │
   │       ├──> 1. Secure Random Seeds Generator (window.crypto.getRandomValues())
   │       │       │
   │       │       └──> 2. WebAssembly Bridge Module (WasmLoader.ts) 
   │       │               │
   │       │               └──> 3. Native Compiled C++ Kernel (password_generator.cpp)
   │       │                       - Knuth's Linear Congruential State Transition
   │       │                       - Cryptographic range indexing mapping [O(1)]
   │
   └──> Metric Assessment (StrengthMeter.tsx) & Local Secure Exports (BulkGenerator.tsx)
```

---

## 💻 Working with the C++ Source (How to Compile)

The native logic resides inside `/src/cpp/password_generator.cpp`. To compile or edit this code yourself, use the Emscripten SDK compiler:

1. Install the emscripten toolchain on your computer:
   ```bash
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk
   ./emsdk install latest
   ./emsdk activate latest
   source ./emsdk_env.sh
   ```
2. Compile the C++ program directly into highly optimized WebAssembly byte arrays:
   ```bash
   emcc -O3 -s WASM=1 \
        -s EXPORTED_FUNCTIONS="['_generate_password_index']" \
        -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap']" \
        -o password_generator.js password_generator.cpp
   ```
3. The resulting WebAssembly binary buffer is loaded and executed dynamically in the browser sandbox via `/src/components/WasmLoader.ts`.

---

## ⚙️ Local Development Settings

To launch the project workspace locally for debugging or iteration, execute:

```bash
# 1. Install all pre-declared dependencies
npm install

# 2. Start the local Vite developer server
npm run dev
```

---

## 🚀 Free Hosting & Cloud Deployment Workflows

Since the application is 100% offline-compatible and self-contained, hosting can be completed completely free of charge.

### 🌐 Option A: Host Free on GitHub Pages (Static Hosting)

Deploy seamlessly using standard static folder pipelines:

1. Create a free, empty repository on your GitHub account (e.g., `secure-pass-gen`).
2. Add the dynamic deploy packages inside your workspace:
   ```bash
   npm install -D gh-pages
   ```
3. Open `package.json` and insert a custom deployment target script:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
4. Push your codebase coordinates live:
   ```bash
   npm run deploy
   ```
5. Enable GitHub Pages on your repository settings tab pointing to the `gh-pages` branch. Your password generator is live.

---

### ⚡ Option B: Host Free on Vercel (Continuous Deployment)

Vercel offers global CDN speedups, preview URLs, and infinite deployments without any payment:

1. Create a free profile on [Vercel](https://vercel.com).
2. Install the lightweight Vercel global command tool:
   ```bash
   npm install -g vercel
   ```
3. Simply execute the start command inside this project root folder:
   ```bash
   vercel
   ```
4. Follow the interactive screen prompts to select project targets. Vercel automatically builds and deploys your workspace directly.

---

### 🧩 Option C: Pack and Load as a Google Chrome Extension (Web Extension)

You can run this password architect instantly inside your browser header bar as a convenient utility pop-up:

1. Compile the static application build:
   ```bash
   npm run build
   ```
   *Vite compiles the React engine and places your security manifest (`manifest.json`) in the newly generated `/dist` folder.*
2. Open your Google Chrome or Brave/Edge browser.
3. Access the extensions dashboard page:
   - Navigate to `chrome://extensions/` directly in the address bar.
   - Or click the **Puzzle Piece** icon and choose **Manage Extensions**.
4. Active the **Developer Mode** toggle switch at the upper-right corner of the window.
5. In the upper-left, click the **Load Unpacked** button.
6. Select your project's `/dist` folder directories from your computer files explorer.
7. Click the **Extension Pin** icon to pin **Secretum** to your menu list. You're done! Clicking it opens the secure C++ compiled generator directly.

---

### 📱 Option D: Install as a Standalone App (PWA) on Mobile & Laptops

Since Secretum is a fully-functioning Progressive Web App with off-grid logic caching, you can pin it directly as a native standalone application on your local home screens:

1. **On Apple iOS (iPhone/iPad):**
   - Open your hosted Secretum website link or URL inside the native **Safari** browser app.
   - Tap the central **Share** menu button (rectangle icon with an up-pointing arrow).
   - Scroll down the list of options and select **Add to Home Screen**.
   - Tap **Add** at the top right. A high-contrast launcher icon appears instantly on your screen, operating standalone with its custom status bar settings.

2. **On Google Android (Samsung/Pixel/etc.):**
   - Launch your hosted Secretum link inside modern browsers like **Chrome** or **Firefox**.
   - A contextual overlay banner showing **"Add Secretum to Home screen"** will automatically slide up.
   - If not visible, tap the menu button (triple-dots) and click **Install App** or **Add to Home Screen**.

3. **On Laptop Computers (macOS / Windows / Linux):**
   - Access the link inside Google Chrome, Microsoft Edge, or Brave.
   - Tap the **App Install** download arrow icon that shows up in the right side of the URL navigation bar.
   - Done! Secretum opens in a clean, borderless system frame, completely separated from web page tabs.

---

## 🛡️ Symmetric Client Security Guarantees

* **Zero Cloud Databases:** No cookies, remote analytics trackers, or servers are ever deployed to track, gather, or preserve your generated credentials.
* **Secured Cryptographic Anchors:** Uses native platform level entropy arrays (`window.crypto.getRandomValues`) containing physical local system ambient noises or CPU state parameters, completely bypassing typical predictable `Math.random` loopholes.

*Designed with ❤️ and built on modern WebAssembly parameters by **Dornal**.*
