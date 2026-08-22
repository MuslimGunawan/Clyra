"use client";

import { useState, useEffect, useRef, ChangeEvent, useMemo } from "react";
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
  Code2,
  Contact,
  MessageCircle,
  MessageSquare,
  MapPin,
  Calendar,
  CreditCard,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Maximize2,
  Palette
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

type QrType = 
  | "url" 
  | "text" 
  | "wifi" 
  | "vcard" 
  | "whatsapp" 
  | "email" 
  | "phone" 
  | "sms" 
  | "location";

export default function QrGenerator() {
  const { showToast } = useToast();

  // QR Content States
  const [qrType, setQrType] = useState<QrType>("url");

  // Type: URL
  const [urlInput, setUrlInput] = useState("https://clyra.vercel.app");

  // Type: Text
  const [textInput, setTextInput] = useState("Clyra Workspace — Modern Productivity Hub");

  // Type: Wi-Fi
  const [wifiSsid, setWifiSsid] = useState("Clyra-WiFi-5G");
  const [wifiPass, setWifiPass] = useState("supersecure2026");
  const [wifiAuth, setWifiAuth] = useState("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);

  // Type: vCard Contact
  const [vcardName, setVcardName] = useState("Clyra Studio");
  const [vcardPhone, setVcardPhone] = useState("+628123456789");
  const [vcardEmail, setVcardEmail] = useState("contact@clyra.dev");
  const [vcardOrg, setVcardOrg] = useState("Clyra Platform");
  const [vcardTitle, setVcardTitle] = useState("Lead Workspace");
  const [vcardWebsite, setVcardWebsite] = useState("https://clyra.vercel.app");

  // Type: WhatsApp
  const [waPhone, setWaPhone] = useState("+628123456789");
  const [waMessage, setWaMessage] = useState("Halo Clyra! Saya ingin bertanya mengenai...");

  // Type: Email
  const [emailTo, setEmailTo] = useState("contact@clyra.dev");
  const [emailSubject, setEmailSubject] = useState("Pertanyaan tentang Clyra Workspace");
  const [emailBody, setEmailBody] = useState("Halo, saya menemukan profil Anda di Clyra.");

  // Type: Phone & SMS
  const [phoneNum, setPhoneNum] = useState("+628123456789");
  const [smsPhone, setSmsPhone] = useState("+628123456789");
  const [smsBody, setSmsBody] = useState("Pesan otomatis dari QR Clyra.");

  // Type: Location / GPS
  const [locLat, setLocLat] = useState("-6.2088");
  const [locLng, setLocLng] = useState("106.8456");

  // Styling & Color Options
  const [fgColor, setFgColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#08090d");
  const [isTransparentBg, setIsTransparentBg] = useState(false);
  const [exportResolution, setExportResolution] = useState<number>(1024);
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("H");
  const [ctaFrame, setCtaFrame] = useState<string>("none"); // "none" | "scan_me" | "connect_wifi" | "visit"

  // Logo Overlay Feature
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoSizePercent, setLogoSizePercent] = useState<number>(22);
  const [logoBgPadding, setLogoBgPadding] = useState<boolean>(true);
  const [logoBadgeShape, setLogoBadgeShape] = useState<"rounded" | "circle">("rounded");

  const [copied, setCopied] = useState(false);
  const [copiedImg, setCopiedImg] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Preset logo options
  const PRESET_LOGOS = [
    {
      id: "clyra",
      name: "✦ Clyra",
      url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z'/></svg>",
    },
    {
      id: "globe",
      name: "🌐 Web",
      url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2338bdf8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><path d='M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20'/><path d='M2 12h20'/></svg>",
    },
    {
      id: "wifi",
      name: "📶 Wi-Fi",
      url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 20h.01'/><path d='M2 8.82a15 15 0 0 1 20 0'/><path d='M5 12.859a10 10 0 0 1 14 0'/><path d='M8.5 16.429a5 5 0 0 1 7 0'/></svg>",
    },
    {
      id: "whatsapp",
      name: "💬 WA",
      url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2322c55e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z'/></svg>",
    },
    {
      id: "code",
      name: "💻 Code",
      url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a855f7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='16 18 22 12 16 6'/><polyline points='8 6 2 12 8 18'/></svg>",
    },
    {
      id: "location",
      name: "📍 Maps",
      url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z'/><circle cx='12' cy='10' r='3'/></svg>",
    },
  ];

  // Compute raw payload string
  const qrPayload = useMemo(() => {
    switch (qrType) {
      case "url":
        return urlInput.trim();
      case "text":
        return textInput;
      case "wifi":
        return `WIFI:T:${wifiAuth};S:${wifiSsid};P:${wifiPass};H:${wifiHidden ? "true" : "false"};;`;
      case "vcard":
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nFN:${vcardName}\nORG:${vcardOrg}\nTITLE:${vcardTitle}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nURL:${vcardWebsite}\nEND:VCARD`;
      case "whatsapp": {
        const cleanPhone = waPhone.replace(/[^\d+]/g, "").replace(/^\+/, "");
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;
      }
      case "email":
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case "phone":
        return `tel:${phoneNum}`;
      case "sms":
        return `smsto:${smsPhone}:${smsBody}`;
      case "location":
        return `https://maps.google.com/?q=${locLat},${locLng}`;
      default:
        return urlInput;
    }
  }, [
    qrType,
    urlInput,
    textInput,
    wifiSsid,
    wifiPass,
    wifiAuth,
    wifiHidden,
    vcardName,
    vcardPhone,
    vcardEmail,
    vcardOrg,
    vcardTitle,
    vcardWebsite,
    waPhone,
    waMessage,
    emailTo,
    emailSubject,
    emailBody,
    phoneNum,
    smsPhone,
    smsBody,
    locLat,
    locLng,
  ]);

  // Logo file upload handler
  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoUrl(event.target?.result as string);
      showToast("Logo berhasil dimuat!", "success");
    };
    reader.readAsDataURL(file);
  };

  // Render QR Canvas Engine with HD Resolution & Center Logo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderSize = 512;
    const hasFrame = ctaFrame !== "none";
    const frameHeight = hasFrame ? 64 : 0;
    const totalW = renderSize;
    const totalH = renderSize + frameHeight;

    canvas.width = totalW;
    canvas.height = totalH;

    const cleanFg = fgColor.replace("#", "");
    const cleanBg = isTransparentBg ? "ffffff00" : bgColor.replace("#", "");

    const eccLevel = logoUrl ? "H" : errorCorrection;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${renderSize}x${renderSize}&data=${encodeURIComponent(
      qrPayload || "Clyra"
    )}&color=${cleanFg}&bgcolor=${cleanBg}&ecc=${eccLevel}&margin=14`;

    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.onload = () => {
      ctx.clearRect(0, 0, totalW, totalH);

      // Background
      if (!isTransparentBg) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, totalW, totalH);
      }

      // Draw QR Code
      ctx.drawImage(qrImg, 0, 0, renderSize, renderSize);

      // Draw Center Logo if enabled
      if (logoUrl) {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.onload = () => {
          const logoDimension = (renderSize * logoSizePercent) / 100;
          const logoX = (renderSize - logoDimension) / 2;
          const logoY = (renderSize - logoDimension) / 2;

          if (logoBgPadding) {
            const pad = 10;
            const badgeX = logoX - pad;
            const badgeY = logoY - pad;
            const badgeSize = logoDimension + pad * 2;

            ctx.fillStyle = isTransparentBg ? "#08090d" : bgColor;
            ctx.strokeStyle = fgColor;
            ctx.lineWidth = 2;
            ctx.beginPath();

            if (logoBadgeShape === "circle") {
              ctx.arc(
                badgeX + badgeSize / 2,
                badgeY + badgeSize / 2,
                badgeSize / 2,
                0,
                Math.PI * 2
              );
            } else {
              ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, 14);
            }
            ctx.fill();
            ctx.stroke();
          }

          // Clip image to shape if circle
          ctx.save();
          if (logoBadgeShape === "circle" && logoBgPadding) {
            ctx.beginPath();
            ctx.arc(
              logoX + logoDimension / 2,
              logoY + logoDimension / 2,
              logoDimension / 2,
              0,
              Math.PI * 2
            );
            ctx.clip();
          }
          ctx.drawImage(logoImg, logoX, logoY, logoDimension, logoDimension);
          ctx.restore();
        };
        logoImg.src = logoUrl;
      }

      // Draw CTA Frame if active
      if (hasFrame) {
        const frameText =
          ctaFrame === "scan_me"
            ? "SCAN ME"
            : ctaFrame === "connect_wifi"
            ? "CONNECT WI-FI"
            : ctaFrame === "visit"
            ? "VISIT WEBSITE"
            : "SCAN QR CODE";

        ctx.fillStyle = fgColor;
        ctx.fillRect(16, renderSize, renderSize - 32, 44);
        ctx.fillStyle = bgColor;
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(frameText, renderSize / 2, renderSize + 22);
      }
    };
    qrImg.src = qrApiUrl;
  }, [
    qrPayload,
    fgColor,
    bgColor,
    isTransparentBg,
    errorCorrection,
    ctaFrame,
    logoUrl,
    logoSizePercent,
    logoBgPadding,
    logoBadgeShape,
  ]);

  // Download High-Resolution File (1024 / 2048 px)
  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create high-res export canvas
    const exportCanvas = document.createElement("canvas");
    const scale = exportResolution / 512;
    exportCanvas.width = canvas.width * scale;
    exportCanvas.height = canvas.height * scale;

    const exCtx = exportCanvas.getContext("2d");
    if (!exCtx) return;

    exCtx.imageSmoothingEnabled = false;
    exCtx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

    const a = document.createElement("a");
    a.href = exportCanvas.toDataURL("image/png");
    a.download = `clyra-qr-${qrType}-${exportResolution}px.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`QR Code (${exportResolution}px HD) berhasil diunduh!`, "success");
  };

  // Copy Image to Clipboard
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
          showToast("Gambar QR Code disalin ke clipboard!", "copied");
          setTimeout(() => setCopiedImg(false), 2000);
        }
      });
    } catch {
      showToast("Gagal menyalin gambar.", "error");
    }
  };

  // Copy Raw String Payload
  const copyPayload = async () => {
    try {
      await navigator.clipboard.writeText(qrPayload);
      setCopied(true);
      showToast("Teks isi QR disalin ke clipboard!", "copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Gagal menyalin data.", "error");
    }
  };

  const TYPE_BUTTONS: { id: QrType; label: string; icon: any }[] = [
    { id: "url", label: "Website URL", icon: Globe },
    { id: "text", label: "Teks Bebas", icon: FileText },
    { id: "wifi", label: "Jaringan Wi-Fi", icon: Wifi },
    { id: "vcard", label: "Kontak (vCard)", icon: Contact },
    { id: "whatsapp", label: "WhatsApp Chat", icon: MessageCircle },
    { id: "email", label: "Email Kirim", icon: Mail },
    { id: "phone", label: "Panggilan Telp", icon: Phone },
    { id: "sms", label: "Pesan SMS", icon: MessageSquare },
    { id: "location", label: "Lokasi GPS Maps", icon: MapPin },
  ];

  return (
    <div className="space-y-8">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 shadow-md">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">QR Code Studio</h2>
              <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                HD Vector &amp; Logo Ready
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Buat kode QR kustom resolusi tinggi untuk URL, Wi-Fi, vCard, WhatsApp, dan logo tengah tanpa watermark.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Client-Side Safe</span>
          </span>
        </div>
      </div>

      {/* 2. TYPE SELECTOR STRIP */}
      <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-2.5 flex flex-wrap items-center gap-1.5 shadow-xl">
        {TYPE_BUTTONS.map((t) => {
          const Icon = t.icon;
          const isSelected = qrType === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setQrType(t.id)}
              className={cn(
                "flex items-center justify-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer",
                isSelected
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. MAIN WORKSPACE GRID: INPUTS & PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (7 COLS): CONFIGURATION & STYLING */}
        <div className="lg:col-span-7 space-y-6">
          {/* A. CONTENT INPUT FORM */}
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                1. Data Isi QR Code ({qrType.toUpperCase()})
              </span>
            </div>

            {/* URL */}
            {qrType === "url" && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Website URL Target</label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://clyra.vercel.app"
                  className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3.5 text-xs text-white font-mono focus:border-indigo-500 outline-none"
                />
              </div>
            )}

            {/* Text */}
            {qrType === "text" && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Teks / Catatan Pesan</label>
                <textarea
                  rows={4}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ketik teks yang ingin disimpan di QR code..."
                  className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3.5 text-xs text-white font-mono focus:border-indigo-500 outline-none"
                />
              </div>
            )}

            {/* Wi-Fi */}
            {qrType === "wifi" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Nama Wi-Fi (SSID)</label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Password Wi-Fi</label>
                  <input
                    type="text"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Enkripsi</label>
                    <select
                      value={wifiAuth}
                      onChange={(e) => setWifiAuth(e.target.value)}
                      className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 outline-none"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">Tanpa Password</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-3">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wifiHidden}
                        onChange={(e) => setWifiHidden(e.target.checked)}
                        className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Jaringan Tersembunyi (Hidden)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* vCard */}
            {qrType === "vcard" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Nama Lengkap</label>
                    <input
                      type="text"
                      value={vcardName}
                      onChange={(e) => setVcardName(e.target.value)}
                      className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Nomor Telepon</label>
                    <input
                      type="tel"
                      value={vcardPhone}
                      onChange={(e) => setVcardPhone(e.target.value)}
                      className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Alamat Email</label>
                    <input
                      type="email"
                      value={vcardEmail}
                      onChange={(e) => setVcardEmail(e.target.value)}
                      className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Website / Link</label>
                    <input
                      type="url"
                      value={vcardWebsite}
                      onChange={(e) => setVcardWebsite(e.target.value)}
                      className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp */}
            {qrType === "whatsapp" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Nomor WhatsApp (dengan kode negara, misal: +62812...)</label>
                  <input
                    type="tel"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Pesan Awal Otomatis</label>
                  <textarea
                    rows={3}
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            {qrType === "email" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Email Penerima</label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Subjek Email</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {/* Phone */}
            {qrType === "phone" && (
              <div className="space-y-2">
                <label className="text-xs text-slate-300">Nomor Telepon</label>
                <input
                  type="tel"
                  value={phoneNum}
                  onChange={(e) => setPhoneNum(e.target.value)}
                  className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3.5 text-xs text-white font-mono"
                />
              </div>
            )}

            {/* SMS */}
            {qrType === "sms" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Nomor Tujuan SMS</label>
                  <input
                    type="tel"
                    value={smsPhone}
                    onChange={(e) => setSmsPhone(e.target.value)}
                    className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Isi SMS</label>
                  <textarea
                    rows={3}
                    value={smsBody}
                    onChange={(e) => setSmsBody(e.target.value)}
                    className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {/* Location */}
            {qrType === "location" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Latitude</label>
                  <input
                    type="text"
                    value={locLat}
                    onChange={(e) => setLocLat(e.target.value)}
                    className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Longitude</label>
                  <input
                    type="text"
                    value={locLng}
                    onChange={(e) => setLocLng(e.target.value)}
                    className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* B. LOGO & ICON OVERLAY STUDIO */}
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  2. Sisipkan Logo Tengah (Center Logo)
                </span>
              </div>
              {logoUrl && (
                <button
                  onClick={() => setLogoUrl(null)}
                  className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Logo</span>
                </button>
              )}
            </div>

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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Unggah Gambar / Logo Sendiri</span>
                </button>

                <span className="text-xs text-slate-500 font-mono">atau preset:</span>

                {PRESET_LOGOS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setLogoUrl(preset.url)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              {logoUrl && (
                <div className="p-4 bg-[#08090d] border border-slate-800 rounded-2xl space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                    <span>Ukuran Logo di Tengah ({logoSizePercent}%)</span>
                    <input
                      type="range"
                      min="15"
                      max="30"
                      value={logoSizePercent}
                      onChange={(e) => setLogoSizePercent(Number(e.target.value))}
                      className="w-36 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={logoBgPadding}
                        onChange={(e) => setLogoBgPadding(e.target.checked)}
                        className="rounded text-indigo-600 accent-indigo-500"
                      />
                      <span>Background badge pelindung (QR tetap 100% terbaca)</span>
                    </label>

                    <div className="flex items-center gap-1 text-xs">
                      <button
                        onClick={() => setLogoBadgeShape("rounded")}
                        className={cn(
                          "px-2.5 py-1 rounded-lg border font-mono text-[11px]",
                          logoBadgeShape === "rounded" ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900 text-slate-400 border-slate-800"
                        )}
                      >
                        Kotak Rounded
                      </button>
                      <button
                        onClick={() => setLogoBadgeShape("circle")}
                        className={cn(
                          "px-2.5 py-1 rounded-lg border font-mono text-[11px]",
                          logoBadgeShape === "circle" ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900 text-slate-400 border-slate-800"
                        )}
                      >
                        Lingkaran
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* C. COLOR & FRAME CUSTOMIZER */}
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
              <Palette className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                3. Kustomisasi Warna, Frame &amp; Resolusi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-400">Warna Background</label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTransparentBg}
                      onChange={(e) => setIsTransparentBg(e.target.checked)}
                      className="rounded accent-indigo-500"
                    />
                    <span>Transparan</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    disabled={isTransparentBg}
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 disabled:opacity-30"
                  />
                  <span className="text-xs font-mono text-slate-300">
                    {isTransparentBg ? "Transparan (PNG)" : bgColor}
                  </span>
                </div>
              </div>
            </div>

            {/* Frame Banner & Resolution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Frame Call-to-Action (CTA):</label>
                <select
                  value={ctaFrame}
                  onChange={(e) => setCtaFrame(e.target.value)}
                  className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-indigo-500 outline-none"
                >
                  <option value="none">Tanpa Frame (Standar)</option>
                  <option value="scan_me">Banner "SCAN ME"</option>
                  <option value="connect_wifi">Banner "CONNECT WI-FI"</option>
                  <option value="visit">Banner "VISIT WEBSITE"</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Resolusi Unduhan Output:</label>
                <select
                  value={exportResolution}
                  onChange={(e) => setExportResolution(Number(e.target.value))}
                  className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono focus:border-indigo-500 outline-none"
                >
                  <option value="512">512 × 512 px (Standar Layar)</option>
                  <option value="1024">1024 × 1024 px (Ultra HD)</option>
                  <option value="2048">2048 × 2048 px (Cetak Brosur &amp; Banner)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 COLS): PREVIEW & DOWNLOAD */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl flex flex-col justify-between items-center space-y-6 sticky top-24">
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs font-mono font-bold text-white uppercase">
                Pratinjau QR Code HD
              </span>
              <button
                onClick={copyPayload}
                className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Tersalin" : "Salin Data"}</span>
              </button>
            </div>

            {/* Canvas Container */}
            <div className="p-5 bg-[#08090d] rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-center relative">
              <canvas ref={canvasRef} className="rounded-xl max-w-[260px] max-h-[320px] shadow-lg" />
            </div>

            {/* Actions */}
            <div className="w-full space-y-2.5 pt-2 border-t border-slate-800/80">
              <button
                onClick={handleDownloadImage}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh PNG HD ({exportResolution}px)</span>
              </button>

              <button
                onClick={copyQrImage}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors cursor-pointer active:scale-95"
              >
                {copiedImg ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Gambar QR Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Salin Gambar ke Clipboard</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
