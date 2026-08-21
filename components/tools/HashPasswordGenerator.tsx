"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  KeyRound, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Hash, 
  Sliders, 
  CheckCircle2, 
  Download,
  Fingerprint
} from "lucide-react";

type TabType = "password" | "hash" | "uuid";

export default function HashPasswordGenerator() {
  const [activeTab, setActiveTab] = useState<TabType>("password");

  // --- Password Generator State ---
  const [pwLength, setPwLength] = useState<number>(20);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const generatePassword = useCallback(() => {
    let chars = "";
    if (includeUpper) chars += excludeAmbiguous ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLower) chars += excludeAmbiguous ? "abcdefghijkmnpqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) chars += excludeAmbiguous ? "23456789" : "0123456789";
    if (includeSymbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (!chars) {
      setGeneratedPassword("");
      return;
    }

    const array = new Uint32Array(pwLength);
    window.crypto.getRandomValues(array);
    let result = "";
    for (let i = 0; i < pwLength; i++) {
      result += chars[array[i] % chars.length];
    }
    setGeneratedPassword(result);
  }, [pwLength, includeUpper, includeLower, includeNumbers, includeSymbols, excludeAmbiguous]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  // Password entropy calculation
  const passwordStrength = useMemo(() => {
    if (!generatedPassword) return { score: 0, label: "Kosong", color: "text-slate-500" };
    let poolSize = 0;
    if (includeUpper) poolSize += 26;
    if (includeLower) poolSize += 26;
    if (includeNumbers) poolSize += 10;
    if (includeSymbols) poolSize += 30;

    const entropy = pwLength * Math.log2(poolSize || 1);
    if (entropy > 90) return { score: 100, label: "Sangat Kuat (Kriptografis)", color: "text-emerald-400" };
    if (entropy > 65) return { score: 75, label: "Kuat", color: "text-indigo-400" };
    if (entropy > 45) return { score: 50, label: "Sedang", color: "text-amber-400" };
    return { score: 25, label: "Lemah", color: "text-red-400" };
  }, [generatedPassword, pwLength, includeUpper, includeLower, includeNumbers, includeSymbols]);

  // --- Hash Generator State ---
  const [hashInput, setHashInput] = useState("Clyra Secure Workspace");
  const [hashResults, setHashResults] = useState<{ sha256: string; sha512: string; sha384: string; sha1: string }>({
    sha256: "",
    sha512: "",
    sha384: "",
    sha1: "",
  });

  useEffect(() => {
    async function computeHashes() {
      if (!hashInput) {
        setHashResults({ sha256: "", sha512: "", sha384: "", sha1: "" });
        return;
      }
      const encoder = new TextEncoder();
      const data = encoder.encode(hashInput);

      const buffer256 = await crypto.subtle.digest("SHA-256", data);
      const buffer512 = await crypto.subtle.digest("SHA-512", data);
      const buffer384 = await crypto.subtle.digest("SHA-384", data);
      const buffer1 = await crypto.subtle.digest("SHA-1", data);

      const toHex = (buffer: ArrayBuffer) =>
        Array.from(new Uint8Array(buffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

      setHashResults({
        sha256: toHex(buffer256),
        sha512: toHex(buffer512),
        sha384: toHex(buffer384),
        sha1: toHex(buffer1),
      });
    }
    computeHashes();
  }, [hashInput]);

  // --- UUID Generator State ---
  const [uuidCount, setUuidCount] = useState<number>(5);
  const [uuidUppercase, setUuidUppercase] = useState(false);
  const [uuidHyphens, setUuidHyphens] = useState(true);
  const [uuidList, setUuidList] = useState<string[]>([]);

  const generateUUIDs = useCallback(() => {
    const list: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      let u = crypto.randomUUID();
      if (!uuidHyphens) u = u.replace(/-/g, "");
      if (uuidUppercase) u = u.toUpperCase();
      list.push(u);
    }
    setUuidList(list);
  }, [uuidCount, uuidUppercase, uuidHyphens]);

  useEffect(() => {
    generateUUIDs();
  }, [generateUUIDs]);

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const downloadUUIDs = () => {
    const blob = new Blob([uuidList.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clyra-uuids-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-2 flex items-center gap-2 shadow-xl">
        <button
          onClick={() => setActiveTab("password")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "password"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Password &amp; API Key</span>
        </button>

        <button
          onClick={() => setActiveTab("hash")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "hash"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Fingerprint className="w-4 h-4" />
          <span>Hash Digest (SHA)</span>
        </button>

        <button
          onClick={() => setActiveTab("uuid")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "uuid"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Hash className="w-4 h-4" />
          <span>UUID v4 Generator</span>
        </button>
      </div>

      {/* TAB 1: PASSWORD & SECRET KEY GENERATOR */}
      {activeTab === "password" && (
        <div className="space-y-6">
          {/* Result Box */}
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-400 uppercase">
                Generated Secure String
              </span>
              <span className={`text-xs font-mono font-bold ${passwordStrength.color}`}>
                {passwordStrength.label}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-4 text-base sm:text-lg font-mono text-indigo-300 break-all select-all font-semibold tracking-wide">
                {generatedPassword || "Pilih minimal 1 set karakter"}
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={generatePassword}
                  className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                  title="Generate Baru"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => copyText(generatedPassword, "pw")}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all"
                >
                  {copiedKey === "pw" ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Config Options */}
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-sm font-semibold text-white">Panjang Karakter: {pwLength}</span>
              <input
                type="range"
                min="8"
                max="64"
                value={pwLength}
                onChange={(e) => setPwLength(Number(e.target.value))}
                className="w-48 sm:w-64 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Huruf Besar (A-Z)", val: includeUpper, set: setIncludeUpper },
                { label: "Huruf Kecil (a-z)", val: includeLower, set: setIncludeLower },
                { label: "Angka (0-9)", val: includeNumbers, set: setIncludeNumbers },
                { label: "Simbol Khusus (!@#$)", val: includeSymbols, set: setIncludeSymbols },
                { label: "Hindari Ambigu (0/O, 1/l/I)", val: excludeAmbiguous, set: setExcludeAmbiguous },
              ].map((opt, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 p-3.5 bg-[#08090d] border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={opt.val}
                    onChange={(e) => opt.set(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500 accent-indigo-500"
                  />
                  <span className="text-xs font-medium text-slate-300">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HASH DIGEST */}
      {activeTab === "hash" && (
        <div className="space-y-6">
          {/* Input text */}
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-5 space-y-3 shadow-xl">
            <span className="text-xs font-semibold text-slate-300 uppercase font-mono">
              Input String / Plain Text
            </span>
            <textarea
              rows={3}
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Ketik string yang ingin di-hash..."
              className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-4 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Hashes List */}
          <div className="space-y-4">
            {[
              { label: "SHA-256", val: hashResults.sha256, bits: "256-bit" },
              { label: "SHA-512", val: hashResults.sha512, bits: "512-bit" },
              { label: "SHA-384", val: hashResults.sha384, bits: "384-bit" },
              { label: "SHA-1", val: hashResults.sha1, bits: "160-bit (Legacy)" },
            ].map((h) => (
              <div
                key={h.label}
                className="bg-[#0e111a] border border-slate-800/80 rounded-xl p-4 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">{h.label}</span>
                    <span className="text-[10px] font-mono text-slate-500">({h.bits})</span>
                  </div>
                  <button
                    onClick={() => copyText(h.val, h.label)}
                    disabled={!h.val}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-all disabled:opacity-40"
                  >
                    {copiedKey === h.label ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-[11px]">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="text-[11px]">Salin</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 bg-[#08090d] border border-slate-800 rounded-lg text-xs font-mono text-slate-300 break-all select-all">
                  {h.val || <span className="text-slate-600 italic">Menunggu input...</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: UUID GENERATOR */}
      {activeTab === "uuid" && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Jumlah:</span>
                <select
                  value={uuidCount}
                  onChange={(e) => setUuidCount(Number(e.target.value))}
                  className="bg-[#08090d] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value={1}>1 UUID</option>
                  <option value={5}>5 UUID</option>
                  <option value={10}>10 UUID</option>
                  <option value={25}>25 UUID</option>
                  <option value={50}>50 UUID</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uuidUppercase}
                  onChange={(e) => setUuidUppercase(e.target.checked)}
                  className="rounded text-indigo-600 bg-slate-900 border-slate-700 accent-indigo-500"
                />
                <span>UPPERCASE</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uuidHyphens}
                  onChange={(e) => setUuidHyphens(e.target.checked)}
                  className="rounded text-indigo-600 bg-slate-900 border-slate-700 accent-indigo-500"
                />
                <span>Pakai Hyphen (-)</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={generateUUIDs}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>
              <button
                onClick={downloadUUIDs}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .txt</span>
              </button>
            </div>
          </div>

          {/* List of UUIDs */}
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-semibold text-slate-400 uppercase">
                Hasil UUID v4 ({uuidList.length})
              </span>
              <button
                onClick={() => copyText(uuidList.join("\n"), "all-uuid")}
                className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
              >
                {copiedKey === "all-uuid" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>Salin Semua</span>
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pt-2">
              {uuidList.map((u, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-[#08090d] border border-slate-800 rounded-xl text-xs font-mono text-slate-200 select-all hover:border-slate-700 transition-colors"
                >
                  <span>{u}</span>
                  <button
                    onClick={() => copyText(u, `uuid-${i}`)}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 transition-colors"
                  >
                    {copiedKey === `uuid-${i}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
