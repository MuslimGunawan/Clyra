"use client";

import { useState, useEffect } from "react";
import { Clock, CloudSun, MapPin } from "lucide-react";

interface WeatherData {
  temp: string;
  condition: string;
  city: string;
}

export default function HeaderStatusWidget() {
  const [timeStr, setTimeStr] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [mounted, setMounted] = useState(false);

  // 1. Live Real-time Clock
  useEffect(() => {
    setMounted(true);
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setTimeStr(`${hours}:${minutes}:${seconds}`);
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Zero-Permission Passive IP Weather Fetch (Cached in sessionStorage)
  useEffect(() => {
    const fetchPassiveWeather = async () => {
      try {
        const cached = sessionStorage.getItem("clyra_cached_weather");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.ts < 15 * 60 * 1000) {
            setWeather(parsed.data);
            return;
          }
        }

        // Privacy-first reverse IP weather (Zero browser permission prompts)
        const res = await fetch("https://wttr.in/?format=j1", {
          signal: AbortSignal.timeout(4000),
        });

        if (res.ok) {
          const data = await res.json();
          const current = data.current_condition?.[0];
          const area = data.nearest_area?.[0];
          const cityName = area?.areaName?.[0]?.value || area?.region?.[0]?.value || "";
          const tempC = current?.temp_C ? `${current.temp_C}°C` : "";
          const desc = current?.weatherDesc?.[0]?.value || "";

          if (tempC) {
            const result: WeatherData = {
              temp: tempC,
              condition: desc,
              city: cityName ? cityName.split(" ")[0] : "",
            };
            setWeather(result);
            sessionStorage.setItem(
              "clyra_cached_weather",
              JSON.stringify({ data: result, ts: Date.now() })
            );
          }
        }
      } catch (err) {
        // Graceful silent fallback to timezone city if external API is unreachable
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const tzCity = tz ? tz.split("/")[1]?.replace(/_/g, " ") : "";
          if (tzCity) {
            setWeather({ temp: "", condition: "", city: tzCity });
          }
        } catch {}
      }
    };

    fetchPassiveWeather();
  }, []);

  if (!mounted || !timeStr) {
    return (
      <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-500 animate-pulse">
        <Clock className="w-3 h-3" />
        <span>--:--:--</span>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 border border-slate-800/80 text-[11px] font-mono text-slate-300 shadow-sm backdrop-blur-sm select-none">
      {/* Live Digital Clock */}
      <div className="flex items-center gap-1.5 text-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold tracking-wider text-white">{timeStr}</span>
      </div>

      {/* Weather & Location (Zero-Permission) */}
      {weather && (weather.temp || weather.city) && (
        <>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1 text-slate-400">
            {weather.temp ? (
              <>
                <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 font-medium">{weather.temp}</span>
              </>
            ) : (
              <MapPin className="w-3 h-3 text-indigo-400" />
            )}
            {weather.city && (
              <span className="truncate max-w-[90px] text-slate-400">
                {weather.city}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
