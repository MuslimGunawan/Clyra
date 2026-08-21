"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { 
  QrCode, 
  Download, 
  Wifi, 
  Globe, 
  Mail, 
  Phone, 
  FileText, 
  Sliders, 
  Check, 
  Copy, 
  Upload, 
  Trash2, 
  Sparkles, 
  Image as ImageIcon,
  Layers,
  Code2
} from "lucide-react";

type QrType = "url" | "text" | "wifi" | "email" | "phone";

export default function QrGenerator() {
  const [qrType, setQrType] = useState<QrType>("url");
  const [urlInput, setUrlInput] = useState("https://clyra.vercel.app");
  const [textInput, setTextInput] = useState("Clyra Personal Workspace");
  const [wifiSsid, setWifiSsid] = useState("MyHomeNetwork");
  const [wifiPass, setWifiPass] = useState("securepassword123");
  const [wifiAuth, setWifiAuth] = useState("WPA");
  const [emailTo, setEmailTo] = useState("contact@clyra.dev");
  const [emailSubject, setEmailSubject] = useState("Hello from Clyra");
  const [phoneNum, setPhoneNum] = useState("+628123456789");

  // Styling & Color
  const [fgColor, setFgColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#08090d");
  const [copied, setCopied] = useState(false);
  const [copiedImg, setCopiedImg] = useState(false);

  // Logo Overlay Feature
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoSizePercent, setLogoSizePercent] = useState<number>(22); // 15% - 30% of QR size
  const [logoBgPadding, setLogoBgPadding] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Preset logo options
  const PRESET_LOGOS = [
    {
      id: "clyra",
      name: "Clyra Icon",
      url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z'/></svg>",
    },
    {
      id: "globe",
      name: "Website",
      url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2338bdf8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><path d='M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20'/><path d='M2 12h20'/></svg>",
    },
    {
      id: "wifi",
      name: "Wi-Fi",
      url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 20h.01'/><path d='M2 8.82a15 15 0 0 1 20 0'/><path d='M5 12.859a10 10 0 0 1 14 0'/><path d='M8.5 16.429a5 5 0 0 1 7 0'/></svg>",
    },
    {
      id: "code",
      name: "Code",
      url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a855f7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='16 18 22 12 16 6'/><polyline points='8 6 2 12 8 18'/></svg>",
    },
  ];

  // Compute raw string payload for QR
  const qrPayload = (() => {
    switch (qrType) {
      case "url":
        return urlInput;
      case "text":
        return textInput;
      case "wifi":
        return `WIFI:T:${wifiAuth};S:${wifiSsid};P:${wifiPass};;`;
      case "email":
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}`;
      case "phone":
        return `tel:${phoneNum}`;
      default:
        return urlInput;
    }
  })();

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Render QR Code onto canvas with High Error Correction (H) & Center Logo overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 360;
    canvas.width = size;
    canvas.height = size;

    const cleanFg = fgColor.replace("#", "");
    const cleanBg = bgColor.replace("#", "");

    // Use ecc=H (High error correction 30% recovery) when logo is present for maximum scannability
    const eccLevel = logoUrl ? "H" : "M";
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
      qrPayload
    )}&color=${cleanFg}&bgcolor=${cleanBg}&ecc=${eccLevel}&margin=12`;

    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.onload = () => {
      // 1. Draw base QR code
      ctx.drawImage(qrImg, 0, 0, size, size);

      // 2. If logo exists, render center logo with padded rounded background
      if (logoUrl) {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.onload = () => {
          const logoDimension = (size * logoSizePercent) / 100;
          const logoX = (size - logoDimension) / 2;
          const logoY = (size - logoDimension) / 2;

          if (logoBgPadding) {
            const pad = 8;
            const badgeX = logoX - pad;
            const badgeY = logoY - pad;
            const badgeSize = logoDimension + pad * 2;
            const radius = 10;

            // Draw rounded badge background
            ctx.fillStyle = bgColor;
            ctx.strokeStyle = fgColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, radius);
            ctx.fill();
            ctx.stroke();
          }

          // Draw the centered logo image
          ctx.drawImage(logoImg, logoX, logoY, logoDimension, logoDimension);
        };
        logoImg.src = logoUrl;
      }
    };
    qrImg.src = qrApiUrl;
  }, [qrPayload, fgColor, bgColor, logoUrl, logoSizePercent, logoBgPadding]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `clyra-qrcode-${Date.now()}.png`;
    a.click();
  };

  const copyQrImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (blob && typeof ClipboardItem !== "undefined") {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCopiedImg(true);
          setTimeout(() => setCopiedImg(false), 2000);
        }
      });
    } catch (e) {
      console.error("Clipboard image copy failed:", e);
    }
  };

  const copyPayload = async () => {
    try {
      await navigator.clipboard.writeText(qrPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Type Selector */}
      <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-2 flex flex-wrap items-center gap-1.5 shadow-xl">
        {[
          { id: "url", label: "Website URL", icon: Globe },
          { id: "text", label: "Plain Text", icon: FileText },
          { id: "wifi", label: "Wi-Fi Network", icon: Wifi },
          { id: "email", label: "Email Link", icon: Mail },
          { id: "phone", label: "Phone Number", icon: Phone },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setQrType(t.id as QrType)}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                qrType === t.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Inputs vs Canvas QR */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Input & Logo Details */}
        <div className="md:col-span-7 bg-[#0e111a] border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="text-sm font-semibold text-white pb-3 border-b border-slate-800 flex items-center justify-between">
            <span>Konfigurasi Isi QR Code</span>
            <span className="text-xs text-indigo-400 font-mono uppercase">{qrType}</span>
          </div>

          {/* Dynamic Payload Form */}
          {qrType === "url" && (
            <div className="space-y-2">
              <label className="text-xs text-slate-300">Website URL Target</label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {qrType === "text" && (
            <div className="space-y-2">
              <label className="text-xs text-slate-300">Teks / Pesan</label>
              <textarea
                rows={4}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Ketik teks yang ingin di-encode..."
                className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {qrType === "wifi" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Nama Wi-Fi (SSID)</label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Password Wi-Fi</label>
                <input
                  type="text"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-slate-100 font-mono focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Tipe Enkripsi</label>
                <select
                  value={wifiAuth}
                  onChange={(e) => setWifiAuth(e.target.value)}
                  className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="WPA">WPA / WPA2 / WPA3</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Tanpa Password (Open)</option>
                </select>
              </div>
            </div>
          )}

          {qrType === "email" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Alamat Email Penerima</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Subjek Default</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>
          )}

          {qrType === "phone" && (
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300">Nomor Telepon</label>
              <input
                type="tel"
                value={phoneNum}
                onChange={(e) => setPhoneNum(e.target.value)}
                placeholder="+62..."
                className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-slate-100 font-mono focus:outline-none"
              />
            </div>
          )}

          {/* LOGO / IMAGE OVERLAY SECTION */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Sisipkan Gambar / Logo di Tengah QR
                </span>
              </div>
              {logoUrl && (
                <button
                  onClick={() => setLogoUrl(null)}
                  className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Logo</span>
                </button>
              )}
            </div>

            {/* Logo Upload & Presets */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Logo Sendiri</span>
                </button>

                <span className="text-xs text-slate-500 font-mono">atau preset:</span>

                {PRESET_LOGOS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setLogoUrl(preset.url)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              {/* Logo Controls if logo is active */}
              {logoUrl && (
                <div className="p-3.5 bg-[#08090d] border border-slate-800 rounded-xl space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Ukuran Logo ({logoSizePercent}%)</span>
                    <input
                      type="range"
                      min="15"
                      max="30"
                      value={logoSizePercent}
                      onChange={(e) => setLogoSizePercent(Number(e.target.value))}
                      className="w-36 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={logoBgPadding}
                      onChange={(e) => setLogoBgPadding(e.target.checked)}
                      className="rounded text-indigo-600 bg-slate-900 border-slate-700 accent-indigo-500"
                    />
                    <span>Berikan background badge pelindung (agar QR tetap terbaca akurat)</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Color customization */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Warna QR (Foreground)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs font-mono text-slate-300">{fgColor}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Warna Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs font-mono text-slate-300">{bgColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Preview & Download */}
        <div className="md:col-span-5 bg-[#0e111a] border border-slate-800/90 rounded-2xl p-6 shadow-xl flex flex-col justify-between items-center space-y-6">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">
              QR Code Preview
            </span>
            <button
              onClick={copyPayload}
              className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Tersalin" : "Salin Data"}</span>
            </button>
          </div>

          {/* Canvas container */}
          <div className="p-4 bg-[#08090d] rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-center relative group">
            <canvas ref={canvasRef} className="rounded-xl max-w-[240px] max-h-[240px] shadow-lg" />
          </div>

          {/* Action buttons */}
          <div className="w-full pt-3 border-t border-slate-800 space-y-2">
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Gambar PNG HD</span>
            </button>

            <button
              onClick={copyQrImage}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
            >
              {copiedImg ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Gambar QR Tersalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Gambar QR ke Clipboard</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
