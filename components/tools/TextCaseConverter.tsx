"use client";

import { useState, useMemo } from "react";
import { Copy, Check, Trash2, ArrowUpDown, Sparkles, FileText, Type } from "lucide-react";

export default function TextCaseConverter() {
  const [inputText, setInputText] = useState(
    "Clyra adalah personal workspace dan tools hub yang modern, elegan, dan fleksibel."
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Text statistics
  const stats = useMemo(() => {
    const chars = inputText.length;
    const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    const lines = inputText ? inputText.split(/\r\n|\r|\n/).length : 0;
    const bytes = new Blob([inputText]).size;
    return { chars, words, lines, bytes };
  }, [inputText]);

  // Transformations
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
        reverse: "",
      };
    }

    const words = inputText.trim().split(/[\s_\-]+/);

    const upper = inputText.toUpperCase();
    const lower = inputText.toLowerCase();
    
    // Title Case
    const title = inputText.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    );

    // Sentence Case
    const sentence = inputText
      .toLowerCase()
      .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());

    // Camel Case
    const camel = words
      .map((w, idx) =>
        idx === 0
          ? w.toLowerCase()
          : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      )
      .join("");

    // Pascal Case
    const pascal = words
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("");

    // Kebab Case
    const kebab = words.map((w) => w.toLowerCase()).join("-");

    // Snake Case
    const snake = words.map((w) => w.toLowerCase()).join("_");

    // Constant Case
    const constant = words.map((w) => w.toUpperCase()).join("_");

    // Dot Case
    const dot = words.map((w) => w.toLowerCase()).join(".");

    // Reverse Text
    const reverse = inputText.split("").reverse().join("");

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
      reverse,
    };
  }, [inputText]);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const caseCards = [
    { key: "upper", label: "UPPERCASE", value: transforms.upper },
    { key: "lower", label: "lowercase", value: transforms.lower },
    { key: "title", label: "Title Case", value: transforms.title },
    { key: "sentence", label: "Sentence case", value: transforms.sentence },
    { key: "camel", label: "camelCase", value: transforms.camel },
    { key: "pascal", label: "PascalCase", value: transforms.pascal },
    { key: "kebab", label: "kebab-case", value: transforms.kebab },
    { key: "snake", label: "snake_case", value: transforms.snake },
    { key: "constant", label: "CONSTANT_CASE", value: transforms.constant },
    { key: "dot", label: "dot.case", value: transforms.dot },
    { key: "reverse", label: "Reverse (Terbalik)", value: transforms.reverse },
  ];

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Type className="w-4 h-4 text-indigo-400" />
            <span>Masukkan Teks Input</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setInputText("")}
              disabled={!inputText}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-400 hover:text-red-400 bg-slate-900/80 hover:bg-red-950/30 rounded-lg border border-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Teks</span>
            </button>
          </div>
        </div>

        <textarea
          rows={4}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ketik atau tempel teks Anda di sini..."
          className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-4 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono placeholder:text-slate-600"
        />

        {/* Quick statistics bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-center">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Karakter</div>
            <div className="text-base font-bold text-indigo-300">{stats.chars}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-center">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Kata</div>
            <div className="text-base font-bold text-indigo-300">{stats.words}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-center">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Baris</div>
            <div className="text-base font-bold text-indigo-300">{stats.lines}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-center">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Ukuran Byte</div>
            <div className="text-base font-bold text-indigo-300">{stats.bytes} B</div>
          </div>
        </div>
      </div>

      {/* Output Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Hasil Konversi Realtime</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {caseCards.map((card) => {
            const isCopied = copiedKey === card.key;
            return (
              <div
                key={card.key}
                className="bg-[#0e111a] border border-slate-800/80 rounded-xl p-4 space-y-2.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-indigo-400">
                    {card.label}
                  </span>
                  <button
                    onClick={() => copyToClipboard(card.value, card.key)}
                    disabled={!card.value}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 text-xs font-medium border border-slate-800 hover:border-indigo-500/40 transition-all disabled:opacity-40"
                  >
                    {isCopied ? (
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

                <div className="p-3 bg-[#08090d] border border-slate-800 rounded-lg text-xs font-mono text-slate-200 min-h-[44px] break-all select-all flex items-center">
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
