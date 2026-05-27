/**
 * ============================================================================
 *           🔑 REVERSIBLE-PROOF SHA-256 HASH CALCULATOR
 * ============================================================================
 * 
 * Project Name: Cryptographic WebAssembly Password Generator
 * Author: Dornal
 * Description: High-performance, fully client-side SHA-256 hashes generated
 *              dynamically via SubtleCrypto Web API.
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from "react";
import { ShieldCheck, Copy, Check, Eye, EyeOff } from "lucide-react";

interface Props {
  password?: string;
}

export const HashViewer: React.FC<Props> = ({ password = "" }) => {
  const [sha256Hash, setSha256Hash] = useState<string>("");
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!password) {
      setSha256Hash("");
      return;
    }

    const calculateHash = async () => {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
        
        // Convert to Hexadecimal representation
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        setSha256Hash(hashHex);
      } catch (e) {
        console.error("Hash computation failed:", e);
      }
    };

    calculateHash();
  }, [password]);

  const handleCopyHash = () => {
    if (!sha256Hash) return;
    navigator.clipboard.writeText(sha256Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (!password) return null;

  return (
    <div id="hash_viewer" className="bg-gray-950 rounded-xl p-4 border border-gray-800 space-y-3.5">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-mono uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Dynamic Cryptographic Digest
        </h4>
        <div className="flex items-center gap-2">
          {/* Toggle eye */}
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
            title={visible ? "Hide hash" : "Show hash"}
          >
            {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          
          <button
            type="button"
            onClick={handleCopyHash}
            disabled={!sha256Hash}
            className="flex items-center gap-1 text-[10px] font-mono bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-800 px-2 py-0.5 rounded transition-colors"
          >
            {copiedHash ? (
              <>
                <Check className="w-2.5 h-2.5 text-emerald-400" /> COPIED
              </>
            ) : (
              <>
                <Copy className="w-2.5 h-2.5" /> COPY HASH
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
          <span>ALGORITHM: SHA-256 (ONE-WAY HASH)</span>
          <span>OUTPUT: 256 BITS (HEX)</span>
        </div>
        <div className="relative rounded bg-gray-900/40 p-2.5 border border-indigo-950/20 font-mono text-[11px] leading-relaxed break-all text-gray-300 min-h-[46px] flex items-center">
          {visible ? (
            sha256Hash || "Calculating..."
          ) : (
            <span className="tracking-widest text-[9px] text-gray-500 select-none">
              {sha256Hash ? "•".repeat(64) : "Calculating..."}
            </span>
          )}
        </div>
      </div>
      
      <p className="text-[10px] text-gray-500 font-mono leading-relaxed select-none">
        Note: Authentic services never save plain passwords. They compute secure digests to verify credentials during login.
      </p>
    </div>
  );
};
