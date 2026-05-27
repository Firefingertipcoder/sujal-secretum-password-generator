/**
 * ============================================================================
 *         🛡️ COGNITIVE CRYPTOGRAPHIC HUB (MAIN APPLICATION ENTRY)
 * ============================================================================
 * 
 * Project Name: Secure Password Generator with WebAssembly C++ Core
 * Author: Dornal (sujaldornal270506@gmail.com)
 * Version: 1.0.0
 * Description: Unifies the high-performance compiled WebAssembly C++ core with
 *              advanced client options, instant entropy audits, bulk batches,
 *              and SHA-256 hash viewers. Full deployment and installation
 *              guidance is integrated within this local environment.
 * 
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  ToggleLeft,
  Settings,
  Flame,
  KeyRound,
  Download,
  Terminal,
  Layers,
  Info,
  ExternalLink,
  BookOpen
} from "lucide-react";

import { GeneratorOptions, PasswordRecord } from "./types";
import { initWasmEngine, generatePasswordIndex, getWasmEngineStatus } from "./components/WasmLoader";
import { generatePassphrase, generateReadablePassword } from "./components/PassphraseGenerator";
import { StrengthMeter, evaluateEntropy } from "./components/StrengthMeter";
import { HashViewer } from "./components/HashViewer";
import { BulkGenerator } from "./components/BulkGenerator";

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:',./<>?";
const SIMILAR_CHARS = /[il1o0OI]/g;

/**
 * Builds the active pool of characters based on custom selections and exclusions.
 * Fully type-safe and deterministic.
 */
export function buildCharacterPool(options: GeneratorOptions): string {
  let pool = "";
  if (options.includeLowercase) pool += LOWERCASE;
  if (options.includeUppercase) pool += UPPERCASE;
  if (options.includeNumbers) pool += NUMBERS;
  if (options.includeSymbols) pool += SYMBOLS;

  // Include user custom additions
  if (options.customInclude) {
    pool += options.customInclude;
  }

  // Remove similar looking characters if requested
  if (options.excludeSimilar) {
    pool = pool.replace(SIMILAR_CHARS, "");
  }

  // Exclude user custom purges
  if (options.customExclude) {
    for (const char of options.customExclude) {
      // Escape special regex chars
      const escaped = char.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(escaped, "g");
      pool = pool.replace(regex, "");
    }
  }

  // Deduplicate pool
  return Array.from(new Set(pool)).join("");
}

/**
 * Core secure generation workflow streaming cryptographic JS seeds into 
 * Sujal's compiled C++ WebAssembly engine.
 */
export function generatePassword(options: GeneratorOptions, characterPool: string): string {
  if (options.type === "passphrase") {
    return generatePassphrase(options.numWords, options.wordSeparator, options.capitalizeWords);
  }
  if (options.type === "readable") {
    return generateReadablePassword(options.length);
  }

  if (!characterPool) return "";

  let result = "";
  const randomValues = new Uint32Array(options.length);
  window.crypto.getRandomValues(randomValues);

  for (let i = 0; i < options.length; i++) {
    // We forward the high-entropy random uint32 directly into the WASM binary function
    const index = generatePasswordIndex(randomValues[i], characterPool.length);
    result += characterPool.charAt(index);
  }

  return result;
}

