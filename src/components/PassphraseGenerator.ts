/**
 * ============================================================================
 *           📖 DICEWARE PASSPHRASE & READABLE MEMORY DICTIONARY
 * ============================================================================
 * 
 * Project Name: Cryptographic WebAssembly Password Generator
 * Author: Sujal
 * Description: Implements highly secure passphrase extraction using compiled C++
 *              WebAssembly selectors from a robust, offline-compressed dictionary.
 * 
 * ============================================================================
 */

import { generatePasswordIndex } from "./WasmLoader";

// Memorable, high-quality, phonetically distinctive offline wordlist
const DICTIONARY: string[] = [
  "about", "above", "agent", "actor", "alias", "amber", "angel", "armor", "apple", "arrow",
  "audit", "avalon", "badge", "axiom", "baker", "basis", "beach", "beams", "berry", "bison",
  "blade", "blend", "blink", "block", "bloom", "blues", "brick", "cabin", "cable", "camel",
  "cargo", "cedar", "cloud", "crest", "crypt", "cycle", "debut", "delta", "depth", "diary",
  "draft", "earth", "error", "event", "exact", "fiber", "field", "flame", "fresh", "fudge",
  "gamma", "giant", "glide", "globe", "grace", "grape", "green", "guard", "guide", "haven",
  "hazel", "helix", "honey", "hover", "index", "input", "ionic", "ivory", "joint", "judge",
  "jungle", "kappa", "laser", "lemon", "level", "limit", "llama", "logic", "lumen", "macro",
  "mango", "maple", "match", "matrix", "medal", "melon", "merit", "metal", "micro", "minty",
  "model", "mount", "multi", "noble", "noise", "north", "ocean", "omega", "onion", "orbit",
  "ozone", "panel", "patch", "phase", "pilot", "pixel", "plain", "plant", "plate", "poker",
  "polar", "prime", "prism", "pulse", "quark", "radar", "radio", "range", "raspy", "razor",
  "realm", "relay", "rigid", "robot", "rover", "royal", "rusty", "sable", "saint", "scale",
  "scent", "scope", "scout", "setup", "shadow", "sharp", "shell", "shift", "shock", "shore",
  "sigma", "silky", "silver", "sketch", "skate", "slate", "slice", "solar", "sonic", "sound",
  "spark", "speak", "speed", "spire", "stage", "steam", "steel", "stone", "straw", "stray",
  "sugar", "suite", "sunny", "swift", "sword", "syrup", "table", "tango", "taste", "theme",
  "tiger", "toast", "token", "tonic", "topic", "touch", "toxic", "trace", "track", "trail",
  "trend", "tulip", "turbo", "unity", "vapor", "vector", "velvet", "venue", "viper", "virus",
  "visit", "vital", "vivid", "vocal", "vortex", "wagon", "water", "wheat", "whisper", "width",
  "worst", "woven", "xerox", "yacht", "yeast", "zebra", "zenith", "zesty", "zinc", "zipper"
];

// Phonetically easy-to-read syllables for generating "readable" but random passwords (e.g., "kovabu-92")
const VOWELS = ["a", "e", "i", "o", "u"];
const CONSONANTS = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "v", "w", "z"];

/**
 * Core cryptographic passphrase builder using Sujal's C++ random index calculations.
 */
export function generatePassphrase(
  numWords: number,
  separator: string,
  capitalize: boolean
): string {
  const words: string[] = [];
  const randomValues = new Uint32Array(numWords);
  window.crypto.getRandomValues(randomValues);

  for (let i = 0; i < numWords; i++) {
    // We pass the cryptographically secure random value and the dictionary size
    // straight into Sujal's C++ WebAssembly index mapper!
    const index = generatePasswordIndex(randomValues[i], DICTIONARY.length);
    let word = DICTIONARY[index];
    
    if (capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    
    words.push(word);
  }

  return words.join(separator);
}

/**
 * Generates an easily pronounceable (readable) password using a predictable phonetic syllable structure
 * while keeping it entirely random and cryptographically driven by C++/Wasm.
 */
export function generateReadablePassword(length: number): string {
  let result = "";
  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    // Alternate consonant/vowel structure
    if (i % 2 === 0) {
      const idx = generatePasswordIndex(randomValues[i], CONSONANTS.length);
      result += CONSONANTS[idx];
    } else {
      const idx = generatePasswordIndex(randomValues[i], VOWELS.length);
      result += VOWELS[idx];
    }
  }

  // Appends a random 2-digit high-performance suffix to satisfy standard password rules
  const extraVal = new Uint32Array(2);
  window.crypto.getRandomValues(extraVal);
  const numSuffix = (generatePasswordIndex(extraVal[0], 90) + 10).toString(); // 10 to 99
  
  return result + "-" + numSuffix;
}
