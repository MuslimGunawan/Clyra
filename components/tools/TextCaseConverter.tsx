"use client";

import { useState, useMemo, useRef, ChangeEvent } from "react";
import { 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  FileText, 
  Type, 
  Download, 
  Upload, 
  Search, 
  Replace, 
  ListOrdered, 
  Eraser, 
  SortAsc, 
  SortDesc, 
  Code2, 
  Clock, 
  Sliders, 
  Wand2, 
  ShieldCheck, 
  Zap,
  ArrowRightLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

// Upside-down character map
const UPSIDE_DOWN_MAP: Record<string, string> = {
  a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ", h: "ɥ", i: "ᴉ", j: "ɾ",
  k: "ʞ", l: "ן", m: "ɯ", n: "u", o: "o", p: "d", q: "b", r: "ɹ", s: "s", t: "ʇ",
  u: "n", v: "ʌ", w: "ʍ", x: "x", y: "ʎ", z: "z",
  A: "∀", B: "ᗺ", C: "Ɔ", D: "ᗡ", E: "Ǝ", F: "Ⅎ", G: "⅁", H: "H", I: "I", J: "ſ",
  K: "ʞ", L: "˥", M: "W", N: "N", O: "O", P: "Ԁ", Q: "Ò", R: "ᴚ", S: "S", T: "⊥",
  U: "∩", V: "Λ", W: "M", X: "X", Y: "⅄", Z: "Z",
  "1": "Ɩ", "2": "ᄅ", "3": "Ɛ", "4": "ㄣ", "5": "ϛ", "6": "9", "7": "ㄥ", "8": "8", "9": "6", "0": "0",
  ".": "˙", ",": "'", "'": ",", "\"": "„", "!": "¡", "?": "¿", "(": ")", ")": "(",
};

export default function TextCaseConverter() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputText, setInputText] = useState(
    "Clyra adalah personal workspace dan tools hub modern yang cepat, elegan, dan fleksibel."
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<"casing" | "developer" | "cleaner" | "encoders">("casing");

  // Find and Replace state
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [isRegex, setIsRegex] = useState(false);
  const [matchCase, setMatchCase] = useState(false);

  // Live Statistics & Reading Metrics
  const stats = useMemo(() => {
    const trimmed = inputText.trim();
    const chars = inputText.length;
    const charsNoSpaces = inputText.replace(/\s/g, "").length;
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const lines = inputText ? inputText.split(/\r\n|\r|\n/).length : 0;
    const sentences = trimmed ? (inputText.match(/[^.!?]+[.!?]+/g) || []).length || (trimmed ? 1 : 0) : 0;
    const paragraphs = trimmed ? inputText.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length : 0;
    const bytes = new Blob([inputText]).size;
    
    // Average reading speed: 200 words per minute
    const readTimeMinutes = words > 0 ? Math.ceil(words / 200) : 0;
    const readTimeSeconds = words > 0 ? Math.ceil((words / 200) * 60) : 0;
    const speakTimeSeconds = words > 0 ? Math.ceil((words / 130) * 60) : 0;

    return {
      chars,
      charsNoSpaces,
      words,
      lines,
      sentences,
      paragraphs,
      bytes,
      readTimeSeconds,
      speakTimeSeconds,
    };
  }, [inputText]);

  // Clean Words Array Helper
  const wordsArray = useMemo(() => {
    if (!inputText.trim()) return [];
    return inputText
      .trim()
      .replace(/[^\w\s-]/g, " ")
      .split(/[\s_\-]+/)
      .filter((w) => w.length > 0);
  }, [inputText]);

  // Comprehensive Transformations
  const transforms = useMemo(() => {
    if (!inputText) {
      return {
        upper: "",
        lower: "",
        title: "",
        sentence: "",
        camel: "",
        pascal: "",
        kebab: "",
        snake: "",
        constant: "",
        dot: "",
        path: "",
        header: "",
        sponge: "",
        inverse: "",
        reversed: "",
        reversedWords: "",
        upsideDown: "",
        rot13: "",
        base64: "",
        urlEncode: "",
        binary: "",
        hex: "",
      };
    }

    const words = wordsArray;

    // Standard Cases
    const upper = inputText.toUpperCase();
    const lower = inputText.toLowerCase();

    // Title Case (Capitalize each word)
    const title = inputText.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    );

    // Sentence case (Capitalize start of sentences)
    const sentence = inputText
      .toLowerCase()
      .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());

    // Programming Cases
    const camel = words
      .map((w, idx) =>
        idx === 0
          ? w.toLowerCase()
          : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      )
      .join("");

    const pascal = words
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("");

    const kebab = words.map((w) => w.toLowerCase()).join("-");
    const snake = words.map((w) => w.toLowerCase()).join("_");
    const constant = words.map((w) => w.toUpperCase()).join("_");
    const dot = words.map((w) => w.toLowerCase()).join(".");
    const path = words.map((w) => w.toLowerCase()).join("/");
    const header = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("-");

    // Fun / Alternating Cases
    const sponge = inputText
      .split("")
      .map((char, index) => (index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()))
      .join("");

    const inverse = inputText
      .split("")
      .map((char) =>
        char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
      )
      .join("");

    const reversed = inputText.split("").reverse().join("");

    const reversedWords = inputText
      .split(/\s+/)
      .reverse()
      .join(" ");

    // Upside Down
    const upsideDown = inputText
      .split("")
      .reverse()
      .map((c) => UPSIDE_DOWN_MAP[c] || c)
      .join("");

    // Rot13
    const rot13 = inputText.replace(/[a-zA-Z]/g, (c) => {
      const base = c <= "Z" ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
    });

    // Base64
    let base64 = "";
    try {
      base64 = btoa(unescape(encodeURIComponent(inputText)));
    } catch {
      base64 = "Gagal encode Base64";
    }

    // URL Encode
    const urlEncode = encodeURIComponent(inputText);

    // Binary
    const binary = inputText
      .split("")
      .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
      .join(" ");

    // Hex
    const hex = inputText
      .split("")
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join(" ");

    return {
      upper,
      lower,
      title,
      sentence,
      camel,
      pascal,
      kebab,
      snake,
      constant,
      dot,
      path,
      header,
      sponge,
      inverse,
      reversed,
      reversedWords,
      upsideDown,
      rot13,
      base64,
      urlEncode,
      binary,
      hex,
    };
  }, [inputText, wordsArray]);

  // Copy to Clipboard
  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast("Teks berhasil disalin ke clipboard!", "copied");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      showToast("Gagal menyalin.", "error");
    }
  };

  // 1-Click Cleaners (Modifies inputText directly)
  const applyCleaner = (action: string) => {
    let result = inputText;

    if (action === "trim") {
      result = inputText
        .split("\n")
        .map((l) => l.trim())
        .join("\n")
        .trim();
    } else if (action === "removeBlankLines") {
      result = inputText
        .split("\n")
        .filter((l) => l.trim().length > 0)
        .join("\n");
    } else if (action === "singleLine") {
      result = inputText.replace(/\r?\n|\r/g, " ").replace(/\s+/g, " ").trim();
    } else if (action === "removeExtraSpaces") {
      result = inputText.replace(/[ \t]+/g, " ");
    } else if (action === "removeDuplicateLines") {
      const lines = inputText.split("\n");
      result = Array.from(new Set(lines)).join("\n");
    } else if (action === "sortAsc") {
      result = inputText
        .split("\n")
        .sort((a, b) => a.localeCompare(b))
        .join("\n");
    } else if (action === "sortDesc") {
      result = inputText
        .split("\n")
        .sort((a, b) => b.localeCompare(a))
        .join("\n");
    } else if (action === "addNumberedList") {
      result = inputText
        .split("\n")
        .map((l, i) => `${i + 1}. ${l}`)
        .join("\n");
    } else if (action === "addBulletList") {
      result = inputText
        .split("\n")
        .map((l) => `• ${l}`)
        .join("\n");
    } else if (action === "removeNumbers") {
      result = inputText.replace(/^\s*\d+[\.\)]\s*/gm, "");
    } else if (action === "wrapQuotes") {
      result = inputText
        .split("\n")
        .map((l) => `"${l}"`)
        .join("\n");
    } else if (action === "removeSpecialChars") {
      result = inputText.replace(/[^a-zA-Z0-9\s]/g, "");
    }

    setInputText(result);
    showToast("Pembersihan teks diterapkan!", "info");
  };

  // Find & Replace Handler
  const handleFindReplace = () => {
    if (!findText) {
      showToast("Ketik kata yang ingin dicari.", "error");
      return;
    }

    try {
      let regex: RegExp;
      if (isRegex) {
        regex = new RegExp(findText, matchCase ? "g" : "gi");
      } else {
        const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        regex = new RegExp(escaped, matchCase ? "g" : "gi");
      }

      const replaced = inputText.replace(regex, replaceText);
      setInputText(replaced);
      showToast("Cari & Ganti berhasil diterapkan!", "success");
    } catch {
      showToast("Pola regex tidak valid.", "error");
    }
  };

  // File Upload (.txt, .md)
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
        showToast(`File "${file.name}" berhasil dimuat!`, "success");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Download as .txt
  const handleDownloadTxt = () => {
    if (!inputText) return;
    const blob = new Blob([inputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clyra-text-export-${Date.now().toString().slice(-4)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("File .txt berhasil diunduh!", "success");
  };

  // Categorized Cards
  const casingCards = [
    { key: "upper", label: "UPPERCASE", desc: "SEMUA HURUF BESAR", value: transforms.upper },
    { key: "lower", label: "lowercase", desc: "semua huruf kecil", value: transforms.lower },
    { key: "title", label: "Title Case", desc: "Huruf Besar Di Awal Setiap Kata", value: transforms.title },
    { key: "sentence", label: "Sentence case", desc: "Huruf besar di awal kalimat.", value: transforms.sentence },
    { key: "sponge", label: "aLtErNaTiNg cAsE", desc: "Huruf besar kecil berselang-seling", value: transforms.sponge },
    { key: "inverse", label: "InVeRsE cAsE", desc: "Membalik huruf besar ke kecil dan sebaliknya", value: transforms.inverse },
  ];

  const developerCards = [
    { key: "camel", label: "camelCase", desc: "Variabel JavaScript / TypeScript", value: transforms.camel },
    { key: "pascal", label: "PascalCase", desc: "Nama Komponen & Class", value: transforms.pascal },
    { key: "kebab", label: "kebab-case", desc: "URL Slug & CSS Classes", value: transforms.kebab },
    { key: "snake", label: "snake_case", desc: "Kolom Database & Python", value: transforms.snake },
    { key: "constant", label: "CONSTANT_CASE", desc: "Konstanta & Environment Variables", value: transforms.constant },
    { key: "dot", label: "dot.case", desc: "Objek dot notation / package", value: transforms.dot },
    { key: "path", label: "path/case", desc: "Struktur URL atau File Path", value: transforms.path },
    { key: "header", label: "Header-Case", desc: "HTTP Header Standard", value: transforms.header },
  ];

  const encoderCards = [
    { key: "urlEncode", label: "URL Encode", desc: "URL Safe Query Parameter", value: transforms.urlEncode },
    { key: "base64", label: "Base64 Encode", desc: "Standar String Base64", value: transforms.base64 },
    { key: "hex", label: "Hexadecimal", desc: "Nilai Hex Byte", value: transforms.hex },
    { key: "binary", label: "Binary (0/1)", desc: "Representasi Bit Biner", value: transforms.binary },
    { key: "rot13", label: "Rot13 Cipher", desc: "Sandi Caesar 13 Langkah", value: transforms.rot13 },
    { key: "upsideDown", label: "Upside Down", desc: "Teks Terbalik Vertikal", value: transforms.upsideDown },
    { key: "reversed", label: "Reverse Karakter", desc: "Pembalikan Teks Karakter Total", value: transforms.reversed },
    { key: "reversedWords", label: "Reverse Urutan Kata", desc: "Membalik urutan kata", value: transforms.reversedWords },
  ];

  return (
    <div className="space-y-8">
      {/* 1. INPUT EDITOR & ANALYTICS */}
      <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Type className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Editor Input Teks</h2>
              <p className="text-[11px] text-slate-400">Ketik, tempel teks, atau upload file teks (.txt / .md)</p>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.json,.csv,.js,.ts"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Buka File</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              disabled={!inputText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Unduh .TXT</span>
            </button>

            <button
              onClick={() => copyToClipboard(inputText, "input")}
              disabled={!inputText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all disabled:opacity-40 cursor-pointer"
            >
              {copiedKey === "input" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Salin Semua</span>
                </>
              )}
            </button>

            <button
              onClick={() => setInputText("")}
              disabled={!inputText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 text-xs font-semibold border border-slate-800 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan</span>
            </button>
          </div>
        </div>

        {/* Textarea Input */}
        <textarea
          rows={6}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ketik atau tempel teks di sini..."
          className="w-full bg-[#08090d] border border-slate-800 rounded-2xl p-4 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono placeholder:text-slate-600 shadow-inner"
        />

        {/* Live Statistics & Readability Counter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1 text-center font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-500 uppercase">Karakter</div>
            <div className="text-sm font-bold text-white">{stats.chars}</div>
            <div className="text-[9px] text-slate-500">{stats.charsNoSpaces} tanpa spasi</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-500 uppercase">Kata</div>
            <div className="text-sm font-bold text-indigo-300">{stats.words}</div>
            <div className="text-[9px] text-slate-500">Total Kata</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-500 uppercase">Baris</div>
            <div className="text-sm font-bold text-white">{stats.lines}</div>
            <div className="text-[9px] text-slate-500">{stats.paragraphs} Paragraf</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-500 uppercase">Kalimat</div>
            <div className="text-sm font-bold text-white">{stats.sentences}</div>
            <div className="text-[9px] text-slate-500">Struktur Kalimat</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-500 uppercase">Waktu Baca</div>
            <div className="text-sm font-bold text-emerald-400">~{stats.readTimeSeconds}s</div>
            <div className="text-[9px] text-slate-500">Bicara: ~{stats.speakTimeSeconds}s</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-500 uppercase">Ukuran Byte</div>
            <div className="text-sm font-bold text-amber-300">{stats.bytes} B</div>
            <div className="text-[9px] text-slate-500">UTF-8 Format</div>
          </div>
        </div>

        {/* 1-Click Quick Cleaners Toolbar */}
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Pembersihan Teks 1-Klik (Terapkan ke Input):</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => applyCleaner("trim")}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 hover:border-indigo-500/40 transition-colors cursor-pointer"
            >
              ✂️ Trim Spasi Ujung
            </button>
            <button
              onClick={() => applyCleaner("removeBlankLines")}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 hover:border-indigo-500/40 transition-colors cursor-pointer"
            >
              🧹 Hapus Baris Kosong
            </button>
            <button
              onClick={() => applyCleaner("singleLine")}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 hover:border-indigo-500/40 transition-colors cursor-pointer"
            >
              📏 Satukan ke 1 Baris
            </button>
            <button
              onClick={() => applyCleaner("removeExtraSpaces")}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 hover:border-indigo-500/40 transition-colors cursor-pointer"
            >
              ⎵ Hapus Spasi Ganda
            </button>
            <button
              onClick={() => applyCleaner("removeDuplicateLines")}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 hover:border-indigo-500/40 transition-colors cursor-pointer"
            >
              🧬 Hapus Baris Duplikat
            </button>
            <button
              onClick={() => applyCleaner("sortAsc")}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 hover:border-indigo-500/40 transition-colors cursor-pointer"
            >
              🔼 Urutkan A-Z
            </button>
            <button
              onClick={() => applyCleaner("sortDesc")}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 hover:border-indigo-500/40 transition-colors cursor-pointer"
            >
              🔽 Urutkan Z-A
            </button>
            <button
              onClick={() => applyCleaner("addNumberedList")}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 hover:border-indigo-500/40 transition-colors cursor-pointer"
            >
              🔢 Tambah Nomor Baris (1, 2, 3..)
            </button>
            <button
              onClick={() => applyCleaner("addBulletList")}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 hover:border-indigo-500/40 transition-colors cursor-pointer"
            >
              • Tambah Bullet List
            </button>
            <button
              onClick={() => applyCleaner("removeSpecialChars")}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 hover:border-indigo-500/40 transition-colors cursor-pointer"
            >
              🔤 Hanya Alfanumerik
            </button>
          </div>
        </div>

        {/* Live Find & Replace Bar */}
        <div className="p-4 rounded-2xl bg-[#08090d] border border-slate-800/90 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Cari teks..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 outline-none font-mono"
            />
          </div>

          <div className="relative flex-1 w-full">
            <Replace className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Ganti dengan..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 outline-none font-mono"
            />
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => setMatchCase(!matchCase)}
              className={cn(
                "px-2.5 py-2 rounded-xl text-[10px] font-mono border transition-colors cursor-pointer",
                matchCase ? "bg-indigo-600/30 text-indigo-300 border-indigo-500 font-bold" : "bg-slate-900 text-slate-500 border-slate-800"
              )}
              title="Match Case (Sensitif Huruf Besar/Kecil)"
            >
              Aa
            </button>

            <button
              onClick={() => setIsRegex(!isRegex)}
              className={cn(
                "px-2.5 py-2 rounded-xl text-[10px] font-mono border transition-colors cursor-pointer",
                isRegex ? "bg-indigo-600/30 text-indigo-300 border-indigo-500 font-bold" : "bg-slate-900 text-slate-500 border-slate-800"
              )}
              title="Aktifkan Regular Expression (Regex)"
            >
              .*
            </button>

            <button
              onClick={handleFindReplace}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              Ganti Semua
            </button>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME TRANSFORMATIONS CATALOG */}
      <div className="space-y-5">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Katalog Hasil Konversi Realtime:</h3>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0e111a] p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveCategory("casing")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer",
                activeCategory === "casing"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Tipografi &amp; Huruf
            </button>

            <button
              onClick={() => setActiveCategory("developer")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer",
                activeCategory === "developer"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Format Koding (Dev)
            </button>

            <button
              onClick={() => setActiveCategory("encoders")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer",
                activeCategory === "encoders"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Enkoder &amp; Sandi
            </button>
          </div>
        </div>

        {/* CARDS DISPLAY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(activeCategory === "casing"
            ? casingCards
            : activeCategory === "developer"
            ? developerCards
            : encoderCards
          ).map((card) => {
            const isCopied = copiedKey === card.key;
            return (
              <div
                key={card.key}
                className="bg-[#0e111a] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 space-y-3 transition-all group flex flex-col justify-between shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-300 block">
                      {card.label}
                    </span>
                    <span className="text-[10px] text-slate-500">{card.desc}</span>
                  </div>

                  <button
                    onClick={() => copyToClipboard(card.value, card.key)}
                    disabled={!card.value}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 text-xs font-semibold border border-slate-800 hover:border-indigo-500/40 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 text-[11px]">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Salin</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 bg-[#08090d] border border-slate-800/90 rounded-xl text-xs font-mono text-slate-200 min-h-[48px] break-all select-all flex items-center shadow-inner">
                  {card.value || <span className="text-slate-600 italic">Belum ada input teks...</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
