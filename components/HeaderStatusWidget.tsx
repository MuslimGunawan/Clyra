"use client";

import { useState, useEffect } from "react";
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
  Calendar
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customCityInput, setCustomCityInput] = useState("");
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

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
          month: "long",
          year: "numeric",
        })
      );
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch Weather Data (Cached & Overridable)
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
    <>
      {/* Clickable Header Status Pill */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800/80 hover:border-indigo-500/50 text-[11px] font-mono text-slate-300 shadow-sm backdrop-blur-sm select-none cursor-pointer transition-all active:scale-95 group"
        title="Klik untuk detail cuaca, zona waktu &amp; lokasi"
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
                <span className="truncate max-w-[85px] text-slate-400 group-hover:text-white">
                  {weather.city}
                </span>
              )}
            </div>
          </>
        )}
      </button>

      {/* DETAIL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-md bg-[#0c0e18] border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-indigo-950/40 space-y-5 z-10 text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <CloudSun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Status Lingkungan &amp; Cuaca</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Real-time Environmental Telemetry</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Time & Date Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>WAKTU LOKAL</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {Intl.DateTimeFormat().resolvedOptions().timeZone || "WIB"}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white tracking-wider">{timeStr}</div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{dateStr}</span>
              </div>
            </div>

            {/* Weather Metrics Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider">
                    Kondisi Atmosfer
                  </div>
                  <div className="text-xl font-bold text-white mt-0.5">{weather?.condition || "Cerah Berawan"}</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-amber-300 font-mono">{weather?.temp || "--°C"}</div>
                  {weather?.feelsLike && (
                    <div className="text-[10px] text-slate-400 font-mono">Terasa seperti {weather.feelsLike}</div>
                  )}
                </div>
              </div>

              {/* Weather Stats Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-500 flex items-center gap-1 text-[10px]">
                    <Droplets className="w-3 h-3 text-cyan-400" />
                    <span>Kelembaban</span>
                  </div>
                  <div className="font-mono font-bold text-white mt-0.5">{weather?.humidity || "78%"}</div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-500 flex items-center gap-1 text-[10px]">
                    <Wind className="w-3 h-3 text-teal-400" />
                    <span>Kecepatan Angin</span>
                  </div>
                  <div className="font-mono font-bold text-white mt-0.5">{weather?.windSpeed || "12 km/h"}</div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-500 flex items-center gap-1 text-[10px]">
                    <Sun className="w-3 h-3 text-amber-400" />
                    <span>Indeks UV</span>
                  </div>
                  <div className="font-mono font-bold text-white mt-0.5">{weather?.uvIndex || "Low"}</div>
                </div>
              </div>
            </div>

            {/* Location & Node Explanation */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Lokasi Terdeteksi: {weather?.city} {weather?.region ? `(${weather.region})` : ""}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                  {weather?.sourceType === "gps" ? "GPS" : weather?.sourceType === "custom" ? "Manual" : "ISP Gateway"}
                </span>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-900/80 text-[11px] text-slate-400 leading-relaxed">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  Nama <strong>&quot;{weather?.city}&quot;</strong> berasal dari simpul stasiun jaringan / IP gateway provider internet Anda secara otomatis (privasi aman tanpa melacak GPS asli).
                </p>
              </div>
            </div>

            {/* Action Buttons: Set Manual City or Precise GPS */}
            <div className="space-y-2.5 pt-1">
              <form onSubmit={handleCustomCitySubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={customCityInput}
                    onChange={(e) => setCustomCityInput(e.target.value)}
                    placeholder="Ketik kota Anda (e.g. Jakarta, Bandung, Surabaya)..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-8 pr-3 py-2 text-white placeholder:text-slate-500 outline-none text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoadingWeather}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  Cari
                </button>
              </form>

              <div className="flex items-center justify-between gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={handleUseGps}
                  disabled={isLoadingWeather}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 cursor-pointer"
                >
                  <LocateFixed className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Deteksi Presisi (GPS)</span>
                </button>

                <button
                  type="button"
                  onClick={() => fetchWeather()}
                  disabled={isLoadingWeather}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWeather ? "animate-spin" : ""}`} />
                  <span>Reset ke ISP</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
