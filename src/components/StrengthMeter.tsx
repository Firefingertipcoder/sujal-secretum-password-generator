/**
 * ============================================================================
 *           📊 STRENGTH METER & METRIC CORRELATION ENGINE
 * ============================================================================
 * 
 * Project Name: Cryptographic WebAssembly Password Generator
 * Author: Dornal
 * Description: Calculates real-time entropy metrics and maps computational
 *              brute force times relative to modern and future hardware capabilities.
 * 
 * ============================================================================
 */

import React, { useMemo } from "react";
import { motion } from "motion/react";
import { ShieldCheck, ShieldAlert, Zap, Cpu, Server, Hourglass, HelpCircle } from "lucide-react";
import { EntropyDetails } from "../types";

interface Props {
  password: string;
  charPoolSize: number;
}

// Format duration helper
function formatTime(seconds: number): string {
  if (seconds < 0.001) return "< 1 millisecond";
  if (seconds < 1) return "< 1 second";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.round(minutes)} minutes`;
  
  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours)} hours`;
  
  const days = hours / 24;
  if (days < 365) return `${Math.round(days)} days`;
  
  const years = days / 365;
  if (years < 1000) return `${Math.round(years).toLocaleString()} years`;
  if (years < 1000000) return `${(years / 1000).toFixed(1)}k millenniums`;
  if (years < 1e9) return `${(years / 1e6).toFixed(1)} million years`;
  if (years < 1e12) return `${(years / 1e9).toFixed(1)} billion years (Eons)`;
  return "Centuries of Eons (Uncrackable)";
}

export function evaluateEntropy(password: string, charPoolSize: number): EntropyDetails {
  if (!password) {
    return {
      bits: 0,
      strengthLabel: "Weak",
      timeBruteForce: "Instant",
      timeSupercomputer: "Instant",
      timeQuantum: "Instant",
      shannonEntropy: 0,
      uniquenessScore: 0,
    };
  }

  const length = password.length;
  // 1. Theoretical Pool Complexity (E = L * log2(R))
  const poolSize = Math.max(charPoolSize, 1);
  const bits = length * (Math.log(poolSize) / Math.log(2));

  // 2. Shannon structural entropy (analyzes literal letter patterns / repetition)
  const frequencies: { [key: string]: number } = {};
  for (const char of password) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  
  let shannonEntropy = 0;
  const uniqueChars = Object.keys(frequencies).length;
  for (const char in frequencies) {
    const p = frequencies[char] / length;
    shannonEntropy -= p * (Math.log(p) / Math.log(2));
  }
  const uniquenessScore = (uniqueChars / length) * 100;

  // Total possible search combinations = 2^bits
  const totalCombinations = Math.pow(2, bits);

  // Estimated speeds (guesses/hashes per second)
  const speedConsumer = 1e9;         // 1 Giga-hash/sec typical consumer rig
  const speedMiningRig = 5e12;       // 5 Tera-hash/sec custom multi-GPU mining machine
  const speedSupercomputer = 2.5e17; // 250 Peta-hashes/sec specialized scientific custom cluster

  // Quantum computing search limit using Grover's Algorithm which reduces search complexity to O(sqrt(N))
  // Therefore, a quantum computer only requires sqrt(TotalCombinations) operations = 2^(bits / 2)
  const quantumOperations = Math.pow(2, bits / 2);
  const speedQuantumThreat = 1e12;   // 1 Trillion logical qubits state assessments/sec (Future threat)

  // Map to duration string
  const timeBruteForce = formatTime(totalCombinations / speedConsumer);
  const timeSupercomputer = formatTime(totalCombinations / speedSupercomputer);
  
  // Quantum evaluation based on Grover's square-root search bound
  const timeQuantum = formatTime(quantumOperations / speedQuantumThreat);

  // Determine standard categories
  let strengthLabel: EntropyDetails["strengthLabel"] = "Weak";
  if (bits >= 100) {
    strengthLabel = "Military Grade";
  } else if (bits >= 80) {
    strengthLabel = "Highly Secure";
  } else if (bits >= 60) {
    strengthLabel = "Strong";
  } else if (bits >= 40) {
    strengthLabel = "Medium";
  } else {
    strengthLabel = "Weak";
  }

  return {
    bits,
    strengthLabel,
    timeBruteForce,
    timeSupercomputer,
    timeQuantum,
    shannonEntropy,
    uniquenessScore,
  };
}

