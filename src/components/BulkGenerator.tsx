/**
 * ============================================================================
 *           📦 HIGH-PERFORMANCE BULK BATCH GENERATOR COMPONENT
 * ============================================================================
 * 
 * Project Name: Cryptographic WebAssembly Password Generator
 * Author: Sujal
 * Description: Generates secure batches of passwords using configured 
 *              selectors and allows exporting them securely in TXT, CSV, or JSON.
 * 
 * ============================================================================
 */

import React, { useState } from "react";
import { Download, Table, Trash, Copy, Check, Shield, CirclePlay } from "lucide-react";
import { GeneratorOptions, PasswordRecord } from "../types";
import { evaluateEntropy } from "./StrengthMeter";

interface Props {
  options: GeneratorOptions;
  charPool: string;
  generatePasswordFn: (opts: GeneratorOptions, pool: string) => string;
}

export const BulkGenerator: React.FC<Props> = ({ options, charPool, generatePasswordFn }) => {
  const [batchSize, setBatchSize] = useState<number>(10);
  const [records, setRecords] = useState<PasswordRecord[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerateBatch = () => {
    const freshRecords: PasswordRecord[] = [];
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    for (let i = 0; i < batchSize; i++) {
      const pwd = generatePasswordFn(options, charPool);
      const metrics = evaluateEntropy(pwd, charPool.length);
      
      freshRecords.push({
        id: crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2, 11)),
        password: pwd,
        length: pwd.length,
        entropy: Math.round(metrics.bits),
        strength: metrics.strengthLabel,
        createdAt: timestamp
      });
    }

    setRecords(freshRecords);
  };

  const clearRecords = () => {
    setRecords([]);
  };

  const handleCopySingle = (record: PasswordRecord) => {
    navigator.clipboard.writeText(record.password);
    setCopiedId(record.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Secure local download export routines
  const handleExport = (format: "txt" | "csv" | "json") => {
    if (records.length === 0) return;

    let blobContent = "";
    let mimeType = "text/plain";
    let filename = `secure_passwords_sujal.${format}`;

    if (format === "txt") {
      blobContent = records.map((r) => r.password).join("\n");
      mimeType = "text/plain";
    } else if (format === "csv") {
      blobContent = "Index,Password,Length,Entropy(Bits),Strength,Timestamp\n" +
        records.map((r, idx) => `"${idx + 1}","${r.password.replace(/"/g, '""')}","${r.length}","${r.entropy}","${r.strength}","${r.createdAt}"`).join("\n");
      mimeType = "text/csv";
    } else if (format === "json") {
      const exportObj = {
        title: "Sujal's Secure WebAssembly Password Generator Bulk Export",
        generation_timestamp: new Date().toISOString(),
        total_count: records.length,
        items: records.map(({ password, length, entropy, strength, createdAt }) => ({
          password,
          length,
          entropy_bits: entropy,
          security_rating: strength,
          created_at: createdAt
        }))
      };
      blobContent = JSON.stringify(exportObj, null, 2);
      mimeType = "application/json";
    }

    const blob = new Blob([blobContent], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="bulk_generator" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-900/40 p-4 rounded-xl border border-gray-850">
        <div className="space-y-1">
          <h3 className="font-sans font-semibold text-sm text-gray-200 flex items-center gap-1.5">
            <Table className="w-4 h-4 text-emerald-400" /> Bulk Password Architect
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Generate multiple secure passwords concurrently employing Sujal's C++ WASM parameters.
          </p>
        </div>

        {/* Configurations */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded px-2.5 py-1.5">
            <label htmlFor="batch_size_select" className="text-xs font-mono text-gray-400 select-none">Count:</label>
            <select
              id="batch_size_select"
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              className="text-xs font-mono font-medium bg-transparent text-gray-200 focus:outline-none cursor-pointer"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleGenerateBatch}
            className="flex items-center gap-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-medium px-4 py-2 rounded shadow-md transition-all active:scale-95"
          >
            <CirclePlay className="w-4 h-4" /> GENERATE
          </button>
        </div>
      </div>

      {records.length > 0 && (
        <div className="space-y-3.5">
          {/* Action Header controls */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-gray-900/60 border border-gray-800 rounded-xl p-3">
            <div className="text-xs text-gray-300 font-mono">
              GENERATED: <span className="text-gray-100 font-bold">{records.length}</span> items
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500">EXPORTS:</span>
              <div className="inline-flex rounded-md shadow-sm border border-gray-800 bg-gray-950">
                <button
                  type="button"
                  onClick={() => handleExport("txt")}
                  className="px-2.5 py-1 text-[10px] font-mono font-semibold text-gray-300 hover:bg-gray-800 rounded-l border-r border-gray-800 transition-colors"
                >
                  TXT
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("csv")}
                  className="px-2.5 py-1 text-[10px] font-mono font-semibold text-gray-300 hover:bg-gray-800 border-r border-gray-800 transition-colors"
                >
                  CSV
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("json")}
                  className="px-2.5 py-1 text-[10px] font-mono font-semibold text-gray-300 hover:bg-gray-800 rounded-r transition-colors"
                >
                  JSON
                </button>
              </div>

              <button
                type="button"
                onClick={clearRecords}
                className="p-1 px-2.5 text-[10px] font-mono bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 border border-rose-500/10 rounded flex items-center gap-1 transition-colors"
              >
                <Trash className="w-3 h-3" /> CLEAR
              </button>
            </div>
          </div>

          {/* Secure Display Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-950">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-800 text-[10px] font-mono text-gray-400 tracking-wider">
                  <th className="p-3 pl-4 w-12 text-center select-none">#</th>
                  <th className="p-3 pl-4">SECURE CREDENTIALS</th>
                  <th className="p-3 text-center">LENGTH</th>
                  <th className="p-3 text-center">ENTROPY</th>
                  <th className="p-3 text-center">STRENGTH RATING</th>
                  <th className="p-3 pr-4 text-right select-none">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900/60 font-mono text-xs">
                {records.map((r, itemIdx) => {
                  const isSec = r.entropy >= 60;
                  return (
                    <tr key={r.id} className="hover:bg-gray-900/30 transition-colors">
                      <td className="p-3 pl-4 text-center text-gray-500 select-none">
                        {itemIdx + 1}
                      </td>
                      <td className="p-3 pl-4 font-mono font-semibold text-gray-100 select-all max-w-xs truncate" title="Click to copy or secure highlight">
                        {r.password}
                      </td>
                      <td className="p-4 text-center text-gray-300 font-mono">
                        {r.length}
                      </td>
                      <td className="p-4 text-center text-gray-300 font-mono">
                        {r.entropy} <span className="text-[9px] text-gray-500">bits</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.strength === "Military Grade" ? "bg-emerald-500/10 text-emerald-400" :
                          r.strength === "Highly Secure" ? "bg-teal-500/10 text-teal-400" :
                          r.strength === "Strong" ? "bg-sky-500/10 text-sky-400" :
                          r.strength === "Medium" ? "bg-amber-500/10 text-amber-400" :
                          "bg-rose-500/10 text-rose-450"
                        }`}>
                          <Shield className="w-2.5 h-2.5 shrink-0" />
                          {r.strength}
                        </span>
                      </td>
                      <td className="p-3 pr-4 text-right select-none">
                        <button
                          type="button"
                          onClick={() => handleCopySingle(r)}
                          className="p-1 px-2.5 rounded bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-gray-100 transition-all flex items-center gap-1 ml-auto"
                          title="Copy Password"
                        >
                          {copiedId === r.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-400" />
                          )}
                          <span className="text-[10px]">{copiedId === r.id ? "Copied" : "Copy"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
