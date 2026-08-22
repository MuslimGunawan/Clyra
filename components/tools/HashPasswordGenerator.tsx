"use client";

import { useState, useEffect, useMemo, useCallback, useRef, ChangeEvent } from "react";
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
  Fingerprint,
  Sparkles,
  Upload,
  Lock,
  Clock,
  Zap,
  Eye,
  FileCheck,
  Code2,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

type TabType = "password" | "hash" | "hmac" | "uuid" | "filehash";

// Passphrase Wordlist for Memorable Passphrases
const PASSPHRASE_WORDS = [
  "falcon", "orbit", "quantum", "shadow", "cyber", "cosmic", "aurora", "matrix", "vector", "nebula",
  "prism", "pulsar", "zenith", "crystal", "vortex", "hyper", "titan", "stellar", "phantom", "echo",
  "obsidian", "emerald", "solstice", "horizon", "beacon", "glacier", "vanguard", "catalyst", "shield", "dynamo",
  "radiant", "eclipse", "infinity", "genesis", "chrono", "nexus", "vertex", "solaris", "arcane", "strata"
];

// NanoID character set
const NANOID_CHARS = "useandom-26T1983_40STFnveciglhO5947B6";

export default function HashPasswordGenerator() {
  const { showToast } = useToast();
  const fileHashInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>("password");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Copy helper
  const copyText = async (text: string, key: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast("Berhasil disalin ke clipboard!", "copied");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      showToast("Gagal menyalin.", "error");
    }
  };

  // ==========================================
  // 1. PASSWORD & PASSPHRASE STUDIO
  // ==========================================
  const [pwMode, setPwMode] = useState<"random" | "passphrase" | "pin" | "apikey">("random");
  const [pwLength, setPwLength] = useState<number>(20);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(true);
  const [passphraseWordCount, setPassphraseWordCount] = useState<number>(4);
  const [passphraseSeparator, setPassphraseSeparator] = useState<string>("-");
  const [apiKeyPrefix, setApiKeyPrefix] = useState<string>("cly_live_");
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [bulkCount, setBulkCount] = useState<number>(1);
  const [bulkPasswords, setBulkPasswords] = useState<string[]>([]);

  const generateSinglePassword = useCallback((): string => {
    if (pwMode === "passphrase") {
      const selectedWords: string[] = [];
      const randArr = new Uint32Array(passphraseWordCount);
      crypto.getRandomValues(randArr);
      for (let i = 0; i < passphraseWordCount; i++) {
        const word = PASSPHRASE_WORDS[randArr[i] % PASSPHRASE_WORDS.length];
        selectedWords.push(word);
      }
      return selectedWords.join(passphraseSeparator);
    }

    if (pwMode === "pin") {
      const randArr = new Uint32Array(pwLength);
      crypto.getRandomValues(randArr);
      let pin = "";
      for (let i = 0; i < pwLength; i++) {
        pin += (randArr[i] % 10).toString();
      }
      return pin;
    }

    if (pwMode === "apikey") {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const randArr = new Uint32Array(32);
      crypto.getRandomValues(randArr);
      let key = "";
      for (let i = 0; i < 32; i++) {
        key += chars[randArr[i] % chars.length];
      }
      return `${apiKeyPrefix.trim()}${key}`;
    }

    // Default Random Mode
    let chars = "";
    if (includeUpper) chars += excludeAmbiguous ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLower) chars += excludeAmbiguous ? "abcdefghijkmnpqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) chars += excludeAmbiguous ? "23456789" : "0123456789";
    if (includeSymbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (!chars) return "";

    const array = new Uint32Array(pwLength);
    crypto.getRandomValues(array);
    let result = "";
    for (let i = 0; i < pwLength; i++) {
      result += chars[array[i] % chars.length];
    }
    return result;
  }, [
    pwMode,
    pwLength,
    includeUpper,
    includeLower,
    includeNumbers,
    includeSymbols,
    excludeAmbiguous,
    passphraseWordCount,
    passphraseSeparator,
    apiKeyPrefix,
  ]);

  const generateAllPasswords = useCallback(() => {
    const list: string[] = [];
    for (let i = 0; i < bulkCount; i++) {
      list.push(generateSinglePassword());
    }
    setBulkPasswords(list);
    setGeneratedPassword(list[0] || "");
  }, [bulkCount, generateSinglePassword]);

  useEffect(() => {
    generateAllPasswords();
  }, [generateAllPasswords]);

  // Password Entropy & Crack Time Estimation
  const passwordStrength = useMemo(() => {
    if (!generatedPassword) return { score: 0, label: "Kosong", crackTime: "0 detik", color: "text-slate-500" };
    let poolSize = 0;
    if (pwMode === "passphrase") poolSize = PASSPHRASE_WORDS.length;
    else if (pwMode === "pin") poolSize = 10;
    else {
      if (includeUpper) poolSize += 26;
      if (includeLower) poolSize += 26;
      if (includeNumbers) poolSize += 10;
      if (includeSymbols) poolSize += 30;
    }

    const entropy = Math.round(generatedPassword.length * Math.log2(poolSize || 2));
    if (entropy >= 120) return { score: 100, label: "Kriptografis (Militer)", crackTime: "~Triliunan Tahun", color: "text-emerald-400" };
    if (entropy >= 80) return { score: 85, label: "Sangat Kuat", crackTime: "~Jutaan Tahun", color: "text-emerald-400" };
    if (entropy >= 55) return { score: 65, label: "Kuat", crackTime: "~Ratusan Tahun", color: "text-indigo-400" };
    if (entropy >= 35) return { score: 40, label: "Sedang", crackTime: "~Beberapa Jam / Hari", color: "text-amber-400" };
    return { score: 20, label: "Lemah", crackTime: "< 1 Menit", color: "text-red-400" };
  }, [generatedPassword, pwMode, includeUpper, includeLower, includeNumbers, includeSymbols]);

  // Download Passwords List
  const handleDownloadPasswords = () => {
    const blob = new Blob([bulkPasswords.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clyra-passwords-${Date.now().toString().slice(-4)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Daftar password berhasil diunduh!", "success");
  };

  // ==========================================
  // 2. HASH DIGEST & HMAC STUDIO
  // ==========================================
  const [hashInput, setHashInput] = useState<string>("Clyra Secure Workspace 2026");
  const [hmacKey, setHmacKey] = useState<string>("my-super-secret-key");
  const [hashResults, setHashResults] = useState<{
    sha256: string;
    sha512: string;
    sha384: string;
    sha1: string;
  }>({ sha256: "", sha512: "", sha384: "", sha1: "" });
  const [hmacResults, setHmacResults] = useState<{ sha256: string; sha512: string }>({ sha256: "", sha512: "" });

  useEffect(() => {
    async function computeHashes() {
      if (!hashInput) {
        setHashResults({ sha256: "", sha512: "", sha384: "", sha1: "" });
        setHmacResults({ sha256: "", sha512: "" });
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

      // Compute HMAC if secret key present
      if (hmacKey) {
        try {
          const keyData = encoder.encode(hmacKey);
          const cryptoKey256 = await crypto.subtle.importKey(
            "raw",
            keyData,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
          );
          const hmacBuf256 = await crypto.subtle.sign("HMAC", cryptoKey256, data);

          const cryptoKey512 = await crypto.subtle.importKey(
            "raw",
            keyData,
            { name: "HMAC", hash: "SHA-512" },
            false,
            ["sign"]
          );
          const hmacBuf512 = await crypto.subtle.sign("HMAC", cryptoKey512, data);

          setHmacResults({
            sha256: toHex(hmacBuf256),
            sha512: toHex(hmacBuf512),
          });
        } catch {
          // ignore
        }
      }
    }
    computeHashes();
  }, [hashInput, hmacKey]);

  // ==========================================
  // 3. FILE HASH CHECKSUM
  // ==========================================
  const [fileChecksums, setFileChecksums] = useState<{
    fileName: string;
    fileSize: number;
    sha256: string;
    sha1: string;
    isCalculating: boolean;
  } | null>(null);

  const handleFileHash = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileChecksums({
      fileName: file.name,
      fileSize: file.size,
      sha256: "",
      sha1: "",
      isCalculating: true,
    });

    const arrayBuffer = await file.arrayBuffer();
    const sha256Buf = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const sha1Buf = await crypto.subtle.digest("SHA-1", arrayBuffer);

    const toHex = (buffer: ArrayBuffer) =>
      Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    setFileChecksums({
      fileName: file.name,
      fileSize: file.size,
      sha256: toHex(sha256Buf),
      sha1: toHex(sha1Buf),
      isCalculating: false,
    });

    showToast(`Checksum file "${file.name}" berhasil dihitung!`, "success");
    if (fileHashInputRef.current) fileHashInputRef.current.value = "";
  };

  // ==========================================
  // 4. UUID & UNIQUE ID GENERATOR (v4, v7, NanoID)
  // ==========================================
  const [uuidType, setUuidType] = useState<"v4" | "nanoid" | "hex32">("v4");
  const [uuidCount, setUuidCount] = useState<number>(5);
  const [uuidUppercase, setUuidUppercase] = useState<boolean>(false);
  const [uuidHyphens, setUuidHyphens] = useState<boolean>(true);
  const [uuidList, setUuidList] = useState<string[]>([]);

  const generateUUIDs = useCallback(() => {
    const list: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      if (uuidType === "nanoid") {
        const rand = new Uint32Array(21);
        crypto.getRandomValues(rand);
        let nano = "";
        for (let j = 0; j < 21; j++) {
          nano += NANOID_CHARS[rand[j] % NANOID_CHARS.length];
        }
        list.push(nano);
      } else if (uuidType === "hex32") {
        const rand = new Uint8Array(16);
        crypto.getRandomValues(rand);
        const hex = Array.from(rand)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        list.push(uuidUppercase ? hex.toUpperCase() : hex);
      } else {
        let u = crypto.randomUUID();
        if (!uuidHyphens) u = u.replace(/-/g, "");
        if (uuidUppercase) u = u.toUpperCase();
        list.push(u);
      }
    }
    setUuidList(list);
  }, [uuidType, uuidCount, uuidUppercase, uuidHyphens]);

  useEffect(() => {
    generateUUIDs();
  }, [generateUUIDs]);

  const downloadUUIDs = () => {
    const blob = new Blob([uuidList.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clyra-${uuidType}-list-${Date.now().toString().slice(-4)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("File ID berhasil diunduh!", "success");
  };

  return (
    <div className="space-y-8">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 shadow-md">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Hash, UUID &amp; Password Studio</h2>
              <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                Kriptografis Aman
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Generator Password Kuat, SHA &amp; HMAC Hash Digest, File Checksum, dan UUID v4 / NanoID.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Web Crypto API (Zero-Server)</span>
          </span>
        </div>
      </div>

      {/* 2. RESPONSIVE TABS BAR */}
      <div className="flex flex-wrap items-center gap-2 bg-[#0e111a] p-2 rounded-2xl border border-slate-800 text-xs">
        {[
          { id: "password", label: "1. Password & Secret Key", icon: KeyRound },
          { id: "hash", label: "2. SHA Hash Digest", icon: Fingerprint },
          { id: "hmac", label: "3. HMAC Signature", icon: Lock },
          { id: "uuid", label: "4. UUID & NanoID", icon: Hash },
          { id: "filehash", label: "5. File Checksum Verifier", icon: FileCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer",
                isSelected
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                  : "text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800/80"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==========================================
          TAB 1: PASSWORD & SECRET KEY GENERATOR
          ========================================== */}
      {activeTab === "password" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Result Display */}
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-400 uppercase">
                Generated Secure String
              </span>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className={cn("font-bold", passwordStrength.color)}>
                  {passwordStrength.label}
                </span>
                <span className="text-slate-500">• Waktu Retas: {passwordStrength.crackTime}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full bg-[#08090d] border border-slate-800 rounded-2xl p-4 text-base sm:text-lg font-mono text-indigo-300 break-all select-all font-semibold tracking-wide shadow-inner">
                {generatedPassword || "Pilih opsi set karakter..."}
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={generateAllPasswords}
                  className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
                  title="Generate Baru"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => copyText(generatedPassword, "pw")}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
                >
                  {copiedKey === "pw" ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Password</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mode & Configuration Panel */}
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-6">
            {/* Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Format Password:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "random", label: "Karakter Acak (Random)" },
                  { id: "passphrase", label: "Frasa Kata (Passphrase)" },
                  { id: "pin", label: "PIN Angka" },
                  { id: "apikey", label: "API Secret Key" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPwMode(m.id as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                      pwMode === m.id
                        ? "bg-indigo-600 text-white border-indigo-500 font-bold"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Configs */}
            {pwMode === "random" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Panjang Karakter: <strong className="text-indigo-400 font-mono text-sm">{pwLength}</strong></span>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={pwLength}
                    onChange={(e) => setPwLength(Number(e.target.value))}
                    className="w-48 sm:w-64 accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { label: "Huruf Besar (A-Z)", val: includeUpper, set: setIncludeUpper },
                    { label: "Huruf Kecil (a-z)", val: includeLower, set: setIncludeLower },
                    { label: "Angka (0-9)", val: includeNumbers, set: setIncludeNumbers },
                    { label: "Simbol Khusus (!@#$)", val: includeSymbols, set: setIncludeSymbols },
                    { label: "Hindari Karakter Ambigu (0/O, 1/l/I)", val: excludeAmbiguous, set: setExcludeAmbiguous },
                  ].map((opt, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-3 p-3.5 bg-[#08090d] border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={opt.val}
                        onChange={(e) => opt.set(e.target.checked)}
                        className="rounded text-indigo-600 accent-indigo-500"
                      />
                      <span className="text-xs font-medium text-slate-300">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {pwMode === "passphrase" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300">Jumlah Kata ({passphraseWordCount} kata)</label>
                  <input
                    type="range"
                    min="3"
                    max="8"
                    value={passphraseWordCount}
                    onChange={(e) => setPassphraseWordCount(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300">Pemisah Kata (Separator)</label>
                  <select
                    value={passphraseSeparator}
                    onChange={(e) => setPassphraseSeparator(e.target.value)}
                    className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="-">Tanda Hubung (hyphen: correct-horse-pass)</option>
                    <option value="_">Garis Bawah (underscore: correct_horse_pass)</option>
                    <option value=".">Titik (dot: correct.horse.pass)</option>
                    <option value=" ">Spasi (space: correct horse pass)</option>
                  </select>
                </div>
              </div>
            )}

            {pwMode === "pin" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Panjang Digit PIN: <strong className="text-indigo-400 font-mono">{pwLength} digit</strong></span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="12"
                  value={pwLength}
                  onChange={(e) => setPwLength(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            )}

            {pwMode === "apikey" && (
              <div className="space-y-2">
                <label className="text-xs text-slate-300">Prefiks Kunci API</label>
                <input
                  type="text"
                  value={apiKeyPrefix}
                  onChange={(e) => setApiKeyPrefix(e.target.value)}
                  placeholder="cly_live_"
                  className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-white font-mono"
                />
              </div>
            )}

            {/* Bulk Generator Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Generate Massal:</span>
                <select
                  value={bulkCount}
                  onChange={(e) => setBulkCount(Number(e.target.value))}
                  className="bg-[#08090d] border border-slate-800 rounded-lg px-3 py-1 text-xs text-white font-mono"
                >
                  <option value={1}>1 Password</option>
                  <option value={5}>5 Password</option>
                  <option value={10}>10 Password</option>
                  <option value={20}>20 Password</option>
                </select>
              </div>

              {bulkCount > 1 && (
                <button
                  onClick={handleDownloadPasswords}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Unduh Semua ({bulkCount}) .TXT</span>
                </button>
              )}
            </div>

            {/* Bulk List Display */}
            {bulkCount > 1 && (
              <div className="space-y-2 pt-2">
                {bulkPasswords.map((pw, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-[#08090d] border border-slate-800 rounded-xl text-xs font-mono text-slate-300 select-all"
                  >
                    <span className="truncate pr-2">{pw}</span>
                    <button
                      onClick={() => copyText(pw, `bulk-${idx}`)}
                      className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white"
                    >
                      {copiedKey === `bulk-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: SHA HASH DIGEST
          ========================================== */}
      {activeTab === "hash" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Input text */}
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 space-y-3 shadow-2xl">
            <span className="text-xs font-bold text-white uppercase font-mono">
              Input String / Plain Text
            </span>
            <textarea
              rows={3}
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Ketik teks yang ingin di-hash..."
              className="w-full bg-[#08090d] border border-slate-800 rounded-2xl p-4 text-slate-100 text-xs font-mono focus:border-indigo-500 outline-none shadow-inner"
            />
          </div>

          {/* Hashes List */}
          <div className="space-y-3">
            {[
              { label: "SHA-256", val: hashResults.sha256, bits: "256-bit", desc: "Standar Industri Kriptografi & Blockchain" },
              { label: "SHA-512", val: hashResults.sha512, bits: "512-bit", desc: "Keamanan Tertinggi 64-Byte Hash" },
              { label: "SHA-384", val: hashResults.sha384, bits: "384-bit", desc: "NIST FIPS 180-4 Standard" },
              { label: "SHA-1", val: hashResults.sha1, bits: "160-bit (Legacy)", desc: "Digunakan pada Git Commit Checksums" },
            ].map((h) => (
              <div
                key={h.label}
                className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-4 space-y-2 shadow-lg hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">{h.label}</span>
                    <span className="text-[10px] font-mono text-slate-500">({h.bits})</span>
                    <span className="text-[10px] text-slate-500 hidden sm:inline">• {h.desc}</span>
                  </div>
                  <button
                    onClick={() => copyText(h.val, h.label)}
                    disabled={!h.val}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    {copiedKey === h.label ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] text-emerald-400">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Salin</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 bg-[#08090d] border border-slate-800 rounded-xl text-xs font-mono text-slate-300 break-all select-all shadow-inner">
                  {h.val || <span className="text-slate-600 italic">Menunggu input teks...</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 3: HMAC SIGNATURE
          ========================================== */}
      {activeTab === "hmac" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-4">
            <span className="text-xs font-bold text-white uppercase font-mono block">
              HMAC (Hash-based Message Authentication Code)
            </span>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300">Pesan / Payload</label>
              <textarea
                rows={3}
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs font-mono text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300">Secret Key (Kunci Rahasia)</label>
              <input
                type="text"
                value={hmacKey}
                onChange={(e) => setHmacKey(e.target.value)}
                className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs font-mono text-indigo-300"
              />
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: "HMAC-SHA256", val: hmacResults.sha256, desc: "Webhook Signature (Stripe, GitHub, Shopify)" },
              { label: "HMAC-SHA512", val: hmacResults.sha512, desc: "High-Security Webhook Signatures" },
            ].map((h) => (
              <div
                key={h.label}
                className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-4 space-y-2 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-400">{h.label}</span>
                  <button
                    onClick={() => copyText(h.val, h.label)}
                    disabled={!h.val}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 cursor-pointer"
                  >
                    {copiedKey === h.label ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Salin HMAC</span>
                  </button>
                </div>
                <div className="p-3 bg-[#08090d] border border-slate-800 rounded-xl text-xs font-mono text-slate-300 break-all select-all">
                  {h.val || <span className="text-slate-600 italic">Menunggu input...</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 4: UUID & NANOID GENERATOR
          ========================================== */}
      {activeTab === "uuid" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Controls */}
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center bg-[#08090d] p-1 rounded-xl border border-slate-800 text-xs">
                  {(
                    [
                      { id: "v4", label: "UUID v4 (RFC 4122)" },
                      { id: "nanoid", label: "NanoID (URL Safe)" },
                      { id: "hex32", label: "Hex 32-Byte Secret" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setUuidType(t.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer",
                        uuidType === t.id ? "bg-indigo-600 text-white" : "text-slate-400"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">Jumlah:</span>
                  <select
                    value={uuidCount}
                    onChange={(e) => setUuidCount(Number(e.target.value))}
                    className="bg-[#08090d] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  >
                    <option value={1}>1 ID</option>
                    <option value={5}>5 ID</option>
                    <option value={10}>10 ID</option>
                    <option value={25}>25 ID</option>
                    <option value={50}>50 ID</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={generateUUIDs}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>

                <button
                  onClick={downloadUUIDs}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download .TXT</span>
                </button>
              </div>
            </div>
          </div>

          {/* List Display */}
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-white uppercase">
                Hasil Unique ID ({uuidList.length})
              </span>
              <button
                onClick={() => copyText(uuidList.join("\n"), "all-uuid")}
                className="text-xs text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === "all-uuid" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Salin Semua Baris</span>
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pt-1">
              {uuidList.map((u, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-[#08090d] border border-slate-800 rounded-xl text-xs font-mono text-slate-200 select-all hover:border-slate-700 transition-colors"
                >
                  <span className="truncate pr-2">{u}</span>
                  <button
                    onClick={() => copyText(u, `uuid-${i}`)}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    {copiedKey === `uuid-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 5: FILE CHECKSUM VERIFIER
          ========================================== */}
      {activeTab === "filehash" && (
        <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-6 animate-fadeIn">
          <div className="pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase font-mono tracking-wider block">
              Hitung Checksum SHA-256 &amp; SHA-1 Berkas File (100% Client-Side)
            </span>
            <p className="text-[11px] text-slate-400">
              Verifikasi keaslian dan integritas file tanpa mengirim byte file ke server.
            </p>
          </div>

          <input
            ref={fileHashInputRef}
            type="file"
            onChange={handleFileHash}
            className="hidden"
          />

          <div
            onClick={() => fileHashInputRef.current?.click()}
            className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 bg-[#08090d] rounded-2xl p-10 text-center cursor-pointer transition-all space-y-3"
          >
            <Upload className="w-8 h-8 text-indigo-400 mx-auto" />
            <div>
              <span className="text-xs font-bold text-white block">Pilih atau Tarik File ke Sini</span>
              <span className="text-[11px] text-slate-500">Mendukung sembarang ekstensi (ZIP, ISO, EXE, PDF, Gambar)</span>
            </div>
          </div>

          {fileChecksums && (
            <div className="p-4 bg-[#08090d] border border-slate-800 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-bold">{fileChecksums.fileName}</span>
                <span className="text-slate-400">{(fileChecksums.fileSize / 1024).toFixed(1)} KB</span>
              </div>

              {fileChecksums.isCalculating ? (
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono py-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menghitung SHA-256 &amp; SHA-1...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">SHA-256 Checksum:</span>
                    <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 break-all select-all">
                      <span>{fileChecksums.sha256}</span>
                      <button onClick={() => copyText(fileChecksums.sha256, "fileSha256")} className="p-1 text-slate-400 hover:text-white">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">SHA-1 Checksum:</span>
                    <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-indigo-300 break-all select-all">
                      <span>{fileChecksums.sha1}</span>
                      <button onClick={() => copyText(fileChecksums.sha1, "fileSha1")} className="p-1 text-slate-400 hover:text-white">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