export const StrengthMeter: React.FC<Props> = ({ password, charPoolSize }) => {
  const metrics = useMemo(() => evaluateEntropy(password, charPoolSize), [password, charPoolSize]);

  // Determine visual color configurations for standard styles
  const getThemeConfig = () => {
    switch (metrics.strengthLabel) {
      case "Military Grade":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/20",
          text: "text-emerald-400",
          barColor: "bg-emerald-400 shadow-emerald-500/20",
          desc: "Excellent. Ideal for protecting highly sensitive roots and keys.",
        };
      case "Highly Secure":
        return {
          bg: "bg-teal-500/10 border-teal-500/20",
          text: "text-teal-400",
          barColor: "bg-teal-400 shadow-teal-500/20",
          desc: "Secure. Resistant to intensive targeted standard cracking clusters.",
        };
      case "Strong":
        return {
          bg: "bg-sky-500/10 border-sky-500/20",
          text: "text-sky-400",
          barColor: "bg-sky-400 shadow-sky-500/20",
          desc: "Good. Standard account protection and daily defensive tasks.",
        };
      case "Medium":
        return {
          bg: "bg-amber-500/10 border-amber-500/20",
          text: "text-amber-400",
          barColor: "bg-amber-400 shadow-amber-500/20",
          desc: "Moderate. Recommended to use longer structures for high-grade profiles.",
        };
      default:
        return {
          bg: "bg-rose-500/10 border-rose-500/20",
          text: "text-rose-400",
          barColor: "bg-rose-400 shadow-rose-500/20",
          desc: "Vulnerable. Highly susceptible to standard CPU/dictionary guessing attacks.",
        };
    }
  };

  const theme = getThemeConfig();
  const bitsWidth = Math.min((metrics.bits / 128) * 100, 100);

  return (
    <div id="strength_meter" className="space-y-5">
      {/* Strength visual header indicator */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors duration-300 ${theme.bg}`}>
        <div className="flex items-center gap-3">
          {metrics.bits >= 60 ? (
            <ShieldCheck className={`w-8 h-8 shrink-0 ${theme.text}`} />
          ) : (
            <ShieldAlert className={`w-8 h-8 shrink-0 ${theme.text}`} />
          )}
          <div>
            <div className="text-xs text-gray-400 font-mono tracking-wide uppercase">Strength rating</div>
            <div className={`text-lg font-bold tracking-tight ${theme.text}`}>{metrics.strengthLabel}</div>
          </div>
        </div>
        <div className="sm:text-right">
          <div className="text-xs text-gray-400 font-mono">POOL-BASED ENTROPY</div>
          <div className="text-xl font-mono font-bold text-gray-100">
            {Math.round(metrics.bits)} <span className="text-xs text-gray-400 font-sans">bits</span>
          </div>
        </div>
      </div>

      {/* Modern Gradient Strength Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-mono text-gray-400">
          <span>COMPLEXITY INDEX</span>
          <span>{Math.round(bitsWidth)}%</span>
        </div>
        <div className="h-2.5 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700/50 p-[1px]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${bitsWidth}%` }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            className={`h-full rounded-full transition-all duration-300 ${theme.barColor} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sub-metrics panel */}
        <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-800 space-y-3.5">
          <h4 className="text-xs font-mono uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-400" /> structural randomness
          </h4>
          
          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span className="flex items-center gap-1">
                  Shannon Entropy{" "}
                  <span className="group relative cursor-help">
                    <HelpCircle className="w-3 h-3 text-gray-500" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 hidden group-hover:block bg-gray-950 text-[10px] text-gray-300 p-2 rounded border border-gray-800 leading-relaxed z-30 shadow-xl">
                      Measures actual letter distribution. Score near 4+ indicates low repetition and optimal balance.
                    </span>
                  </span>
                </span>
                <span className="font-mono text-gray-200">{metrics.shannonEntropy.toFixed(2)} bits/char</span>
              </div>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500" 
                  style={{ width: `${Math.min((metrics.shannonEntropy / 5) * 100, 100)}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Unique Character Ratio</span>
                <span className="font-mono text-gray-200">{Math.round(metrics.uniquenessScore)}%</span>
              </div>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ width: `${metrics.uniquenessScore}%` }} 
                />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 italic mt-2 text-center select-none">
            {theme.desc}
          </p>
        </div>

        {/* Crack estimation times panel */}
        <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-800 space-y-3">
          <h4 className="text-xs font-mono uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
            <Hourglass className="w-3.5 h-3.5 text-indigo-400" /> Estimated Time To Crack
          </h4>
          
          <div className="space-y-2 text-xs">
            {/* Standard home setup */}
            <div className="flex items-center justify-between py-1 border-b border-gray-800/50">
              <div className="flex items-center gap-2 text-gray-300">
                <Cpu className="w-3.5 h-3.5 text-gray-500" />
                <span>Consumer PC</span>
              </div>
              <span className="font-mono font-medium text-gray-200">{metrics.timeBruteForce}</span>
            </div>

            {/* Custom high-end GPU rig */}
            <div className="flex items-center justify-between py-1 border-b border-gray-800/50">
              <div className="flex items-center gap-2 text-gray-300">
                <Zap className="w-3.5 h-3.5 text-orange-400" />
                <span>Multi-GPU Rig</span>
              </div>
              <span className="font-mono font-medium text-gray-200">{metrics.timeSupercomputer}</span>
            </div>

            {/* Quantum attack representation */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 text-gray-300">
                <Server className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span className="flex items-center gap-1">
                  Quantum Attack
                  <span className="group relative cursor-help">
                    <HelpCircle className="w-3 h-3 text-gray-500" />
                    <span className="absolute bottom-full right-0 mb-1.5 w-52 hidden group-hover:block bg-gray-950 text-[10px] text-gray-300 p-2 rounded border border-gray-800 leading-relaxed z-30 shadow-xl">
                      Using Grover's Search Algorithm bound, which cuts binary password depth in half (effective bits/2).
                    </span>
                  </span>
                </span>
              </div>
              <span className="font-mono font-medium text-gray-200">{metrics.timeQuantum}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
