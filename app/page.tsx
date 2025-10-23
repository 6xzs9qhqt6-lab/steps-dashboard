"use client";
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Footprints, Target, TrendingUp, Instagram, Heart, RefreshCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const fmt = (n: number) => n.toLocaleString("de-DE");
const fmtK = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`);
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const phrases = [
  "geh ma bitte",
  "strampl anfoch",
  "nix is fix, sauf net – geh!",
  "hopp auf!",
  "wia weit no?",
  "geh spaziern, Brudi",
  "mach a schritt, ned nur stories 😏",
];

const initialWeek = [
  { key: "Mo", steps: 22528 },
  { key: "Di", steps: 20182 },
  { key: "Mi", steps: 21392 },
  { key: "Do", steps: 14395 },
  { key: "Fr", steps: 0 },
  { key: "Sa", steps: 0 },
  { key: "So", steps: 0 },
];

export default function StepsStoryDashboard() {
  const [likes, setLikes] = useState<number>(152);
  const pledgePerLike = 1000;
  const [days, setDays] = useState(initialWeek);

  const goal = useMemo(() => likes * pledgePerLike, [likes]);
  const total = useMemo(() => days.reduce((s, d) => s + d.steps, 0), [days]);
  const remaining = Math.max(0, goal - total);
  const progress = clamp((total / goal) * 100, 0, 100);
  const daysLeft = useMemo(() => days.filter((d) => d.steps === 0).length, [days]);
  const perDayNeeded = daysLeft > 0 ? Math.ceil(remaining / daysLeft) : 0;

  const lastFilledIndex = useMemo(() => {
    let idx = -1;
    for (let i = 0; i < days.length; i++) if (days[i].steps > 0) idx = i;
    return idx;
  }, [days]);

  const firstEmptyIndex = useMemo(() => days.findIndex((d) => d.steps === 0), [days]);

  const chartData = days.map((d, i) => {
    const isEmpty = d.steps === 0;
    const showNeeded = perDayNeeded > 0 && (i > lastFilledIndex ? isEmpty : i === lastFilledIndex);
    const smoothing = lastFilledIndex >= 0 && i > lastFilledIndex && perDayNeeded > 0
      ? Math.round(days[lastFilledIndex].steps + ((i - lastFilledIndex) * (perDayNeeded - days[lastFilledIndex].steps)) / (days.length - lastFilledIndex - 1))
      : null;
    return {
      name: d.key,
      steps: d.steps > 0 ? d.steps : null,
      needed: showNeeded ? (i === lastFilledIndex ? days[lastFilledIndex]?.steps ?? null : smoothing ?? perDayNeeded) : null,
    };
  });

  function updateSteps(idx: number, val: number) {
    setDays((prev) => prev.map((d, i) => (i === idx ? { ...d, steps: Math.max(0, Math.floor(val)) } : d)));
  }

  function resetToScreenshot() {
    setDays(initialWeek);
    setLikes(152);
  }

  function randomPhrase() {
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  const footerPhrase = randomPhrase();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-amber-50 via-yellow-50 to-amber-100 text-gray-900 px-2 py-6 flex flex-col gap-5 md:items-center">
      <header className="w-full max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div initial={{ rotate: -12, scale: 0.9 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="h-11 w-11 rounded-2xl bg-amber-100 grid place-items-center text-amber-700">
            <Footprints className="h-6 w-6" />
          </motion.div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Step Daddy Greg</h1>
            <p className="text-xs text-gray-500">Geh ma, Bruder</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-amber-500 text-white flex gap-1 items-center">
          <Instagram className="h-4 w-4" /> Pledge
        </Badge>
      </header>

      <Card className="w-full max-w-lg mx-auto bg-white border border-amber-100 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Target className="h-5 w-5 text-amber-600" />
              <span className="text-sm">Wochenziel</span>
            </div>
            <Badge className="bg-amber-500 text-white">{fmt(goal)} Schritte</Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <Metric label="Likes" value={likes} icon={<Heart className="h-4 w-4 text-amber-500" />} />
            <Metric label="Schon gegangen" value={fmt(total)} icon={<Activity className="h-4 w-4 text-emerald-500" />} />
            <Metric label="Verbleibend" value={fmt(remaining)} icon={<TrendingUp className="h-4 w-4 text-amber-500" />} />
          </div>

          <div className="mt-4">
            <Progress value={progress} className="h-2 bg-amber-100" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{progress.toFixed(1)}% erfüllt</span>
              <span>{daysLeft > 0 ? `${daysLeft} Tage übrig - ~${fmt(perDayNeeded)} / Tag` : `Woche abgeschlossen`}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input type="number" className="w-24 rounded-xl bg-slate-100 border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-400" value={likes} min={0} onChange={(e) => setLikes(Math.max(0, parseInt(e.target.value || "0", 10)))} aria-label="Likes eingeben" />
            <span className="text-xs text-gray-500">Likes x 1.000 Schritte</span>
            <Button variant="secondary" className="ml-auto bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200" onClick={resetToScreenshot}>
              <RefreshCcw className="h-4 w-4 mr-1" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-lg mx-auto bg-white border border-amber-100 shadow-sm">
        <CardContent className="p-4">
          <h2 className="text-sm text-gray-600 mb-3">Tägliche Schritte</h2>
          <div className="grid grid-cols-7 gap-2 relative">
            {days.map((d, i) => (
              <motion.div key={d.key} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.03 }} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-500">{d.key}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`w-[6ch] text-center rounded-xl px-1 py-2 text-xs outline-none focus:border-amber-400 ${
                    d.steps > 0
                      ? "bg-slate-100 border border-slate-200"
                      : "bg-amber-50 border-2 border-dashed border-amber-300"
                  }`}
                  value={String(d.steps > 0 ? d.steps : perDayNeeded)}
                  onChange={(e) => updateSteps(i, parseInt(e.target.value.replace(/[^0-9]/g, "") || "0", 10))}
                />
              </motion.div>
            ))}
            {daysLeft > 0 && firstEmptyIndex >= 0 && (
              <div
                className="absolute text-center text-xs text-gray-600 bg-amber-100 rounded-xl py-1 px-2"
                style={{
                  left: `calc(${(firstEmptyIndex / days.length) * 100}% + 4px)`,
                  width: `${Math.max((daysLeft / days.length) * 100, 10)}%`,
                  top: "calc(100% + 0.5rem)",
                }}
              >
                {footerPhrase}
              </div>
            )}
          </div>

          <div className="h-36 mt-12 rounded-2xl overflow-hidden bg-gradient-to-b from-amber-50 to-white px-2 py-2">
            <ResponsiveContainer width="98%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 12, left: 12, bottom: 0 }}>
                <CartesianGrid stroke="rgba(0,0,0,0.08)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "rgba(0,0,0,0.6)", fontSize: 10 }} axisLine={{ stroke: "rgba(0,0,0,0.2)" }} tickLine={false} />
                <YAxis domain={[0, 'auto']} tickFormatter={fmtK} tick={{ fill: "rgba(0,0,0,0.6)", fontSize: 10 }} axisLine={{ stroke: "rgba(0,0,0,0.2)" }} tickLine={false} width={38} />
                <Tooltip contentStyle={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 12 }} labelClassName="text-xs" formatter={(v, name) => [fmt(Number(v)), "Schritte"]} />
                <Line type="monotone" dataKey="steps" connectNulls stroke="#f59e0b" strokeWidth={3} dot={{ r: 3, strokeWidth: 1, stroke: "#fbbf24" }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="needed" connectNulls stroke="#d97706" strokeWidth={2} strokeDasharray="6 6" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full max-w-lg mx-auto">
        <Card className="bg-gradient-to-br from-amber-200 via-white to-yellow-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-100 grid place-items-center text-amber-700">
                <Heart className="h-5 w-5" />
              </div>
              <div className="flex-1 text-gray-700">
                <p className="text-sm leading-tight">
                  <span className="text-gray-600">Community Pledge:</span> {likes} Likes -&gt; <span className="font-semibold">{fmt(goal)} Schritte</span> diese Woche.
                </p>
                <p className="text-xs text-gray-500">Noch {fmt(remaining)} Schritte - ~{fmt(perDayNeeded)} pro verbleibendem Tag</p>
              </div>
              <Button size="sm" variant="secondary" className="shrink-0 bg-amber-100 text-amber-800 hover:bg-amber-200">
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <footer className="w-full max-w-lg mx-auto pb-4 pt-2 text-center text-[10px] text-gray-400">
        gemacht mit liebe & zu wenig cardio ❤️‍🔥
      </footer>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 flex flex-col gap-0.5 text-gray-700">
      <div className="flex items-center gap-1.5 text-[10px] text-gray-500">{icon}{label}</div>
      <div className="text-base font-semibold tracking-tight">{value}</div>
    </div>
  );
}
