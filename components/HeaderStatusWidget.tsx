"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Clock, 
  CloudSun, 
  MapPin, 
  X, 
  Wind, 
  Droplets, 
  Sun, 
  Compass, 
  ShieldCheck, 
  LocateFixed, 
  Search, 
  RefreshCw,
  Info,
  Calendar,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherFullData {
  temp: string;
  feelsLike?: string;
  condition: string;
  city: string;
  region?: string;
  country?: string;
  humidity?: string;
  windSpeed?: string;
  uvIndex?: string;
  sourceType: "ip" | "gps" | "custom";
}

export default function HeaderStatusWidget() {
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");
  const [weather, setWeather] = useState<WeatherFullData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [customCityInput, setCustomCityInput] = useState("");
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Live Real-time Clock & Date
  useEffect(() => {
    setMounted(true);
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setTimeStr(`${hours}:${minutes}:${seconds}`);

      setDateStr(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      );
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Outside Click & Escape Key Listener to Close Dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // 3. Fetch Weather Data (Cached & Overridable)
  const fetchWeather = async (targetQuery?: string, isGps = false) => {
    setIsLoadingWeather(true);
    try {
      let url = "https://wttr.in/?format=j1";
      if (targetQuery) {
        url = `https://wttr.in/${encodeURIComponent(targetQuery)}?format=j1`;
      }

      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        const current = data.current_condition?.[0];
        const area = data.nearest_area?.[0];
        const cityName = targetQuery || area?.areaName?.[0]?.value || area?.region?.[0]?.value || "Indonesia";
        const regionName = area?.region?.[0]?.value || "";
        const countryName = area?.country?.[0]?.value || "Indonesia";
        const tempC = current?.temp_C ? `${current.temp_C}°C` : "--°C";
        const feelsLikeC = current?.FeelsLikeC ? `${current.FeelsLikeC}°C` : tempC;
        const desc = current?.weatherDesc?.[0]?.value || "Cerah Berawan";
        const humidity = current?.humidity ? `${current.humidity}%` : undefined;
        const wind = current?.windspeedKmph ? `${current.windspeedKmph} km/h` : undefined;
        const uv = current?.uvIndex;

        const result: WeatherFullData = {
          temp: tempC,
          feelsLike: feelsLikeC,
          condition: desc,
          city: cityName,
          region: regionName,
          country: countryName,
          humidity,
          windSpeed: wind,
          uvIndex: uv,
          sourceType: isGps ? "gps" : targetQuery ? "custom" : "ip",
        };

        setWeather(result);
        localStorage.setItem("clyra_weather_pref", JSON.stringify(result));
      }
    } catch {
      // Fallback
      if (!weather) {
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const tzCity = tz ? tz.split("/")[1]?.replace(/_/g, " ") : "WIB";
          setWeather({
            temp: "27°C",
            condition: "Cerah Berawan",
            city: tzCity,
            sourceType: "ip",
          });
        } catch {}
      }
    } finally {
      setIsLoadingWeather(false);
    }
  };

  useEffect(() => {
    // Check saved preference
    const saved = localStorage.getItem("clyra_weather_pref");
    if (saved) {
      try {
        setWeather(JSON.parse(saved));
      } catch {}
    }
    fetchWeather();
  }, []);

  const handleUseGps = () => {
    if (!navigator.geolocation) return;
    setIsLoadingWeather(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const query = `${pos.coords.latitude.toFixed(2)},${pos.coords.longitude.toFixed(2)}`;
        fetchWeather(query, true);
      },
      () => {
        setIsLoadingWeather(false);
      },
      { timeout: 6000 }
    );
  };

  const handleCustomCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCityInput.trim()) return;
    fetchWeather(customCityInput.trim(), false);
    setCustomCityInput("");
  };

  if (!mounted || !timeStr) {
    return (
      <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-500 animate-pulse">
        <Clock className="w-3 h-3" />
        <span>--:--:--</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative hidden lg:block">
      {/* Clickable Header Status Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-mono shadow-sm backdrop-blur-sm select-none cursor-pointer transition-all active:scale-95 group border",
          isOpen
            ? "bg-indigo-950/80 border-indigo-500/60 text-white shadow-indigo-950/50"
            : "bg-slate-900/70 hover:bg-slate-800/90 border-slate-800/80 hover:border-indigo-500/40 text-slate-300"
        )}
        title="Klik untuk melihat detail cuaca, zona waktu &amp; lokasi"
      >
        {/* Live Digital Clock */}
        <div className="flex items-center gap-1.5 text-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wider text-white group-hover:text-indigo-300 transition-colors">
            {timeStr}
          </span>
        </div>

        {/* Weather & Location */}
        {weather && (weather.temp || weather.city) && (
          <>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-200 transition-colors">
              {weather.temp ? (
                <>
                  <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300 font-medium">{weather.temp}</span>
                </>
              ) : (
                <MapPin className="w-3 h-3 text-indigo-400" />
              )}
              {weather.city && (
                <span className="truncate max-w-[80px] text-slate-400 group-hover:text-white">
                  {weather.city}
                </span>
              )}
            </div>
          </>
        )}

        <ChevronDown className={cn("w-3 h-3 text-slate-500 transition-transform duration-200", isOpen && "rotate-180 text-indigo-400")} />
      </button>

      {/* COMPACT NATIVE DROPDOWN FLYOUT (Underneath the Pill) */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2.5 w-80 sm:w-92 bg-[#0c0e18]/95 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-4 shadow-2xl shadow-black/90 space-y-3.5 z-50 animate-scaleUp text-xs">
          {/* Header Row */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <CloudSun className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Status Cuaca &amp; Waktu</h4>
                <p className="text-[10px] text-slate-400 font-mono">{dateStr}</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Weather Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-900/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono uppercase font-bold text-amber-400 tracking-wider">
                  Kondisi Cuaca
                </span>
                <div className="text-sm font-bold text-white">{weather?.condition || "Cerah Berawan"}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-amber-300 font-mono">{weather?.temp || "--°C"}</div>
                {weather?.feelsLike && (
                  <div className="text-[10px] text-slate-400 font-mono">Terasa {weather.feelsLike}</div>
                )}
              </div>
            </div>

            {/* Micro Stats Grid */}
            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/80 text-[10px]">
              <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-slate-500 text-[9px] flex items-center justify-center gap-1">
                  <Droplets className="w-2.5 h-2.5 text-cyan-400" />
                  <span>Lembab</span>
                </div>
                <div className="font-mono font-bold text-white mt-0.5">{weather?.humidity || "78%"}</div>
              </div>

              <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-slate-500 text-[9px] flex items-center justify-center gap-1">
                  <Wind className="w-2.5 h-2.5 text-teal-400" />
                  <span>Angin</span>
                </div>
                <div className="font-mono font-bold text-white mt-0.5">{weather?.windSpeed || "12 km/h"}</div>
              </div>

              <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-slate-500 text-[9px] flex items-center justify-center gap-1">
                  <Sun className="w-2.5 h-2.5 text-amber-400" />
                  <span>UV Index</span>
                </div>
                <div className="font-mono font-bold text-white mt-0.5">{weather?.uvIndex || "Low"}</div>
              </div>
            </div>
          </div>

          {/* Location Info Banner */}
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/90 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="truncate max-w-[180px]">{weather?.city} {weather?.region ? `(${weather.region})` : ""}</span>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono text-[9px]">
                {weather?.sourceType === "gps" ? "GPS" : weather?.sourceType === "custom" ? "Manual" : "ISP IP"}
              </span>
            </div>

            <div className="flex items-start gap-1.5 text-[10px] text-slate-400 leading-relaxed">
              <Info className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
              <p>
                Lokasi terdeteksi otomatis dari stasiun/IP gateway provider internet Anda (aman tanpa pelacakan GPS).
              </p>
            </div>
          </div>

          {/* Quick Search City Form */}
          <form onSubmit={handleCustomCitySubmit} className="flex gap-1.5 pt-0.5">
            <div className="relative flex-1">
              <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={customCityInput}
                onChange={(e) => setCustomCityInput(e.target.value)}
                placeholder="Ganti kota (e.g. Jakarta, Surabaya)..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg pl-7 pr-2.5 py-1.5 text-white placeholder:text-slate-500 outline-none text-[11px]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoadingWeather}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] cursor-pointer disabled:opacity-50"
            >
              Cari
            </button>
          </form>

          {/* Secondary Actions */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
            <button
              type="button"
              onClick={handleUseGps}
              disabled={isLoadingWeather}
              className="flex items-center gap-1 text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              <LocateFixed className="w-3 h-3 text-indigo-400" />
              <span>Gunakan GPS Presisi</span>
            </button>

            <button
              type="button"
              onClick={() => fetchWeather()}
              disabled={isLoadingWeather}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingWeather ? "animate-spin" : ""}`} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
