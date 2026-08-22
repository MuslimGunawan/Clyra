"use client";

import { useState, useMemo, useRef, ChangeEvent } from "react";
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
  Download,
  Upload,
  Search,
  Wand2,
  ArrowRightLeft,
  Layers,
  FileCode2,
  Table,
  ShieldCheck,
  Zap,
  RotateCcw,
  Sliders,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

type GeneratorTarget = "json" | "typescript" | "zod" | "pydantic" | "go" | "rust" | "sql" | "yaml" | "csv" | "tree";

export default function JsonFormatter() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [jsonInput, setJsonInput] = useState<string>(
    JSON.stringify(
      {
        product: "Clyra Workspace",
        version: "2.0.0",
        author: {
          name: "Clyra Core",
          role: "Creative Workspace",
          verified: true
        },
        features: [
          "Image Compressor",
          "Text Transformer",
          "JSON & TypeScript Studio",
          "QR Code Generator"
        ],
        metrics: {
          latencyMs: 12,
          clientSideSecurity: true,
          zeroDataLeak: true,
          dailyRequests: 15400
        },
        pricing: 0.0
      },
      null,
      2
    )
  );

  const [activeTab, setActiveTab] = useState<GeneratorTarget>("typescript");
  const [indentSize, setIndentSize] = useState<number>(2);
  const [rootName, setRootName] = useState<string>("RootSchema");
  const [tsOptionalProps, setTsOptionalProps] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 1. Smart JSON Auto-Repairer (Fixes unquoted keys, single quotes, trailing commas, Python Booleans)
  const repairJsonSyntax = (raw: string): string => {
    let fixed = raw.trim();
    // Replace Python None, True, False
    fixed = fixed.replace(/:\s*True\b/g, ": true");
    fixed = fixed.replace(/:\s*False\b/g, ": false");
    fixed = fixed.replace(/:\s*None\b/g, ": null");
    // Replace single quotes with double quotes
    fixed = fixed.replace(/'/g, '"');
    // Remove trailing commas in objects and arrays
    fixed = fixed.replace(/,\s*([\]}])/g, "$1");
    // Quote unquoted keys: { key: "value" } -> { "key": "value" }
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');
    return fixed;
  };

  const handleAutoRepair = () => {
    try {
      const repaired = repairJsonSyntax(jsonInput);
      const parsed = JSON.parse(repaired);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setJsonInput(formatted);
      showToast("Sintaks JSON berhasil diperbaiki otomatis!", "success");
    } catch {
      showToast("Gagal memperbaiki struktur JSON. Periksa kembali kurung kurawal.", "error");
    }
  };

  // 2. Multi-Language Code Generators
  // TypeScript Interface Generator
  const generateTypeScript = (obj: any, rName = "RootSchema", optional = false): string => {
    const interfaces: string[] = [];

    const getType = (val: any, key: string): string => {
      if (val === null) return "any | null";
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
      const lines = [`export interface ${name} {`];
      const opt = optional ? "?" : "";
      for (const k in data) {
        const type = getType(data[k], k);
        lines.push(`  ${k}${opt}: ${type};`);
      }
      lines.push("}");
      interfaces.push(lines.join("\n"));
    };

    if (typeof obj === "object" && obj !== null) {
      if (Array.isArray(obj)) {
        if (obj.length > 0 && typeof obj[0] === "object") {
          generateInterface(obj[0], "Item");
          interfaces.push(`export type ${rName} = Item[];`);
        } else {
          interfaces.push(`export type ${rName} = any[];`);
        }
      } else {
        generateInterface(obj, rName);
      }
    } else {
      return `export type ${rName} = ${typeof obj};`;
    }

    return interfaces.reverse().join("\n\n");
  };

  // Zod Schema Generator
  const generateZod = (obj: any, rName = "RootSchema"): string => {
    const schemas: string[] = [];

    const getZodType = (val: any, key: string): string => {
      if (val === null) return "z.any().nullable()";
      if (typeof val === "string") return "z.string()";
      if (typeof val === "number") return "z.number()";
      if (typeof val === "boolean") return "z.boolean()";
      if (Array.isArray(val)) {
        if (val.length === 0) return "z.array(z.any())";
        return `z.array(${getZodType(val[0], key)})`;
      }
      if (typeof val === "object") {
        const schemaName = `${key.charAt(0).toLowerCase() + key.slice(1)}Schema`;
        generateZodObj(val, schemaName);
        return schemaName;
      }
      return "z.any()";
    };

    const generateZodObj = (data: any, name: string) => {
      const lines = [`export const ${name} = z.object({`];
      for (const k in data) {
        lines.push(`  ${k}: ${getZodType(data[k], k)},`);
      }
      lines.push("});");
      schemas.push(lines.join("\n"));
    };

    if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
      generateZodObj(obj, `${rName.charAt(0).toLowerCase() + rName.slice(1)}Schema`);
    } else {
      schemas.push(`export const ${rName}Schema = z.any();`);
    }

    return `import { z } from "zod";\n\n` + schemas.reverse().join("\n\n");
  };

  // Python Pydantic Generator
  const generatePydantic = (obj: any, rName = "RootModel"): string => {
    const models: string[] = [];

    const getPyType = (val: any, key: string): string => {
      if (val === null) return "Optional[Any] = None";
      if (typeof val === "string") return "str";
      if (typeof val === "number") return Number.isInteger(val) ? "int" : "float";
      if (typeof val === "boolean") return "bool";
      if (Array.isArray(val)) {
        if (val.length === 0) return "List[Any]";
        return `List[${getPyType(val[0], key)}]`;
      }
      if (typeof val === "object") {
        const modelName = key.charAt(0).toUpperCase() + key.slice(1);
        generateModel(val, modelName);
        return modelName;
      }
      return "Any";
    };

    const generateModel = (data: any, name: string) => {
      const lines = [`class ${name}(BaseModel):`];
      const keys = Object.keys(data);
      if (keys.length === 0) {
        lines.push("    pass");
      } else {
        for (const k of keys) {
          lines.push(`    ${k}: ${getPyType(data[k], k)}`);
        }
      }
      models.push(lines.join("\n"));
    };

    if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
      generateModel(obj, rName);
    } else {
      models.push(`class ${rName}(BaseModel):\n    data: Any`);
    }

    return `from typing import List, Optional, Any\nfrom pydantic import BaseModel\n\n` + models.reverse().join("\n\n");
  };

  // Go Struct Generator
  const generateGo = (obj: any, rName = "RootStruct"): string => {
    const structs: string[] = [];

    const getGoType = (val: any, key: string): string => {
      if (val === null) return "interface{}";
      if (typeof val === "string") return "string";
      if (typeof val === "number") return Number.isInteger(val) ? "int" : "float64";
      if (typeof val === "boolean") return "bool";
      if (Array.isArray(val)) {
        if (val.length === 0) return "[]interface{}";
        return `[]${getGoType(val[0], key)}`;
      }
      if (typeof val === "object") {
        const sName = key.charAt(0).toUpperCase() + key.slice(1);
        generateStruct(val, sName);
        return sName;
      }
      return "interface{}";
    };

    const generateStruct = (data: any, name: string) => {
      const lines = [`type ${name} struct {`];
      for (const k in data) {
        const fieldName = k.charAt(0).toUpperCase() + k.slice(1);
        lines.push(`\t${fieldName}\t${getGoType(data[k], k)}\t\`json:"${k}"\``);
      }
      lines.push("}");
      structs.push(lines.join("\n"));
    };

    if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
      generateStruct(obj, rName);
    } else {
      structs.push(`type ${rName} struct {\n\tData interface{} \`json:"data"\`\n}`);
    }

    return structs.reverse().join("\n\n");
  };

  // Rust Serde Struct Generator
  const generateRust = (obj: any, rName = "RootStruct"): string => {
    const structs: string[] = [];

    const getRustType = (val: any, key: string): string => {
      if (val === null) return "Option<serde_json::Value>";
      if (typeof val === "string") return "String";
      if (typeof val === "number") return Number.isInteger(val) ? "i64" : "f64";
      if (typeof val === "boolean") return "bool";
      if (Array.isArray(val)) {
        if (val.length === 0) return "Vec<serde_json::Value>";
        return `Vec<${getRustType(val[0], key)}>`;
      }
      if (typeof val === "object") {
        const sName = key.charAt(0).toUpperCase() + key.slice(1);
        generateRustStruct(val, sName);
        return sName;
      }
      return "serde_json::Value";
    };

    const generateRustStruct = (data: any, name: string) => {
      const lines = [`#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]`, `#[serde(rename_all = "camelCase")]`, `pub struct ${name} {`];
      for (const k in data) {
        lines.push(`    pub ${k}: ${getRustType(data[k], k)},`);
      }
      lines.push("}");
      structs.push(lines.join("\n"));
    };

    if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
      generateRustStruct(obj, rName);
    } else {
      structs.push(`#[derive(Serialize, Deserialize)]\npub struct ${rName} {\n    pub data: serde_json::Value,\n}`);
    }

    return `use serde::{Deserialize, Serialize};\n\n` + structs.reverse().join("\n\n");
  };

  // SQL DDL Generator
  const generateSQL = (obj: any, tableName = "my_table"): string => {
    if (typeof obj !== "object" || obj === null) return "-- Input must be an object or array";
    const sample = Array.isArray(obj) ? obj[0] : obj;
    if (!sample || typeof sample !== "object") return "-- Empty JSON object";

    const lines = [`CREATE TABLE ${tableName.toLowerCase()} (`];
    const columns: string[] = [];

    for (const k in sample) {
      const val = sample[k];
      let colType = "VARCHAR(255)";
      if (typeof val === "number") {
        colType = Number.isInteger(val) ? "BIGINT" : "DECIMAL(10, 2)";
      } else if (typeof val === "boolean") {
        colType = "BOOLEAN";
      } else if (typeof val === "object") {
        colType = "JSONB";
      } else if (typeof val === "string" && val.length > 255) {
        colType = "TEXT";
      }
      columns.push(`    ${k} ${colType}`);
    }

    lines.push(columns.join(",\n"));
    lines.push(");");
    return lines.join("\n");
  };

  // YAML Converter
  const generateYAML = (obj: any, depth = 0): string => {
    const indentStr = "  ".repeat(depth);
    if (obj === null) return "null";
    if (typeof obj !== "object") return JSON.stringify(obj);

    if (Array.isArray(obj)) {
      if (obj.length === 0) return "[]";
      return obj
        .map((item) => `\n${indentStr}- ${generateYAML(item, depth + 1).trim()}`)
        .join("");
    }

    const lines: string[] = [];
    for (const k in obj) {
      const val = obj[k];
      if (typeof val === "object" && val !== null) {
        lines.push(`${indentStr}${k}:${generateYAML(val, depth + 1)}`);
      } else {
        lines.push(`${indentStr}${k}: ${val === null ? "null" : typeof val === "string" ? `"${val}"` : val}`);
      }
    }
    return lines.length > 0 ? "\n" + lines.join("\n") : "{}";
  };

  // CSV Converter
  const generateCSV = (obj: any): string => {
    const list = Array.isArray(obj) ? obj : [obj];
    if (list.length === 0 || typeof list[0] !== "object") return "No tabular data";

    const headers = Array.from(
      new Set(list.flatMap((item) => (typeof item === "object" && item !== null ? Object.keys(item) : [])))
    );

    const csvRows = [headers.join(",")];
    for (const row of list) {
      const values = headers.map((h) => {
        const val = row[h];
        if (val === undefined || val === null) return '""';
        if (typeof val === "object") return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    }
    return csvRows.join("\n");
  };

  // Parsing and Results Computation
  const parsedData = useMemo(() => {
    if (!jsonInput.trim()) {
      return {
        isValid: true,
        obj: null,
        formattedJson: "",
        typescript: "",
        zod: "",
        pydantic: "",
        go: "",
        rust: "",
        sql: "",
        yaml: "",
        csv: "",
        keyCount: 0,
        error: null,
      };
    }

    try {
      const obj = JSON.parse(jsonInput);
      const formattedJson = JSON.stringify(obj, null, indentSize);
      const typescript = generateTypeScript(obj, rootName, tsOptionalProps);
      const zod = generateZod(obj, rootName);
      const pydantic = generatePydantic(obj, rootName);
      const go = generateGo(obj, rootName);
      const rust = generateRust(obj, rootName);
      const sql = generateSQL(obj, rootName);
      const yaml = generateYAML(obj).trim();
      const csv = generateCSV(obj);

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
        obj,
        formattedJson,
        typescript,
        zod,
        pydantic,
        go,
        rust,
        sql,
        yaml,
        csv,
        keyCount: countKeys(obj),
        error: null,
      };
    } catch (err: any) {
      return {
        isValid: false,
        obj: null,
        formattedJson: "",
        typescript: "",
        zod: "",
        pydantic: "",
        go: "",
        rust: "",
        sql: "",
        yaml: "",
        csv: "",
        keyCount: 0,
        error: err.message,
      };
    }
  }, [jsonInput, indentSize, rootName, tsOptionalProps]);

  // Sort Keys Alphabetically
  const handleSortKeys = (order: "asc" | "desc") => {
    try {
      const sortObject = (o: any): any => {
        if (Array.isArray(o)) return o.map(sortObject);
        if (o !== null && typeof o === "object") {
          return Object.keys(o)
            .sort((a, b) => (order === "asc" ? a.localeCompare(b) : b.localeCompare(a)))
            .reduce((acc: any, key) => {
              acc[key] = sortObject(o[key]);
              return acc;
            }, {});
        }
        return o;
      };

      const parsed = JSON.parse(jsonInput);
      const sorted = sortObject(parsed);
      setJsonInput(JSON.stringify(sorted, null, indentSize));
      showToast(`Key JSON berhasil diurutkan ${order.toUpperCase()}!`, "success");
    } catch {
      showToast("JSON tidak valid.", "error");
    }
  };

  // Minify
  const handleMinify = () => {
    try {
      const obj = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(obj));
      showToast("JSON berhasil diminifikasi!", "info");
    } catch {
      showToast("JSON tidak valid.", "error");
    }
  };

  // Beautify
  const handleBeautify = (spaces: number) => {
    setIndentSize(spaces);
    try {
      const obj = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(obj, null, spaces));
      showToast(`JSON diformat (${spaces} spasi)!`, "info");
    } catch {
      showToast("JSON tidak valid.", "error");
    }
  };

  // Copy Active Output
  const handleCopyActive = async () => {
    const text =
      activeTab === "json"
        ? parsedData.formattedJson
        : activeTab === "typescript"
        ? parsedData.typescript
        : activeTab === "zod"
        ? parsedData.zod
        : activeTab === "pydantic"
        ? parsedData.pydantic
        : activeTab === "go"
        ? parsedData.go
        : activeTab === "rust"
        ? parsedData.rust
        : activeTab === "sql"
        ? parsedData.sql
        : activeTab === "yaml"
        ? parsedData.yaml
        : parsedData.csv;

    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast("Hasil kode berhasil disalin ke clipboard!", "copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Gagal menyalin.", "error");
    }
  };

  // File Upload (.json, .txt)
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonInput(content);
        showToast(`File "${file.name}" berhasil dimuat!`, "success");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // File Download
  const handleDownloadCode = () => {
    const text =
      activeTab === "json"
        ? parsedData.formattedJson
        : activeTab === "typescript"
        ? parsedData.typescript
        : activeTab === "zod"
        ? parsedData.zod
        : activeTab === "pydantic"
        ? parsedData.pydantic
        : activeTab === "go"
        ? parsedData.go
        : activeTab === "rust"
        ? parsedData.rust
        : activeTab === "sql"
        ? parsedData.sql
        : activeTab === "yaml"
        ? parsedData.yaml
        : parsedData.csv;

    if (!text) return;
    const ext =
      activeTab === "json"
        ? "json"
        : activeTab === "typescript"
        ? "ts"
        : activeTab === "zod"
        ? "zod.ts"
        : activeTab === "pydantic"
        ? "py"
        : activeTab === "go"
        ? "go"
        : activeTab === "rust"
        ? "rs"
        : activeTab === "sql"
        ? "sql"
        : activeTab === "yaml"
        ? "yaml"
        : "csv";

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clyra-${rootName.toLowerCase()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`File .${ext} berhasil diunduh!`, "success");
  };

  // Interactive Tree Renderer Component
  const renderJsonTree = (data: any, path = ""): React.ReactNode => {
    if (data === null) return <span className="text-slate-500 italic font-mono">null</span>;
    if (typeof data === "boolean") return <span className="text-amber-400 font-mono font-bold">{String(data)}</span>;
    if (typeof data === "number") return <span className="text-cyan-400 font-mono font-bold">{data}</span>;
    if (typeof data === "string") return <span className="text-emerald-300 font-mono">"{data}"</span>;

    if (Array.isArray(data)) {
      return (
        <div className="pl-4 border-l border-slate-800 space-y-1">
          <span className="text-slate-500 font-mono text-[10px]">Array ({data.length} items)</span>
          {data.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 py-0.5">
              <span className="text-slate-600 font-mono text-[11px]">[{idx}]:</span>
              <div className="flex-1">{renderJsonTree(item, `${path}[${idx}]`)}</div>
            </div>
          ))}
        </div>
      );
    }

    if (typeof data === "object") {
      const keys = Object.keys(data);
      return (
        <div className="pl-4 border-l border-slate-800 space-y-1">
          {keys.map((k) => (
            <div key={k} className="flex items-start gap-2 py-0.5">
              <span className="text-indigo-400 font-mono font-bold text-xs">{k}:</span>
              <div className="flex-1">{renderJsonTree(data[k], `${path}.${k}`)}</div>
            </div>
          ))}
        </div>
      );
    }

    return String(data);
  };

  return (
    <div className="space-y-8">
      {/* 1. TOP PRO BANNER */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-indigo-950/60 border border-indigo-500/30 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>JSON Studio &amp; Multi-Language Schema Generator</span>
              <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                100% Client-Side
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Konversi otomatis ke TypeScript Type, Zod Schema, Python Pydantic, Go Struct, Rust Serde, SQL DDL, YAML &amp; CSV.
            </p>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.txt,.js,.ts"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Upload JSON</span>
          </button>

          <button
            onClick={handleAutoRepair}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold border border-indigo-500/40 transition-all cursor-pointer shadow-sm"
            title="Perbaiki sintaks JSON yang rusak (kutip kunci, trailing comma, Python booleans)"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Auto-Repair JSON</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: JSON INPUT & TOOLS */}
        <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase font-mono">
                  Input JSON Editor
                </span>
              </div>

              {/* Minify / Beautify / Sort actions */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleBeautify(2)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-800 cursor-pointer"
                  title="Format dengan indentasi 2 spasi"
                >
                  Indent 2
                </button>
                <button
                  onClick={() => handleBeautify(4)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-800 cursor-pointer"
                  title="Format dengan indentasi 4 spasi"
                >
                  Indent 4
                </button>
                <button
                  onClick={handleMinify}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-800 cursor-pointer"
                  title="Minify JSON ke 1 baris padat"
                >
                  Minify
                </button>
                <button
                  onClick={() => handleSortKeys("asc")}
                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-800 cursor-pointer"
                  title="Urutkan Key A-Z"
                >
                  A-Z
                </button>
                <button
                  onClick={() => setJsonInput("")}
                  className="p-1 rounded-lg bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 cursor-pointer"
                  title="Kosongkan Editor"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {parsedData.error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 flex items-start gap-2.5 text-xs text-red-300 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="font-bold block mb-0.5">Sintaks JSON Tidak Valid</span>
                  <p className="font-mono text-[11px] text-red-400 break-all">{parsedData.error}</p>
                </div>
                <button
                  onClick={handleAutoRepair}
                  className="px-2 py-1 rounded-lg bg-red-900/60 hover:bg-red-800 text-white font-bold text-[10px] shrink-0 cursor-pointer"
                >
                  Perbaiki Otomatis
                </button>
              </div>
            )}

            {/* Textarea Input */}
            <textarea
              rows={18}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Tempel atau ketik JSON di sini..."
              className="w-full bg-[#08090d] border border-slate-800 rounded-2xl p-4 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed shadow-inner"
            />
          </div>

          <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span>Karakter: {jsonInput.length}</span>
            <span>Total Keys: {parsedData.keyCount}</span>
          </div>
        </div>

        {/* RIGHT COLUMN: GENERATOR & SCHEMA OUTPUT */}
        <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Target Language Selector Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex flex-wrap items-center gap-1.5 max-w-full">
                {(
                  [
                    { id: "typescript", label: "TypeScript", icon: Code2 },
                    { id: "zod", label: "Zod Schema", icon: ShieldCheck },
                    { id: "pydantic", label: "Python (Pydantic)", icon: FileCode2 },
                    { id: "go", label: "Go Struct", icon: Code2 },
                    { id: "rust", label: "Rust Serde", icon: Code2 },
                    { id: "sql", label: "SQL DDL", icon: Table },
                    { id: "yaml", label: "YAML", icon: FileCode2 },
                    { id: "csv", label: "CSV", icon: Table },
                    { id: "tree", label: "Tree View", icon: Layers },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer",
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                          : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleDownloadCode}
                  disabled={!parsedData.isValid}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
                  title="Unduh File Kode"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  onClick={handleCopyActive}
                  disabled={!parsedData.isValid}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Custom Schema Options (Root Name, Optional Props) */}
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-mono">Root Name:</span>
                <input
                  type="text"
                  value={rootName}
                  onChange={(e) => setRootName(e.target.value || "RootSchema")}
                  className="w-32 bg-[#08090d] border border-slate-800 rounded-lg px-2 py-1 text-white font-mono text-xs focus:border-indigo-500 outline-none"
                />
              </div>

              {activeTab === "typescript" && (
                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={tsOptionalProps}
                    onChange={(e) => setTsOptionalProps(e.target.checked)}
                    className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Optional Props (`key?: type`)</span>
                </label>
              )}
            </div>

            {/* Code Output Viewer */}
            <div className="w-full min-h-[380px] max-h-[460px] bg-[#08090d] border border-slate-800 rounded-2xl p-4 text-slate-200 text-xs font-mono leading-relaxed overflow-y-auto select-all shadow-inner">
              {activeTab === "tree" ? (
                parsedData.obj ? (
                  <div className="p-2 space-y-2 select-text">{renderJsonTree(parsedData.obj)}</div>
                ) : (
                  <span className="text-slate-600 italic">Masukkan JSON untuk melihat visualisasi tree...</span>
                )
              ) : activeTab === "typescript" ? (
                <pre className="text-indigo-300 whitespace-pre-wrap">{parsedData.typescript || "// TypeScript interfaces..."}</pre>
              ) : activeTab === "zod" ? (
                <pre className="text-cyan-300 whitespace-pre-wrap">{parsedData.zod || "// Zod schemas..."}</pre>
              ) : activeTab === "pydantic" ? (
                <pre className="text-amber-300 whitespace-pre-wrap">{parsedData.pydantic || "# Python Pydantic models..."}</pre>
              ) : activeTab === "go" ? (
                <pre className="text-sky-300 whitespace-pre-wrap">{parsedData.go || "// Go structs..."}</pre>
              ) : activeTab === "rust" ? (
                <pre className="text-orange-300 whitespace-pre-wrap">{parsedData.rust || "// Rust structs..."}</pre>
              ) : activeTab === "sql" ? (
                <pre className="text-emerald-300 whitespace-pre-wrap">{parsedData.sql || "-- SQL DDL script..."}</pre>
              ) : activeTab === "yaml" ? (
                <pre className="text-purple-300 whitespace-pre-wrap">{parsedData.yaml || "# YAML representation..."}</pre>
              ) : (
                <pre className="text-emerald-300 whitespace-pre-wrap">{parsedData.csv || "CSV data..."}</pre>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Multi-Language Engine Ready</span>
            </span>
            <span className="text-slate-400 uppercase font-bold">.{activeTab}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
