/**
 * ============================================================================
 *               📐 GLOBAL HOOKS & TYPES INTERFACES
 * ============================================================================
 * 
 * Project Name: Cryptographic WebAssembly Password Generator
 * Author: Sujal
 * 
 * This file declares state management shapes and interfaces.
 * 
 * ============================================================================
 */

export type PasswordType = 'standard' | 'passphrase' | 'readable';

export interface GeneratorOptions {
  length: number;
  includeLowercase: boolean;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean; // Avoid similar characters: i, l, I, 1, o, 0, O, o, etc.
  customInclude: string;   // Extra chars user wants to enforce
  customExclude: string;   // Chars user explicitly wants to purge
  type: PasswordType;
  numWords: number;        // Passphrase size
  wordSeparator: string;   // Separator character e.g., '-', '_', ' '
  capitalizeWords: boolean;// True to CamelCase the passphrase words
}

export interface EntropyDetails {
  bits: number;
  strengthLabel: 'Weak' | 'Medium' | 'Strong' | 'Highly Secure' | 'Military Grade';
  timeBruteForce: string;     // Generic home rig speed
  timeSupercomputer: string;  // High performance computing speed
  timeQuantum: string;        // Future quantum threat speed
  shannonEntropy: number;
  uniquenessScore: number;    // % of distinct characters
}

export interface PasswordRecord {
  id: string;
  password: string;
  length: number;
  entropy: number;
  strength: string;
  createdAt: string;
}
