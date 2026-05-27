/**
 * ============================================================================
 *         🛡️ COGNITIVE CRYPTOGRAPHIC HUB (MAIN APPLICATION ENTRY)
 * ============================================================================
 * 
 * Project Name: Secure Password Generator with WebAssembly C++ Core
 * Author: Sujal (sujaldornal270506@gmail.com)
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
    <div id="root_container" className="min-h-screen bg-gray-950 text-gray-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-300 antialiased py-3 px-3 sm:px-6">
      
      {/* 1. ARCHITECTURAL HEADER & CORE STATUS */}
      <header className="max-w-4xl w-full mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-gray-900 mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl text-emerald-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-gray-100 via-gray-200 to-emerald-400 bg-clip-text text-transparent">
                Sujal's Secretum Engine
              </h1>
              <p className="text-xs text-gray-400 font-mono">
                C++ WebAssembly Symmetric Password Architect
              </p>
            </div>
          </div>
        </div>

        {/* Wasm Diagnostic Readout Badge */}
        <div className="flex items-center gap-2.5 bg-gray-900/60 p-2.5 px-3.5 rounded-xl border border-gray-800">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-mono text-gray-500 uppercase">Engine Status</span>
            <span className="text-[11px] font-mono font-medium text-gray-300">{wasmStatus.mode}</span>
          </div>
          <span className="relative flex h-2.5 w-2.5">
            {wasmStatus.loaded ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </>
            ) : (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
              </>
            )}
          </span>
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
              
              {/* Project Introduction */}
              <div className="space-y-2.5 pb-4 border-b border-gray-800">
                <h3 className="text-base font-semibold text-gray-200 flex items-center gap-2">
                  <BookOpen className="w-4.5 h-4.5 text-emerald-400" /> Cryptographic Context Briefly
                </h3>
                <div className="text-xs text-gray-300 space-y-3 leading-relaxed">
                  <p>
                    This application operates complete symmetric password and passphrase generators compiled entirely in high-performance <strong className="text-emerald-400">C++ WebAssembly (WASM)</strong> space inside the browser sandbox, authored and designed by <strong className="text-gray-100 font-bold">Sujal</strong>.
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
          <span>Project Author: <strong>Sujal</strong></span>
        </div>
      </footer>
    </div>
  );
}
