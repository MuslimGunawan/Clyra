"use client";

import { useState, useMemo } from "react";
import { 
  FileJson, 
  Copy, 
  Check, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Minimize2, 
  Maximize2,
  Code2,
  Crown
} from "lucide-react";

type OutputView = "json" | "typescript" | "tree";

export default function JsonFormatter() {
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(
      {
        site: "Clyra Platform",
        version: "2.0.0",
        creator: "Personal Workspace",
        plan: "PRO_UNLOCKED_FREE",
        features: ["Tools Hub", "AI Prompt Gallery", "Portfolio", "Dark Aesthetic"],
        stats: {
          toolsCount: 10,
          clientSideOnly: true,
          offlineCapable: true,
          freeForever: true
        }
      },
      null,
      2
    )
  );

  const [activeTab, setActiveTab] = useState<OutputView>("json");
  const [indent, setIndent] = useState<number | string>(2);
  const [copied, setCopied] = useState(false);

  // Helper to convert JSON to TypeScript Interfaces (PRO Feature)
  const generateTypeScriptTypes = (obj: any, rootName = "RootObject"): string => {
    const interfaces: string[] = [];

    const getType = (val: any, key: string): string => {
      if (val === null) return "null | any";
      if (Array.isArray(val)) {
        if (val.length === 0) return "any[]";
        const firstType = getType(val[0], key);
        return `${firstType}[]`;
      }
      if (typeof val === "object") {
        const interfaceName = key.charAt(0).toUpperCase() + key.slice(1);
        generateInterface(val, interfaceName);
        return interfaceName;
      }
      return typeof val;
    };

    const generateInterface = (data: any, name: string) => {
      let lines = [`export interface ${name} {`];
      for (const k in data) {
        const type = getType(data[k], k);
        lines.push(`  ${k}: ${type};`);
      }
      lines.push("}");
      interfaces.push(lines.join("\n"));
    };

    if (typeof obj === "object" && obj !== null) {
      if (Array.isArray(obj)) {
        if (obj.length > 0 && typeof obj[0] === "object") {
          generateInterface(obj[0], "Item");
          interfaces.push(`export type ${rootName} = Item[];`);
        } else {
          interfaces.push(`export type ${rootName} = any[];`);
        }
      } else {
        generateInterface(obj, rootName);
      }
    } else {
      return `export type ${rootName} = ${typeof obj};`;
    }

    return interfaces.reverse().join("\n\n");
  };

  // Parsing and validation
  const parsedData = useMemo(() => {
    if (!jsonInput.trim()) {
      return { isValid: true, output: "", tsOutput: "", error: null, keyCount: 0 };
    }

    try {
      const obj = JSON.parse(jsonInput);
      const output = JSON.stringify(obj, null, indent);
      const tsOutput = generateTypeScriptTypes(obj);
      
      const countKeys = (item: any): number => {
        if (typeof item !== "object" || item === null) return 0;
        let count = Array.isArray(item) ? item.length : Object.keys(item).length;
        for (const k in item) {
          if (typeof item[k] === "object" && item[k] !== null) {
            count += countKeys(item[k]);
          }
        }
        return count;
      };

      return {
        isValid: true,
        output,
        tsOutput,
        error: null,
        keyCount: countKeys(obj),
      };
    } catch (err: any) {
      return {
        isValid: false,
        output: "",
        tsOutput: "",
        error: err.message,
        keyCount: 0,
      };
    }
  }, [jsonInput, indent]);

  const handleMinify = () => {
    try {
      const obj = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(obj));
    } catch (err) {
      // Keep input
    }
  };

  const handleBeautify = (spaces: number) => {
    setIndent(spaces);
    try {
      const obj = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(obj, null, spaces));
    } catch (err) {
      // Keep input
    }
  };

  const handleCopy = async () => {
    const textToCopy = activeTab === "typescript" ? parsedData.tsOutput : parsedData.output;
    if (!parsedData.isValid || !textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSample = (type: "user" | "ecommerce" | "theme") => {
    if (type === "user") {
      setJsonInput(
        JSON.stringify(
          {
            id: "usr_99x",
            name: "Alex Rivera",
            email: "alex@clyra.dev",
            role: "Fullstack Architect",
            preferences: { theme: "dark", notifications: true, language: "id" }
          },
          null,
          2
        )
      );
    } else if (type === "ecommerce") {
      setJsonInput(
        JSON.stringify(
          {
            orderId: "ORD-2026-9921",
            totalAmount: 450.0,
            currency: "USD",
            items: [
              { sku: "CLY-01", name: "Mechanical Keyboard 75%", qty: 1, price: 180.0 },
              { sku: "CLY-02", name: "Deskmat Dark Fluid", qty: 1, price: 35.0 }
            ],
            status: "delivered"
          },
          null,
          2
        )
      );
    } else {
      setJsonInput(
        JSON.stringify(
          {
            theme: "clyra-obsidian",
            colors: {
              background: "#08090d",
              surface: "#0e111a",
              accent: "#6366f1",
              border: "#1e2436"
            }
          },
          null,
          2
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Pro Unlocked Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-cyan-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <span>Fitur Premium Tidak Terkunci</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase font-bold">
                100% Gratis Tanpa Batasan
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Termasuk generator TypeScript Type interfaces instan, validator sintaks realtime, dan formatter tanpa rate limit.
            </div>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Sample presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Preset Sample:</span>
          <button
            onClick={() => loadSample("user")}
            className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-800 transition-colors"
          >
            User Profile
          </button>
          <button
            onClick={() => loadSample("ecommerce")}
            className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-800 transition-colors"
          >
            Order Data
          </button>
          <button
            onClick={() => loadSample("theme")}
            className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-800 transition-colors"
          >
            Theme Config
          </button>
        </div>

        {/* Formatting Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleBeautify(2)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-medium transition-all"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Format (2 Spasi)</span>
          </button>
          <button
            onClick={() => handleBeautify(4)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-medium transition-all"
          >
            <span>Format (4 Spasi)</span>
          </button>
          <button
            onClick={handleMinify}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-all"
          >
            <Minimize2 className="w-3 h-3" />
            <span>Minify</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Input & Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* JSON Input */}
        <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-200 uppercase font-mono">
                  Input JSON
                </span>
              </div>
              <button
                onClick={() => setJsonInput("")}
                className="text-xs text-slate-400 hover:text-red-400 transition-colors"
              >
                Hapus
              </button>
            </div>

            <textarea
              rows={14}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Tempel atau ketik JSON di sini..."
              className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-4 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span>Karakter: {jsonInput.length}</span>
            <span>Baris: {jsonInput ? jsonInput.split("\n").length : 0}</span>
          </div>
        </div>

        {/* JSON Formatted Output / TypeScript Generator Tab */}
        <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              {/* Output Tab Switcher */}
              <div className="flex items-center bg-[#08090d] p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveTab("json")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "json"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Formatted JSON
                </button>
                <button
                  onClick={() => setActiveTab("typescript")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "typescript"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>TypeScript Types (PRO)</span>
                </button>
              </div>

              <button
                onClick={handleCopy}
                disabled={!parsedData.isValid || !parsedData.output}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-40"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-300" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin {activeTab === "typescript" ? "Types" : "JSON"}</span>
                  </>
                )}
              </button>
            </div>

            {parsedData.error ? (
              <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50 space-y-2 text-red-300 text-xs">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Sintaks JSON Tidak Valid</span>
                </div>
                <div className="font-mono bg-[#08090d] p-3 rounded-lg border border-red-900/40 text-[11px] select-all">
                  {parsedData.error}
                </div>
              </div>
            ) : (
              <div className="w-full min-h-[285px] bg-[#08090d] border border-slate-800 rounded-xl p-4 text-slate-200 text-xs font-mono leading-relaxed overflow-y-auto max-h-80 select-all">
                {activeTab === "typescript" ? (
                  <pre className="text-indigo-300 whitespace-pre-wrap">
                    {parsedData.tsOutput || "// Generate TypeScript types..."}
                  </pre>
                ) : parsedData.output ? (
                  <pre className="whitespace-pre-wrap">{parsedData.output}</pre>
                ) : (
                  <span className="text-slate-600 italic">JSON output terformat akan muncul di sini...</span>
                )}
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span>Total Keys: {parsedData.keyCount}</span>
            <span className="text-emerald-400 font-semibold">Pro Feature Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