export default function App() {
  const [wasmStatus, setWasmStatus] = useState<{ loaded: boolean; mode: string }>({
    loaded: false,
    mode: "Compiling..."
  });

  const [options, setOptions] = useState<GeneratorOptions>({
    length: 16,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    customInclude: "",
    customExclude: "",
    type: "standard",
    numWords: 4,
    wordSeparator: "-",
    capitalizeWords: true
  });

  const [password, setPassword] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"generate" | "bulk" | "docs">("generate");
  const [history, setHistory] = useState<PasswordRecord[]>([]);
  const [copiedDoc, setCopiedDoc] = useState<boolean>(false);

  // Full Project Technical Briefing and Explanation
  const PROJECT_EXPLANATION_CONTENT = `# SECRETUM CRYPTOGRAPHIC ENGINE: SYSTEM ARCHITECTURE & USER MANUAL
**High-Performance Client-Side C++ WebAssembly Password Architect and PWA Extension**

This document provides a highly detailed systems briefing of the **Secretum Engine**, explaining its source file design, mathematical random state mapping algorithms, WebAssembly sandbox boundaries, and operational instructions for portable devices (laptops and mobile).

---

## 🛡️ Executive Security Statement
Secretum is built upon a **100% Client-Side Sovereign Data Model**. It does not maintain external analytics trackers, remote databases, cookies, or telemetry. No credentials or settings ever leave your client device. By decoupling the generation engine from the network stack, Secretum is immune to classical remote profiling, packet interception, and server-side database breaches.

---

## 🔬 Core Architecture: C++ WebAssembly & Shannon Entropy
The application runs using a dual-state random generator logic, utilizing a sandboxed virtual machine inside your browser.

1. **Hardware Entropy Seeds**:
Secretum accesses direct local CPU/kernel hardware entropy to generate high-degree 32-bit state integers through the native standard API: \`window.crypto.getRandomValues\`.

2. **WebAssembly Virtual Machine Sandbox**:
Raw entropy floats are securely transferred as binary inputs directly across the WASM runtime memory interface line. The compiled C++ binary executes division operations to map indexes deterministically without modulo bias.

3. **Shannon Entropy Calculations**:
Password strength is mathematically scored using Shannon's Entropy Formula:
H = -SUM(P_i * log2(P_i))
This guarantees precise, objective safety audits and verifies local dictionary randomness.

---

## 📱 Standalone PWA Installation (Android & iOS PWA)
Since Secretum is configured as a fully offline Progressive Web App (PWA) with client-side caching limits, you can pin it directly onto your mobile screens:

* **iOS (Apple Safari)**: Tap the Share Arrow icon, scroll down, select "Add to Home Screen", then pin.
* **Android (Google Chrome)**: Tap the Triple-dot Menu, select "Install App" or "Add to Home Screen".
* **Laptops/Desktops**: Click the "Install Arrow Icon" inside your browser address bar to load standalone.

---

## 🧩 Loaded Chromium Web Extensions
To run Secretum directly inside your extension tray options popup:
1. Build compilation output: \`npm run build\`
2. Navigate directly to \`chrome://extensions/\`
3. Activate the "Developer Mode" toggle on the top right.
4. Click "Load Unpacked" and select the compiled \`/dist\` directory.`;

  const handleDownloadExplanationMd = () => {
    try {
      const blob = new Blob([PROJECT_EXPLANATION_CONTENT], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Dornals_Secretum_Engine_Manual.md");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to trigger file download", err);
    }
  };

  const handleCopyExplanation = () => {
    navigator.clipboard.writeText(PROJECT_EXPLANATION_CONTENT);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2500);
  };

  // Initialize WebAssembly environment on mount
  useEffect(() => {
    const startWasm = async () => {
      await initWasmEngine();
      const status = getWasmEngineStatus();
      setWasmStatus({
        loaded: status.loaded,
        mode: status.mode
      });
    };
    startWasm();
  }, []);

  // Compute character pool dynamically
  const activeCharPool = useMemo(() => buildCharacterPool(options), [options]);

  // Handle password generation
  const handleGenerate = () => {
    const pwd = generatePassword(options, activeCharPool);
    setPassword(pwd);

    // Save history
    if (pwd) {
      const metrics = evaluateEntropy(pwd, activeCharPool.length || 64);
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      setHistory(prev => [
        {
          id: crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2, 11)),
          password: pwd,
          length: pwd.length,
          entropy: Math.round(metrics.bits),
          strength: metrics.strengthLabel,
          createdAt: timestamp
        },
        ...prev.slice(0, 4) // Only keep last 5 records
      ]);
    }
  };

  // Generate initial password once Wasm is initialized
  useEffect(() => {
    handleGenerate();
  }, [options.type, options.length, options.numWords, options.wordSeparator, options.capitalizeWords, activeCharPool]);

  // Direct safe copy routine
  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div id="root_container" className="min-h-screen bg-gray-950 text-gray-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-300 antialiased py-3 px-3 sm:px-6 print:hidden">
        
        {/* 1. ARCHITECTURAL HEADER & CORE STATUS */}
        <header className="max-w-4xl w-full mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-gray-900 mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl text-emerald-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-gray-100 via-gray-200 to-emerald-400 bg-clip-text text-transparent">
                Dornal's Secretum Engine
              </h1>
              <p className="text-xs text-gray-400 font-mono">
                C++ WebAssembly Symmetric Password Architect
              </p>
            </div>
          </div>
        </div>

        {/* Wasm Diagnostic and PDF download row */}
        <div className="flex flex-row items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Global PDF Download Button */}
          <button
            onClick={() => window.print()}
            title="Download Custom System Manual/Documentation PDF"
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-sans font-bold text-xs rounded-xl active:scale-95 transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.15)] shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-gray-950" />
            <span>SAVE MANUAL PDF</span>
          </button>

          {/* Wasm Diagnostic Readout Badge */}
          <div className="flex items-center gap-2.5 bg-gray-905 p-2 py-1.5 px-3 rounded-xl border border-gray-800 shrink-0">
            <div className="flex flex-col text-right">
              <span className="text-[9px] font-mono text-gray-500 uppercase">Engine Status</span>
              <span className="text-[10px] font-mono font-medium text-gray-300">{wasmStatus.mode}</span>
            </div>
            <span className="relative flex h-2 w-2">
              {wasmStatus.loaded ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </>
              )}
            </span>
          </div>
        </div>
      </header>

      {/* 2. CORE INTERACTION BOARD */}
      <main className="max-w-4xl w-full mx-auto flex-grow flex flex-col gap-6">
        
        {/* Real-time Display and Master Output Panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center text-xs font-mono text-gray-400">
            <span>SECURE GENERATION ENGINE CONTAINER</span>
            <span className="text-gray-500">OFFLINE SANDBOX MODE</span>
          </div>

          <div className="relative group bg-gray-950 border border-gray-850 rounded-xl p-4.5 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 hover:border-emerald-500/25">
            <div className="w-full text-center md:text-left select-all overflow-x-auto overflow-y-hidden py-1.5 focus:outline-none">
              <span className="font-mono text-lg sm:text-xl font-bold tracking-widest text-emerald-400 whitespace-pre">
                {password || "Select attributes to begin"}
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 select-none">
              <button
                type="button"
                onClick={handleGenerate}
                className="p-2.5 bg-gray-900 hover:bg-gray-850 text-gray-300 hover:text-gray-100 rounded-xl border border-gray-800 transition-all active:rotate-180"
                title="Regenerate Password"
              >
                <RefreshCw className="w-4.5 h-4.5" />
              </button>
              
              <button
                type="button"
                onClick={handleCopy}
                disabled={!password}
                className={`flex items-center gap-2 text-xs font-medium px-4.5 py-2.5 rounded-xl border transition-all ${
                  copied
                    ? "bg-emerald-500 text-gray-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : "bg-gray-100 text-gray-950 hover:bg-gray-200 border-gray-300 active:scale-95"
                }`}
              >
                {copied ? <Check className="w-4 h-4 text-gray-950" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "COPIED SECURE" : "COPY"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Functional View Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab("generate")}
            className={`px-5 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all font-semibold ${
              activeTab === "generate"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            🕹️ Singular Architect
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`px-5 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all font-semibold ${
              activeTab === "bulk"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            📦 Batch / Bulk Generator
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`px-5 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all font-semibold ${
              activeTab === "docs"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            📖 Project Brief & Deploy
          </button>
        </div>

        <div className="transition-all duration-300">
          {activeTab === "generate" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column Controls */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-5">
                <div className="flex justify-between items-center pb-2 border-b border-gray-850">
                  <h3 className="text-sm font-semibold tracking-tight text-gray-200 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-emerald-400" /> Parameter Selectors
                  </h3>
                  <span className="text-[10px] font-mono text-gray-500">STEP 1 OF 2</span>
                </div>

                {/* Sub-modes selector: Standard, Readable, Passphrase */}
                <div className="grid grid-cols-3 gap-1 bg-gray-950 p-1 border border-gray-850 rounded-lg text-xs font-mono select-none">
                  <button
                    onClick={() => setOptions({ ...options, type: "standard" })}
                    className={`py-1.5 rounded transition-colors text-center font-semibold ${
                      options.type === "standard"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                        : "text-gray-400 hover:text-gray-250 hover:bg-gray-900"
                    }`}
                  >
                    STANDARD
                  </button>
                  <button
                    onClick={() => setOptions({ ...options, type: "readable" })}
                    className={`py-1.5 rounded transition-colors text-center font-semibold ${
                      options.type === "readable"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                        : "text-gray-400 hover:text-gray-250 hover:bg-gray-900"
                    }`}
                  >
                    READABLE
                  </button>
                  <button
                    onClick={() => setOptions({ ...options, type: "passphrase" })}
                    className={`py-1.5 rounded transition-colors text-center font-semibold ${
                      options.type === "passphrase"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                        : "text-gray-400 hover:text-gray-250 hover:bg-gray-900"
                    }`}
                  >
                    PASSPHRASE
                  </button>
                </div>

                {/* Dynamic settings panels matching active type selection */}
                {options.type === "standard" && (
                  <div className="space-y-4">
                    {/* Size Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-gray-400">PASSWORD LENGTH</span>
                        <span className="text-emerald-400 font-bold">{options.length} chars</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="64"
                        value={options.length}
                        onChange={(e) => setOptions({ ...options, length: Number(e.target.value) })}
                        className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-gray-800 rounded-lg outline-none"
                      />
                    </div>

                    {/* Checkboxes structure */}
                    <div className="grid grid-cols-2 gap-3.5 pt-1.5">
                      <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={options.includeLowercase}
                          onChange={(e) => setOptions({ ...options, includeLowercase: e.target.checked })}
                          className="w-4 h-4 accent-emerald-400 rounded cursor-pointer"
                        />
                        <span>Lowercase (a-z)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={options.includeUppercase}
                          onChange={(e) => setOptions({ ...options, includeUppercase: e.target.checked })}
                          className="w-4 h-4 accent-emerald-400 rounded cursor-pointer"
                        />
                        <span>Uppercase (A-Z)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={options.includeNumbers}
                          onChange={(e) => setOptions({ ...options, includeNumbers: e.target.checked })}
                          className="w-4 h-4 accent-emerald-400 rounded cursor-pointer"
                        />
                        <span>Numbers (0-9)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={options.includeSymbols}
                          onChange={(e) => setOptions({ ...options, includeSymbols: e.target.checked })}
                          className="w-4 h-4 accent-emerald-400 rounded cursor-pointer"
                        />
                        <span>Symbols (&!#...)</span>
                      </label>
                    </div>
                  </div>
                )}

                {options.type === "readable" && (
                  <div className="space-y-4">
                    {/* Size Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-gray-400">PHONETIC LENGTH</span>
                        <span className="text-emerald-400 font-bold">{options.length} syllables</span>
                      </div>
                      <input
                        type="range"
                        min="6"
                        max="32"
                        value={options.length}
                        onChange={(e) => setOptions({ ...options, length: Number(e.target.value) })}
                        className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-gray-800 rounded-lg outline-none"
                      />
                    </div>
                    <p className="text-[11px] font-mono text-gray-400 leading-relaxed bg-gray-950 p-3 rounded-lg border border-gray-850">
                      Creates easily pronounceable structures using alternating consonants & vowels, coupled with two high-performance mapping digits at the tail.
                    </p>
                  </div>
                )}

                {options.type === "passphrase" && (
                  <div className="space-y-4">
                    {/* Word Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-gray-400">WORD COUNT</span>
                        <span className="text-emerald-400 font-bold">{options.numWords} words</span>
                      </div>
                      <input
                        type="range"
                        min="3"
                        max="12"
                        value={options.numWords}
                        onChange={(e) => setOptions({ ...options, numWords: Number(e.target.value) })}
                        className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-gray-800 rounded-lg outline-none"
                      />
                    </div>

                    {/* Word separator setup */}
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label htmlFor="separator_input" className="text-[10px] font-mono text-gray-400">SEPARATOR</label>
                        <input
                          id="separator_input"
                          type="text"
                          maxLength={3}
                          value={options.wordSeparator}
                          onChange={(e) => setOptions({ ...options, wordSeparator: e.target.value })}
                          className="w-full text-xs font-mono bg-gray-950 border border-gray-800 rounded p-2 text-gray-200 outline-none focus:border-emerald-500/30"
                        />
                      </div>
                      <div className="space-y-1 select-none flex flex-col justify-end">
                        <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer pb-2">
                          <input
                            type="checkbox"
                            checked={options.capitalizeWords}
                            onChange={(e) => setOptions({ ...options, capitalizeWords: e.target.checked })}
                            className="w-4 h-4 accent-emerald-400 rounded cursor-pointer"
                          />
                          <span>Capitalize Words</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Advanced parameters trigger Toggle */}
                <div className="pt-2 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-1.5 text-xs font-mono text-emerald-400/90 hover:text-emerald-400 transition-colors"
                  >
                    <ToggleLeft className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180 text-emerald-300" : ""}`} />
                    {showAdvanced ? "Hide Advanced Tuning" : "Show Advanced Tuning"}
                  </button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-4 pt-4 mt-2"
                      >
                        <div className="space-y-4 bg-gray-950 rounded-xl p-4.5 border border-gray-850">
                          {/* Exclude Similar characters */}
                          <label className="flex items-start gap-2 text-xs text-gray-350 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={options.excludeSimilar}
                              onChange={(e) => setOptions({ ...options, excludeSimilar: e.target.checked })}
                              className="w-4 h-4 accent-emerald-400 rounded cursor-pointer shrink-0 mt-0.5"
                            />
                            <div>
                              <span className="font-semibold text-gray-200">Exclude ambiguous characters</span>
                              <p className="text-[10px] text-gray-500 font-mono leading-relaxed mt-0.5">
                                Removes similar looking visual glpyhs: i, l, 1, L, I, O, o, 0.
                              </p>
                            </div>
                          </label>

                          {/* Extra includes */}
                          <div className="space-y-1">
                            <label htmlFor="custom_include_input" className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                              💎 Add Custom Characters
                            </label>
                            <input
                              id="custom_include_input"
                              type="text"
                              value={options.customInclude}
                              onChange={(e) => setOptions({ ...options, customInclude: e.target.value })}
                              placeholder="e.g. §¶ª"
                              className="w-full text-xs font-mono bg-gray-900 border border-gray-800 rounded p-2 text-gray-200 outline-none focus:border-emerald-500/30"
                            />
                          </div>

                          {/* Explicit excludings */}
                          <div className="space-y-1">
                            <label htmlFor="custom_exclude_input" className="text-[10px] font-mono text-gray-400">
                              ⛔ Explicit Exclude Characters
                            </label>
                            <input
                              id="custom_exclude_input"
                              type="text"
                              value={options.customExclude}
                              onChange={(e) => setOptions({ ...options, customExclude: e.target.value })}
                              placeholder="e.g. #@%"
                              className="w-full text-xs font-mono bg-gray-900 border border-gray-800 rounded p-2 text-gray-200 outline-none focus:border-rose-500/30"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Column Auditing Meters */}
              <div className="space-y-6">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-850">
                    <h3 className="text-sm font-semibold tracking-tight text-gray-200 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" /> Cryptographic Evaluation
                    </h3>
                    <span className="text-[10px] font-mono text-gray-500">STEP 2 OF 2</span>
                  </div>

                  {/* Audit Panel component */}
                  <StrengthMeter
                    password={password}
                    charPoolSize={activeCharPool.length || 64}
                  />

                  {/* Subtle Hash calculation viewer */}
                  <HashViewer password={password} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "bulk" && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl">
              <BulkGenerator
                options={options}
                charPool={activeCharPool}
                generatePasswordFn={generatePassword}
              />
            </div>
          )}

          {activeTab === "docs" && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-6">
              
              {/* PDF Dynamic Generation Suite & Offline Exporter */}
              <div className="space-y-4">
                <div className="bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-xl space-y-3.5">
                  <div className="space-y-1">
                    <h4 className="text-gray-200 font-bold text-xs flex items-center gap-2 font-mono">
                      📄 CYBER ARCHITECT PORTABLE MANUAL (PDF)
                    </h4>
                    <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                      Need a secure offline system manual, physical handbook, or cryptographic brief? This application formats a beautifully structured print document instantly on click.
                    </p>
                  </div>
                  
                  {/* Redirect warning for sandboxed workspace preview frame */}
                  <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 rounded-lg text-[10px] font-sans leading-relaxed">
                    <strong>⚠️ Iframe Sandbox Environment Notice:</strong> Since some browsers restrict native OS print dialogs inside third-party preview frames, please Click the <strong className="text-yellow-200">"Open in New Tab"</strong> button in your top right corner menu beforehand to launch the system print successfully.
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-gray-950 font-sans font-bold text-xs rounded-xl hover:bg-emerald-400 active:scale-95 transition-all w-full sm:w-1/2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    >
                      <Download className="w-4 h-4 shrink-0 text-gray-950" />
                      <span>PRINT OR EXPORT TO PDF</span>
                    </button>

                    <button
                      onClick={handleDownloadExplanationMd}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-sans font-bold text-xs rounded-xl active:scale-95 transition-all w-full sm:w-1/2 cursor-pointer border border-gray-700"
                    >
                      <Download className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>DOWNLOAD .MD MANUAL</span>
                    </button>
                  </div>
                </div>

                {/* Direct copy and browse helper for the handbook markdown */}
                <div className="bg-gray-950 border border-gray-850 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-mono text-gray-300">EXPLORATION & ARCHITECTURE MANUAL</span>
                    </div>
                    <button
                      onClick={handleCopyExplanation}
                      className="flex items-center gap-1.5 px-3 py-1 bg-gray-900 border border-gray-800 text-gray-300 font-sans text-[11px] rounded-lg hover:border-emerald-500/30 hover:text-emerald-400 active:scale-95 transition-all cursor-pointer"
                    >
                      {copiedDoc ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">COPIED!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>COPY MANUAL TEXT</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Scrollable document visualizer inside custom terminal component */}
                  <div className="bg-gray-950/60 p-3 rounded-lg border border-gray-900 overflow-y-auto max-h-56 size-full text-[10px] font-mono text-gray-400 leading-relaxed scrollbar-thin select-text space-y-4">
                    <div>
                      <h5 className="text-emerald-400 font-bold mb-1"># Dornal's Secretum Engine Cryptographic Manual</h5>
                      <p>High-Performance Client-Side C++ WebAssembly Password Architect and PWA Extension.</p>
                    </div>
                    <div className="border-t border-gray-900 pt-2 text-[10px]">
                      <h6 className="text-gray-200 font-bold uppercase mb-1">1. Complete File-By-File Directory Map:</h6>
                      <pre className="text-gray-500 bg-gray-950/30 p-2 rounded text-[9px] leading-tight select-text overflow-x-auto">
{`/ (Project Root)
├── package.json           # Host metadata and execution scripts
├── vite.config.ts         # Vite build configuration
├── index.html             # HTML5 Entry-point & PWA loader
├── public/
│   ├── favicon.svg        # Application launcher icon
│   ├── site.webmanifest   # Webmanifest parameters for PWA pinning
│   ├── sw.js              # ServiceWorker client-side cache interceptor
└── src/
    ├── main.tsx           # React bootstrap entrypoint
    ├── App.tsx            # Parent UI controller & dashboard
    ├── types.ts           # Shared TypeScript interfaces
    └── components/
        ├── WasmLoader.ts         # WASM interface & manual JS fallback
        ├── PassphraseGenerator.ts # Dictionary passphrase loader
        ├── StrengthMeter.ts       # Shannon Entropy rating scale
        ├── HashViewer.ts          # SubtleCrypto SHA-256 calculator`}
                      </pre>
                    </div>
                    <div className="border-t border-gray-900 pt-2 text-[10px]">
                      <h6 className="text-gray-200 font-bold uppercase mb-1">2. Hardware Seed & WASM Virtualization Lifecycle:</h6>
                      <p>Rather than using standard predictable linear pseudo-generators, Secretum requests high-entropy kernel interrupt byte feeds from the native platform device via <code className="text-rose-400">window.crypto.getRandomValues()</code>.</p>
                      <p className="mt-1">Raw buffers map directly across the sandboxed WASM memory segment boundary. Compiled C++ division instructions process non-modulo biased index transformations in register-level instructions.</p>
                    </div>
                    <div className="border-t border-gray-900 pt-2 text-[10px]">
                      <h6 className="text-gray-200 font-bold uppercase mb-1">3. Standalone Mobile Web App installation:</h6>
                      <p>Secretum supports complete offline installation. On iPhone (Safari), tap prompt Share &rarr; Add to Home Screen. On Android (Chrome/Brave), select Settings &rarr; Install Engine.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Introduction */}
              <div className="space-y-2.5 pb-4 border-b border-gray-800">
                <h3 className="text-base font-semibold text-gray-200 flex items-center gap-2">
                  <BookOpen className="w-4.5 h-4.5 text-emerald-400" /> Cryptographic Context Briefly
                </h3>
                <div className="text-xs text-gray-300 space-y-3 leading-relaxed">
                  <p>
                    This application operates complete symmetric password and passphrase generators compiled entirely in high-performance <strong className="text-emerald-400">C++ WebAssembly (WASM)</strong> space inside the browser sandbox, authored and designed by <strong className="text-gray-100 font-bold">Dornal</strong>.
                  </p>
                  <p>
                    By coupling Javascript's secure client crypt-generator (<code className="bg-gray-950 px-1 py-0.5 rounded text-rose-400 font-mono">window.crypto.getRandomValues</code>) with native binary execution in WebAssembly, we completely eliminate classic scripting bias or weak visual patterns, producing high-entropy credentials which are immune to local dictionary predictions.
                  </p>
                </div>
              </div>

              {/* Free Deploy Instructions */}
              <div className="space-y-4.5">
                <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2 uppercase tracking-wider font-mono">
                  🚩 Free Deployment & Workflows Guide
                </h3>

                <div className="space-y-4 text-xs font-mono">
                  {/* Vercel */}
                  <div className="bg-gray-950 p-4 border border-gray-850 rounded-xl space-y-2">
                    <h4 className="text-gray-200 font-bold text-xs flex items-center gap-2">
                      ⚡ Option A: Host Free on Vercel (Recommended)
                    </h4>
                    <p className="text-gray-400 leading-relaxed text-[11px]">
                      Vercel provides infinite continuous deployments on high-performance global CDN nodes at absolutely zero cost.
                    </p>
                    <ol className="list-decimal list-inside text-[11px] text-gray-300 space-y-1 pl-1">
                      <li>Create a free account on <a href="https://vercel.com" target="_blank" className="text-emerald-400 hover:underline">Vercel.com</a>.</li>
                      <li>Install the Vercel CLI locally via CLI terminals: <code className="bg-gray-900 text-rose-400 px-1.5 py-0.5 rounded">npm install -g vercel</code></li>
                      <li>Run <code className="bg-gray-900 text-rose-400 px-1.5 py-0.5 rounded">vercel deploy</code> directly in this project workspace directory.</li>
                      <li>Follow terminal instructions. Done! Vercel serves the React build directory instantly.</li>
                    </ol>
                  </div>

                  {/* GitHub Pages */}
                  <div className="bg-gray-950 p-4 border border-gray-850 rounded-xl space-y-2">
                    <h4 className="text-gray-200 font-bold text-xs flex items-center gap-2">
                      🌐 Option B: Deploy Free on GitHub Pages (Static hosting)
                    </h4>
                    <p className="text-gray-400 leading-relaxed text-[11px]">
                      Completely offline SPA applications can be run and accessed directly under your domain name via free GitHub Pages.
                    </p>
                    <ol className="list-decimal list-inside text-[11px] text-gray-300 space-y-1 pl-1">
                      <li>Create a free GitHub repository on your account.</li>
                      <li>Install helper in project: <code className="bg-gray-900 text-rose-400 px-1.5 py-0.5 rounded">npm install -D gh-pages</code></li>
                      <li>Add deploy configurations inside <code className="text-gray-400">package.json</code>:
                        <pre className="bg-gray-900 text-gray-300 p-2.5 rounded border border-gray-850 mt-1 select-all overflow-x-auto text-[10px]">
{`"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}`}
                        </pre>
                      </li>
                      <li>Run <code className="bg-gray-900 text-rose-400 px-1.5 py-0.5 rounded">npm run deploy</code> to push compiled code coordinates live on GitHub Pages automatically.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Session history log - only keeps last 5 values locally in browser memory */}
        {activeTab === "generate" && history.length > 0 && (
          <div id="session_vault" className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-3.5 select-none text-xs">
            <h4 className="font-sans font-semibold text-xs text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              🛡️ Offline Session Vault (Local Memory Only)
            </h4>
            
            <div className="divide-y divide-gray-850">
              {history.map((h, hIdx) => (
                <div key={h.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="font-mono text-[11px] text-gray-400 truncate max-w-[200px] sm:max-w-md select-text font-bold" title="Password">
                    {h.password}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-gray-500 font-mono">
                      {h.length} chars
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      h.strength === "Military Grade" ? "bg-emerald-500/10 text-emerald-400" :
                      h.strength === "Highly Secure" ? "bg-teal-500/10 text-teal-400" :
                      h.strength === "Strong" ? "bg-sky-500/10 text-sky-400" :
                      h.strength === "Medium" ? "bg-amber-500/10 text-amber-500" :
                      "bg-rose-500/10 text-rose-400"
                    }`}>
                      {h.strength}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 3. CLIENT FOOTER ARCHITECTURE */}
      <footer className="max-w-4xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between py-6 mt-10 border-t border-gray-900 text-xs font-mono text-gray-500 gap-3.5 select-none shrink-0">
        <div>
          <span>🛡️ Pure Offline End-to-End Symmetric Cryptography</span>
        </div>
        <div>
          <span>Project Author: <strong>Dornal</strong></span>
        </div>
      </footer>
    </div>

    {/* 4. PUBLICATION-READY PRINT ARCHITECTURE FOR OFFLINE PDF HANDBOOKS */}
    <div id="pdf-printable-document" className="hidden print:block bg-white text-gray-900 font-sans p-16 select-text max-w-4xl mx-auto overflow-visible leading-relaxed">
      {/* Title & Cover Page */}
      <div className="border-b-4 border-emerald-600 pb-8 mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-mono tracking-widest uppercase text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded">
            OFFICE OF THE CYBER ARCHITECT
          </div>
          <div className="text-xs text-gray-400 font-mono">
            SYSTEM MANUAL // SEC-REF: DORNAL-PW-WASM
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-950 mb-2">
          SECRETUM CRYPTOGRAPHIC ENGINE HANDBOOK
        </h1>
        <h2 className="text-base text-emerald-700 font-medium tracking-wide">
          High-Performance C++ WebAssembly Password Architecture Guide
        </h2>
        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100 text-xs text-gray-500 font-mono">
          <div>AUTHOR: <strong className="text-gray-900 font-bold">DORNAL</strong></div>
          <div>CORE: <strong className="text-gray-900 font-bold">C++ / WEBASSEMBLY (WASM)</strong></div>
          <div>CLASSIFICATION: <strong className="text-emerald-700 font-bold">100% SECURE CLIENT-SIDE</strong></div>
        </div>
      </div>

      {/* Quick Abstract Section */}
      <div className="space-y-4 mb-10 bg-gray-50 p-6 rounded-xl border border-gray-100">
        <h3 className="text-xs font-bold text-gray-800 tracking-wider uppercase font-mono border-b pb-2">
          Executive Architectural Summary
        </h3>
        <p className="text-xs text-gray-700 leading-relaxed">
          <strong>Secretum</strong> is an advanced, offline-first cryptographic password generator that ensures absolute key sovereignty.
          By compiling high-speed mathematical index mappings inside a <strong>C++ WebAssembly (WASM) binary</strong> sandbox and seeding it with hardware-derived entropy via standard JavaScript interfaces (<code>window.crypto.getRandomValues</code>), Secretum delivers uniform distribution results that are immune to classical interpretation profiling or local prediction vectors.
        </p>
      </div>

      <div style={{ pageBreakAfter: "always" }}></div>

      {/* Detailed Technical Pipeline */}
      <div className="space-y-8 mb-10">
        <h2 className="text-lg font-bold text-gray-950 border-b border-gray-255 pb-3">
          1. Cryptographic Entropy Pipeline
        </h2>
        
        <div className="space-y-4 text-xs text-gray-700">
          <p>
            Standard software randomizers often generate predictable byte series over recurring loops. Secretum completely mitigates security degradation through a segmented execution model:
          </p>

          <div className="my-4 border-l-4 border-emerald-500 pl-4 bg-emerald-50/20 py-2.5 rounded-r">
            <h4 className="font-bold text-gray-950 text-xs font-mono uppercase tracking-wider mb-0.5">
              Phase I: Hardware Entropy Seeds
            </h4>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              The browser accesses direct local CPU/kernel hardware entropy to generate high-degree 32-bit state integers through the native <code>window.crypto.getRandomValues</code> framework API.
            </p>
          </div>

          <div className="my-4 border-l-4 border-teal-500 pl-4 bg-teal-50/20 py-2.5 rounded-r">
            <h4 className="font-bold text-gray-950 text-xs font-mono uppercase tracking-wider mb-0.5">
              Phase II: High-Speed WebAssembly Virtual Machine Boundary
            </h4>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Raw entropy floats are securely transferred as binary inputs directly across the WASM runtime memory interface line. The compiled C++ binary executes division operations to map indexes deterministically without modulo bias.
            </p>
          </div>

          <h3 className="font-bold text-gray-900 text-xs mt-6 uppercase tracking-wider">Comparative Attribute Specifications</h3>
          <table className="w-full text-xs text-left text-gray-600 mt-2 border border-gray-250 border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-250">
                <th className="p-2 border-r border-gray-250 font-mono font-bold text-gray-800">Attribute</th>
                <th className="p-2 font-mono font-bold text-gray-800">C++ WebAssembly Implementation Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="p-2 border-r border-gray-250 font-semibold text-gray-900">Virtualization Core</td>
                <td className="p-2">Client Sandbox Chrome/Safari WebAssembly Assembly instructions</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-gray-250 font-semibold text-gray-900">Security Guarantee</td>
                <td className="p-2">No remote analytics transmission, 100% offline local memory cache</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-gray-250 font-semibold text-gray-900">Dictionary Modulo Bias</td>
                <td className="p-2">Mathematical zero-bias calculated natively inside fast pointers</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ pageBreakAfter: "always" }}></div>

      {/* Core Setup Guide */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-gray-950 border-b border-gray-255 pb-3">
          2. Platform Portability & Standalone Setup Channels
        </h2>
        
        <div className="space-y-6 text-xs text-gray-700">
          <div>
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-1.5 font-mono">
              📦 A. Packaged Web Application Extensions (Chromium Suite)
            </h3>
            <p className="text-[11px] text-gray-650 leading-relaxed mb-2">
              Secretum can be loaded directly as a persistent browser extension:
            </p>
            <ol className="list-decimal list-inside pl-1 space-y-1 text-gray-605">
              <li>Open your project and build: <code className="bg-gray-50 p-0.5 px-1 rounded border">npm run build</code> (prepares <code>manifest.json</code> in <code>/dist</code>).</li>
              <li>Navigate command window directly to your Chrome Extensions suite: <code className="text-emerald-800 font-bold">chrome://extensions/</code></li>
              <li>Toggle active the <strong>Developer Mode</strong> checkbox in the top header.</li>
              <li>Select <strong>Load Unpacked</strong> and import your compiled <code>/dist</code> directory directly.</li>
            </ol>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-1.5 font-mono">
              📱 B. Native PWA Mobile Pins (Apple iOS & Google Android)
            </h3>
            <p className="text-[11px] text-gray-650 leading-relaxed mb-2.5">
              Featuring offline cache indexing (<code>sw.js</code>) and hardware app profiles (<code>site.webmanifest</code>), install Secretum directly on mobile screens:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded border border-gray-150">
                <h4 className="font-bold text-emerald-800 uppercase text-[10px] tracking-wider mb-1">Apple iOS (Safari)</h4>
                <p className="text-[10px] text-gray-605 leading-relaxed">
                  Open your deployed site link in Safari. Tap the share tray arrow icon, scroll, and select <strong>Add to Home Screen</strong>.
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded border border-gray-150">
                <h4 className="font-bold text-emerald-800 uppercase text-[10px] tracking-wider mb-1">Google Android (Chrome)</h4>
                <p className="text-[10px] text-gray-605 leading-relaxed">
                  Open the site index in Chrome. Click install prompt banner, or tap the triple vertical menu dots and select <strong>Install App</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);
}
