import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  PieChart, Pie, BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ReferenceArea, Cell, LabelList
} from 'recharts';
import {
  Shield, Clock, DollarSign, Target, TrendingDown, TrendingUp, CheckCircle,
  AlertTriangle, Truck, Activity, BarChart3, Wrench, Gauge, Users, Pencil, X,
  Copy, RotateCcw, ChevronLeft, ChevronRight, Calendar, Package, EyeOff, Zap,
  ClipboardCheck, Home, Award, Download
} from 'lucide-react';
import { DEFAULT_DATA, EDIT_SECTIONS } from './data';
import F26Recap from './F26Recap';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const STORAGE_KEY = 'msa-f27-overrides-v1';
const BANNER_KEY = 'msa-f27-hide-banner-v1';

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const allNum = (...vs) => vs.every(isNum);
const sum = (vs) => vs.filter(isNum).reduce((a, b) => a + b, 0);

const getIn = (obj, path) =>
  path.split('.').reduce((o, k) => (o === null || o === undefined ? undefined : o[k]), obj);

const setIn = (obj, keys, value) => {
  const [k, ...rest] = keys;
  const base = obj === null || obj === undefined ? {} : obj;
  const clone = Array.isArray(base) ? [...base] : { ...base };
  clone[k] = rest.length ? setIn(base[k], rest, value) : value;
  return clone;
};

const applyOverrides = (base, overrides) =>
  Object.entries(overrides).reduce((acc, [path, v]) => setIn(acc, path.split('.'), v), base);

const readStore = (key, fallback) => {
  try {
    const v = window.localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
};
const writeStore = (key, v) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(v));
  } catch (e) {
    /* storage unavailable — edits stay for this session only */
  }
};

const money = (v, d = 0) =>
  `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-CA', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const num = (v, d = 0) =>
  `${v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('en-CA', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pct = (v, d = 1) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}%`;
const signed = (v, fmt) => (v > 0 ? `+${fmt(v)}` : fmt(v));
const kMoney = (v) => `${v < 0 ? '−' : ''}${Math.abs(v) >= 1e6 ? `$${(Math.abs(v) / 1e6).toFixed(2)}M` : `$${(Math.abs(v) / 1000).toFixed(1)}K`}`;

// Fiscal-year progress (F27 = Jul 1, 2026 – Jun 30, 2027)
const fiscalProgress = () => {
  const start = new Date(2026, 6, 1);
  const end = new Date(2027, 5, 30);
  const now = new Date();
  const total = Math.round((end - start) / 86400000) + 1;
  const day = Math.min(total, Math.max(1, Math.floor((now - start) / 86400000) + 1));
  return { day, total, pct: (day / total) * 100 };
};

// ---------------------------------------------------------------------------
// Derived metrics — everything calculated from the data file lives here
// ---------------------------------------------------------------------------
const derive = (d) => {
  const o = d.ots;
  const oi = o.inclPartners;
  const oe = o.exclPartners;
  const inclTotal = allNum(oi.lateFbs, oi.onTimeFbs) ? oi.lateFbs + oi.onTimeFbs : null;
  const exclTotal = allNum(oe.lateFbs, oe.onTimeFbs) ? oe.lateFbs + oe.onTimeFbs : null;
  const partnerFbs = allNum(inclTotal, exclTotal) ? inclTotal - exclTotal : null;
  const partnerLate = allNum(oi.lateFbs, oe.lateFbs) ? oi.lateFbs - oe.lateFbs : null;
  const partnerOnTimePct = allNum(partnerFbs, partnerLate) && partnerFbs > 0 ? ((partnerFbs - partnerLate) / partnerFbs) * 100 : null;
  const partnerVolShare = allNum(partnerFbs, inclTotal) && inclTotal > 0 ? (partnerFbs / inclTotal) * 100 : null;
  const partnerLateShare = allNum(partnerLate, oi.lateFbs) && oi.lateFbs > 0 ? (partnerLate / oi.lateFbs) * 100 : null;
  const otsLatest = [...o.months].reverse().find((m) => isNum(m.incl)) || null;
  const codeRows = Object.entries(o.codes).map(([code, count]) => ({ code, count }));
  const codesHaveData = codeRows.some((r) => isNum(r.count));

  const s = d.sca;
  const cppPctOfTarget = isNum(s.costPerProPctOfTarget)
    ? s.costPerProPctOfTarget
    : allNum(s.costPerProMtd, s.costPerProTarget) ? (s.costPerProMtd / s.costPerProTarget) * 100 : null;
  const cppUnder = allNum(s.costPerProMtd, s.costPerProTarget) ? s.costPerProTarget - s.costPerProMtd : null;
  // Report colour bands: ≤95% green · 95–100% amber (watch) · >100% red
  const cppTone = !isNum(cppPctOfTarget) ? 'gray' : cppPctOfTarget <= 95 ? 'green' : cppPctOfTarget <= 100 ? 'amber' : 'red';
  const cppBelowTargetValue = allNum(cppUnder, s.fbCountMtd) ? cppUnder * s.fbCountMtd : null;
  const delta = (a, b) => (allNum(a, b) ? { abs: a - b, pct: b !== 0 ? ((a - b) / b) * 100 : null } : null);
  const labour = {
    total: delta(s.f27TotalCost, s.f26TotalCost),
    agency: delta(s.f27AgencyCost, s.f26AgencyCost),
    company: delta(s.f27CompanyCost, s.f26CompanyCost),
  };
  const hoursDelta = {
    total: delta(s.f27Hours, s.f26Hours),
    agency: delta(s.f27AgencyHours, s.f26AgencyHours),
    company: delta(s.f27CompanyHours, s.f26CompanyHours),
  };
  const wdPctUsed = allNum(s.f27Hours, s.wdAllowable) && s.wdAllowable > 0 ? (s.f27Hours / s.wdAllowable) * 100 : null;
  const cdPctUsed = allNum(s.f27Hours, s.cdAllowable) && s.cdAllowable > 0 ? (s.f27Hours / s.cdAllowable) * 100 : null;
  const monthPctUsed = allNum(s.f27Hours, s.scaTargetHours) && s.scaTargetHours > 0 ? (s.f27Hours / s.scaTargetHours) * 100 : null;
  const wdElapsedPct = allNum(s.wdMtd, s.wdMonth) && s.wdMonth > 0 ? (s.wdMtd / s.wdMonth) * 100 : null;
  const hoursUnder = allNum(s.wdAllowable, s.f27Hours) ? s.wdAllowable - s.f27Hours : null;
  const hoursUnderValue = allNum(hoursUnder, d.productivity.f27.hourlyRate) ? hoursUnder * d.productivity.f27.hourlyRate : null;
  // Pace: MTD hours scaled to the full month on working days
  const paceHours = allNum(s.f27Hours, s.wdMtd, s.wdMonth) && s.wdMtd > 0 ? (s.f27Hours / s.wdMtd) * s.wdMonth : null;
  const paceReduction = allNum(s.f26Hours, paceHours) ? s.f26Hours - paceHours : null;
  const paceVsReductionTarget = allNum(paceReduction, s.hourReductionTarget) && s.hourReductionTarget > 0 ? (paceReduction / s.hourReductionTarget) * 100 : null;

  const initAnnual = sum(d.initiatives.map((i) => i.annual));
  const initYtd = sum(d.initiatives.map((i) => i.ytd));
  const initHasAnnual = d.initiatives.some((i) => isNum(i.annual));
  const initHasYtd = d.initiatives.some((i) => isNum(i.ytd));

  const p27 = d.productivity.f27;
  const p26 = d.productivity.f26;
  const pphVsLy = delta(p27.pph, p26.pph);
  const pphVsGoal = delta(p27.pph, p27.pphGoal);
  const uphVsLy = delta(p27.unitsPerHr, p26.unitsPerHr);
  const rateVsLy = delta(p27.hourlyRate, p26.hourlyRate);
  const cwtVsLy = delta(p27.cwt, p26.cwt);
  const weightVsLy = delta(p27.weight, p26.weight);
  const lbsPerUnitF26 = allNum(p26.pph, p26.unitsPerHr) && p26.unitsPerHr > 0 ? p26.pph / p26.unitsPerHr : null;
  // Units-basis value: hours the F27 units would have needed at F26 units/hr, minus actual hours
  const hoursAtF26Rate = allNum(p27.units, p26.unitsPerHr) && p26.unitsPerHr > 0 ? p27.units / p26.unitsPerHr : null;
  const hoursAvoided = allNum(hoursAtF26Rate, p27.hours) ? hoursAtF26Rate - p27.hours : null;
  const hoursAvoidedValue = allNum(hoursAvoided, p27.hourlyRate) ? hoursAvoided * p27.hourlyRate : null;
  // Cost per unit — use costs ÷ units when both are known, otherwise the dashboard value
  const cpu27 = allNum(p27.costs, p27.units) && p27.units > 0 ? p27.costs / p27.units : p27.cpu;
  const cpu26 = allNum(p26.costs, p26.units) && p26.units > 0 ? p26.costs / p26.units : p26.cpu;
  const cpuVsLy = delta(cpu27, cpu26);
  const cpuSavings = allNum(cpu26, cpu27, p27.units) ? (cpu26 - cpu27) * p27.units : null;
  const unitsVsLy = delta(p27.units, p26.units);

  const c = d.cico;
  const cicoHours = sum(c.weeks.map((w) => w.hoursSaved));
  const cicoHasHours = c.weeks.some((w) => isNum(w.hoursSaved));
  const cicoWeeksWithData = c.weeks.filter((w) => isNum(w.hoursSaved)).length;
  const cicoValue = cicoHasHours && isNum(c.avgHourlyRate) ? cicoHours * c.avgHourlyRate : null;
  const cicoAnnualized =
    cicoHasHours && isNum(c.avgHourlyRate) && cicoWeeksWithData > 0
      ? (cicoHours / cicoWeeksWithData) * 52 * c.avgHourlyRate
      : null;

  const lastRec = d.safety.lastRecordableDate ? new Date(`${d.safety.lastRecordableDate}T00:00:00`) : null;
  const daysSinceRecordable = isNum(d.safety.daysSinceLastRecordable)
    ? d.safety.daysSinceLastRecordable
    : lastRec ? Math.floor((new Date() - lastRec) / 86400000) : null;


  const missing = EDIT_SECTIONS.flatMap((sec) => sec.fields)
    .filter((fl) => fl.type === 'number')
    .filter((fl) => !fl.path.startsWith('terminal.repairs') && !fl.path.startsWith('f26.'))
    .filter((fl) => !isNum(getIn(d, fl.path))).length;

  return {
    partnerFbs, partnerLate, partnerOnTimePct, partnerVolShare, partnerLateShare, otsLatest, codeRows, codesHaveData, cppPctOfTarget, cppUnder, cppTone, cppBelowTargetValue, labour,
    hoursDelta, wdPctUsed, cdPctUsed, monthPctUsed, wdElapsedPct, hoursUnder, hoursUnderValue,
    paceHours, paceReduction, paceVsReductionTarget,
    initAnnual, initYtd, initHasAnnual, initHasYtd,
    pphVsLy, pphVsGoal, uphVsLy, rateVsLy, cwtVsLy, weightVsLy, lbsPerUnitF26,
    hoursAtF26Rate, hoursAvoided, hoursAvoidedValue,
    cpu27, cpu26, cpuVsLy, cpuSavings, unitsVsLy,
    cicoHours, cicoHasHours, cicoValue, cicoAnnualized,
    daysSinceRecordable, missing,
  };
};

// ---------------------------------------------------------------------------
// Small UI building blocks
// ---------------------------------------------------------------------------
const Tbc = ({ small }) => (
  <span
    className={`inline-flex items-center rounded-md border border-amber-300 bg-amber-100 font-semibold text-amber-700 ${
      small ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-base'
    }`}
    title="Value not entered yet — click Edit data"
  >
    TBC
  </span>
);

const V = ({ v, fmt = (x) => x, small }) =>
  v === null || v === undefined || v === '' || (typeof v === 'number' && !Number.isFinite(v)) ? (
    <Tbc small={small} />
  ) : (
    <>{fmt(v)}</>
  );

const TONES = {
  gray: 'bg-gray-100 text-gray-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-700',
  blue: 'bg-blue-100 text-blue-700',
  amber: 'bg-amber-100 text-amber-700',
};

const Chip = ({ tone = 'gray', children }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]}`}>
    {children}
  </span>
);

const Kpi = ({ icon: Icon, label, value, sub, tone = 'purple', footer }) => (
  <div className="flex flex-col gap-2 rounded-xl bg-white p-5 shadow-lg">
    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
      {Icon && (
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${TONES[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      )}
      {label}
    </div>
    <div className="text-3xl font-bold text-gray-900">{value}</div>
    {sub && <div className="text-sm text-gray-500">{sub}</div>}
    {footer && <div className="mt-1 border-t border-gray-100 pt-2">{footer}</div>}
  </div>
);

const Card = ({ title, subtitle, icon: Icon, children, className = '', right }) => (
  <div className={`rounded-xl bg-white p-6 shadow-lg ${className}`}>
    {(title || right) && (
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800">
            {Icon && <Icon className="h-5 w-5 text-purple-600" />}
            {title}
          </h3>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {right}
      </div>
    )}
    {children}
  </div>
);

const Bullets = ({ items, icon: Icon = CheckCircle, color = 'text-green-600' }) => (
  <ul className="space-y-3">
    {items.filter(Boolean).map((t, i) => (
      <li key={i} className="flex gap-3 text-gray-700">
        <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${color}`} />
        <span>{t}</span>
      </li>
    ))}
  </ul>
);

const EmptyChart = ({ height = 260, label = 'Enter data to populate this chart' }) => (
  <div
    style={{ height }}
    className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 text-sm text-amber-700"
  >
    <Pencil className="h-5 w-5" />
    {label}
    
  </div>
);

const Source = ({ children }) => <p className="mt-3 text-xs italic text-gray-500">{children}</p>;

const PageHeader = ({ eyebrow, title, subtitle, icon: Icon, right }) => (
  <div className="mb-8 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white shadow-xl">
    <div className="flex flex-wrap items-start justify-between gap-6">
      <div className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-purple-300">{eyebrow}</p>
        <h2 className="mt-1 flex items-center gap-3 text-3xl font-bold">
          {Icon && <Icon className="h-8 w-8" />}
          {title}
        </h2>
        {subtitle && <p className="mt-2 text-lg opacity-90">{subtitle}</p>}
      </div>
      {right}
    </div>
  </div>
);

const Delta = ({ d, goodWhen = 'up', fmtAbs, digits = 1 }) => {
  if (!d) return <Tbc small />;
  const good = goodWhen === 'up' ? d.abs >= 0 : d.abs <= 0;
  const Icon = d.abs >= 0 ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 font-semibold ${good ? 'text-green-600' : 'text-red-600'}`}>
      <Icon className="h-4 w-4" />
      {fmtAbs ? signed(d.abs, fmtAbs) : null}
      {isNum(d.pct) && <span>{fmtAbs ? ` (${signed(d.pct, (x) => pct(x, digits))})` : signed(d.pct, (x) => pct(x, digits))}</span>}
    </span>
  );
};

const tooltipStyle = { borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' };

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------
const TABS = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'safety', label: 'Safety', icon: Shield },
  { id: 'service', label: 'Service', icon: Clock },
  { id: 'sca', label: 'SCA & Savings', icon: DollarSign },
  { id: 'spend', label: 'Cost & Volume', icon: BarChart3 },
  { id: 'productivity', label: 'Productivity', icon: Gauge },
  { id: 'initiatives', label: 'F27 Initiatives', icon: Target },
  { id: 'terminal', label: 'Terminal', icon: Wrench },
  { id: 'f26', label: 'F26 Recap', icon: Calendar },
  { id: 'qa', label: 'Q&A', icon: ClipboardCheck },
];

// --- Overview --------------------------------------------------------------
const OverviewTab = ({ d, x, go }) => {
  const fp = fiscalProgress();
  const p27 = d.productivity.f27;
  const agenda = [
    { id: 'safety', icon: Shield, title: 'Safety', text: 'Current TRIR, what we do every shift, and what we are adding in F27.' },
    { id: 'service', icon: Clock, title: 'Service', text: 'On-time service incl./excl. partner carriers, missed pickups and scanning.' },
    { id: 'sca', icon: DollarSign, title: 'SCA & Savings', text: 'Hours vs allowance, cost per PRO, labour cost and the F27 take-out plan.' },
    { id: 'spend', icon: BarChart3, title: 'Cost & Volume', text: 'Terminal cost Jul 2025 → Aug 2026 against PROs and weight; cost per PRO.' },
    { id: 'productivity', icon: Gauge, title: 'Productivity', text: 'PPH, units per hour, P&D measures, load factor and CICO.' },
    { id: 'terminal', icon: Wrench, title: 'Physical Terminal', text: 'Moving to a new building, expected before the end of 2026.' },
  ];
  return (
    <>
      <div className="mb-8 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-purple-300">
          {d.meta.fiscalYear} Senior Leadership Review · {d.meta.presentationDate}
        </p>
        <h2 className="mt-2 text-4xl font-bold">{d.meta.terminal} Terminal</h2>
        <p className="mt-3 max-w-4xl text-lg leading-relaxed opacity-95">
          September to date the dock is running at{' '}
          <span className="font-bold text-green-400">{isNum(x.wdPctUsed) ? `${pct(x.wdPctUsed)} of its SCA hour allowance` : 'under its SCA hour allowance'}</span>, cost per unit is{' '}
          <span className="font-bold text-green-400">{x.cpuVsLy ? `down ${pct(Math.abs(x.cpuVsLy.pct))} vs F26` : 'down vs F26'}</span>, units per hour are{' '}
          <span className="font-bold text-green-400">{x.uphVsLy ? `up ${pct(x.uphVsLy.pct)}` : 'up'}</span>, and overtime is only{' '}
          <span className="font-bold text-yellow-300">{isNum(p27.otHours) ? `${num(p27.otHours)} hours` : 'minimal'}</span>. The focus for the rest of F27 is
          closing the PPH gap to goal.
        </p>
        <div className="mt-6 max-w-xl">
          <div className="mb-1 flex justify-between text-sm opacity-80">
            <span>
              {d.meta.fiscalYear}: {d.meta.fiscalRange}
            </span>
            <span>
              Day {fp.day} of {fp.total} · {fp.pct.toFixed(0)}%
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-purple-400" style={{ width: `${fp.pct}%` }} />
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={Shield}
          tone="green"
          label="Safety · TRIR F27 YTD"
          value={<V v={d.safety.trirF27Ytd} fmt={(v) => num(v, 2)} />}
          sub={<>F26 <V v={d.safety.trirF26} fmt={(v) => num(v, 2)} small /> · 12-mo avg <V v={d.safety.trir12mmAvg} fmt={(v) => num(v, 2)} small /></>}
        />
        <Kpi
          icon={Clock}
          tone="purple"
          label={`Service · OTS adjusted (${x.otsLatest ? x.otsLatest.label : 'latest month'})`}
          value={<V v={x.otsLatest && x.otsLatest.incl} fmt={(v) => pct(v)} />}
          sub={<>Excl. partner carriers <V v={x.otsLatest && x.otsLatest.excl} fmt={(v) => pct(v)} small /> · target <V v={d.ots.target} fmt={(v) => pct(v, 0)} small /></>}
          footer={isNum(d.ots.last7Pct) && <Chip tone={d.ots.last7Pct >= (d.ots.target || 0) ? 'green' : 'amber'}>Last 7 days {pct(d.ots.last7Pct, 2)}</Chip>}
        />
        <Kpi
          icon={DollarSign}
          tone="green"
          label={`SCA · Hours vs allowance (${d.sca.period})`}
          value={<V v={x.wdPctUsed} fmt={(v) => pct(v)} />}
          sub={<>Cost per PRO <V v={d.sca.costPerProMtd} fmt={(v) => money(v, 2)} small /> vs <V v={d.sca.costPerProTarget} fmt={(v) => money(v, 2)} small /> target</>}
          footer={
            isNum(x.hoursUnder) && (
              <Chip tone={x.hoursUnder >= 0 ? 'green' : 'red'}>
                <CheckCircle className="h-3.5 w-3.5" /> {num(Math.abs(x.hoursUnder))} hrs {x.hoursUnder >= 0 ? 'under' : 'over'} allowance
              </Chip>
            )
          }
        />
        <Kpi
          icon={Gauge}
          tone="green"
          label={`Productivity · Units per hour (${d.productivity.period})`}
          value={<V v={p27.unitsPerHr} fmt={(v) => num(v, 1)} />}
          sub={<>F26 <V v={d.productivity.f26.unitsPerHr} fmt={(v) => num(v, 2)} small /></>}
          footer={x.uphVsLy && <Delta d={x.uphVsLy} goodWhen="up" />}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
        <Card title="Where the F27 savings are showing up" icon={Award} className="lg:col-span-3">
          <div className="space-y-3">
            {[
              {
                show: isNum(d.initiatives[0] && d.initiatives[0].annual),
                icon: Users,
                title: `${d.initiatives[0] && isNum(d.initiatives[0].annual) ? money(d.initiatives[0].annual) : ''}/yr confirmed — ${d.initiatives[0] ? d.initiatives[0].name.split(' — ')[0].toLowerCase() : ''}`,
                text: 'Dispatch is now centralized, so the dispatcher seat is no longer needed. More initiatives in development.',
              },
              {
                show: isNum(x.hoursUnder),
                icon: Clock,
                title: `${isNum(x.hoursUnder) ? num(x.hoursUnder) : ''} dock hours under the SCA allowance`,
                text: isNum(x.wdPctUsed)
                  ? `${num(d.sca.f27Hours)} hrs used vs ${num(d.sca.wdAllowable)} allowed (${pct(x.wdPctUsed)}) — ≈${kMoney(x.hoursUnderValue || 0)} at ${money(p27.hourlyRate, 2)}/hr. On pace for ${isNum(x.paceVsReductionTarget) ? pct(x.paceVsReductionTarget, 0) : '—'} of the ${num(d.sca.hourReductionTarget || 0)}-hr reduction target.`
                  : '',
              },
              {
                show: !!x.cpuVsLy && isNum(x.cpuSavings),
                icon: DollarSign,
                title: `Cost per unit ${isNum(x.cpu26) ? money(x.cpu26, 2) : ''} → ${isNum(x.cpu27) ? money(x.cpu27, 2) : ''}`,
                text: x.cpuVsLy ? `${pct(x.cpuVsLy.pct)} vs F26 — at last year's cost per unit, this month's ${num(p27.units)} units would have cost ≈${kMoney(x.cpuSavings)} more.` : '',
              },
              {
                show: !!x.hoursDelta.agency && !!x.labour.agency,
                icon: Users,
                title: 'Agency labour down vs F26',
                text: x.hoursDelta.agency && x.labour.agency
                  ? `Agency share of dock hours ${pct((d.sca.f26AgencyHours / d.sca.f26Hours) * 100)} → ${pct((d.sca.f27AgencyHours / d.sca.f27Hours) * 100)} (F26 Sept vs F27 Sept MTD). Agency cost ${money(d.sca.f26AgencyCost)} full month → ${money(d.sca.f27AgencyCost)} MTD.`
                  : '',
              },
              {
                show: isNum(x.cppPctOfTarget),
                icon: Target,
                title: `SCA dock cost per PRO ${isNum(d.sca.costPerProMtd) ? money(d.sca.costPerProMtd, 2) : ''} vs ${isNum(d.sca.costPerProTarget) ? money(d.sca.costPerProTarget, 2) : ''} target`,
                text: isNum(x.cppPctOfTarget) ? `${pct(x.cppPctOfTarget)} of target — ${money(x.cppUnder, 2)} under on ${num(d.sca.fbCountMtd)} freight bills (≈${kMoney(x.cppBelowTargetValue || 0)} MTD).` : '',
              },
              {
                show: isNum(p27.otHours),
                icon: CheckCircle,
                title: `Overtime held to ${isNum(p27.otHours) ? num(p27.otHours) : ''} hours`,
                text: isNum(p27.otPct) ? `${pct(p27.otPct)} of dock hours in ${d.productivity.period}.` : '',
              },
              {
                show: !!x.pphVsGoal,
                icon: AlertTriangle,
                title: 'Focus: PPH gap to goal',
                text: x.pphVsGoal ? `PPH ${num(p27.pph)} vs ${num(p27.pphGoal)} goal (${pct(x.pphVsGoal.pct)}). Flat vs F26 on lighter freight — load factor and shift-hour alignment are the levers.` : '',
                warn: true,
              },
            ]
              .filter((r) => r.show)
              .map((r, i) => (
                <div key={i} className="flex gap-4 rounded-lg bg-gray-50 p-4">
                  <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${r.warn ? TONES.amber : TONES.green}`}>
                    <r.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800">{r.title}</p>
                    <p className="text-sm text-gray-600">{r.text}</p>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        <Card title="Agenda" icon={ClipboardCheck} className="lg:col-span-2">
          <div className="space-y-3">
            {agenda.map((a, i) => (
              <button
                key={a.id}
                onClick={() => go(a.id)}
                className="flex w-full items-start gap-4 rounded-lg p-3 text-left transition-colors hover:bg-purple-50"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 font-bold text-white">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="flex items-center gap-2 font-semibold text-gray-800">
                    <a.icon className="h-4 w-4 text-purple-600" /> {a.title}
                  </p>
                  <p className="text-sm text-gray-600">{a.text}</p>
                </div>
                <ChevronRight className="mt-2 h-4 w-4 text-gray-400" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
};

// --- Safety ----------------------------------------------------------------
const SafetyTab = ({ d, x }) => {
  const s = d.safety;
  const trirGood = allNum(s.trirF27Ytd, s.trirTarget) ? s.trirF27Ytd <= s.trirTarget : allNum(s.trirF27Ytd, s.trirF26) ? s.trirF27Ytd <= s.trirF26 : null;
  return (
    <>
      <PageHeader
        eyebrow="1 · Safety"
        icon={Shield}
        title="TRIR — Total Recordable Incident Rate"
        subtitle="Where we are today, the processes in place, and what we are adding to improve in F27."
      />
      {isNum(s.trirF27Ytd) && s.trirF27Ytd === 0 && s.recordablesF27Ytd === 0 && (
        <div className="mb-8 flex items-center gap-3 rounded-xl bg-green-50 p-5 text-green-900 shadow">
          <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-600" />
          <p className="text-lg">
            <span className="font-bold">Zero recordable incidents in F27 to date (Jul–Aug)</span> — TRIR 0.00 vs {isNum(s.trirF26) ? num(s.trirF26, 2) : '—'} in F26.
            <span className="ml-2 text-xs text-green-700">Source: Management Control Report — F27 TRIR, Aug-26.</span>
          </p>
        </div>
      )}
      <div className="mb-8 grid grid-cols-2 gap-6 lg:grid-cols-5">
        <Kpi
          icon={Shield}
          tone={trirGood === null ? 'blue' : trirGood ? 'green' : 'red'}
          label="TRIR F27 YTD"
          value={<V v={s.trirF27Ytd} fmt={(v) => num(v, 2)} />}
        />
        <Kpi icon={Target} tone="purple" label="12-month avg" value={<V v={s.trir12mmAvg} fmt={(v) => num(v, 2)} />} />
        <Kpi icon={Calendar} tone="gray" label="TRIR F26" value={<V v={s.trirF26} fmt={(v) => num(v, 2)} />} />
        <Kpi icon={AlertTriangle} tone={s.recordablesF27Ytd === 0 ? 'green' : 'amber'} label="Recordables F27 YTD" value={<V v={s.recordablesF27Ytd} fmt={num} />} />
        <Kpi icon={CheckCircle} tone="green" label="Days since last recordable" value={<V v={x.daysSinceRecordable} fmt={num} />} sub={s.lastRecordableDate ? `Last: Sep 10, 2025` : null} />
      </div>
      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
        <Card title="Safety initiatives — status" icon={ClipboardCheck} className="lg:col-span-3">
          <div className="mb-3 flex gap-2">
            <Chip tone="green">{s.initiatives.filter((i) => i.status === 'Completed').length} completed</Chip>
            <Chip tone="blue">{s.initiatives.filter((i) => i.status === 'Active').length} active</Chip>
            <Chip tone="amber">{s.initiatives.filter((i) => i.status === 'Planned').length} planned</Chip>
          </div>
          <ul className="space-y-2">
            {s.initiatives.map((i) => (
              <li key={i.name} className="flex items-start justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-sm text-gray-800">
                  {i.name}
                  {i.note && <span className="block text-xs text-gray-500">{i.note}</span>}
                </span>
                <Chip tone={i.status === 'Completed' ? 'green' : i.status === 'Planned' ? 'amber' : 'blue'}>{i.status}</Chip>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Ideas to action" icon={Zap} className="lg:col-span-2">
          <Bullets items={s.ideas} icon={ChevronRight} color="text-purple-600" />
        </Card>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card title="What we do every shift" icon={ClipboardCheck}>
          <Bullets items={s.practices} />
        </Card>
        <div className="space-y-8">
          <Card title="Incident reporting & training" icon={Users}>
            <Bullets items={s.incidentProcess} icon={CheckCircle} color="text-blue-600" />
          </Card>
          <Card title="Site-specific initiatives" icon={Zap}>
            <Bullets items={s.f27Plans} icon={ChevronRight} color="text-purple-600" />
          </Card>
        </div>
      </div>
    </>
  );
};

// --- Service ---------------------------------------------------------------
const ServiceTab = ({ d, x }) => {
  const o = d.ots;
  const sc = d.scanning;
  return (
    <>
      <PageHeader
        eyebrow="2 · Service"
        icon={Clock}
        title="Service — On-Time, Missed Pickups & Scanning"
        subtitle="Current service levels, what is driving the misses and lates, and the plan to improve in F27."
      />
      <Card title="On-time service (adjusted)" subtitle={`Adj On Time dashboard · ${o.period}`} icon={Clock} className="mb-8">
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: `${x.otsLatest ? x.otsLatest.label : 'Latest month'} · incl. partner carriers`, v: x.otsLatest && x.otsLatest.incl },
            { label: `${x.otsLatest ? x.otsLatest.label : 'Latest month'} · excl. partner carriers`, v: x.otsLatest && x.otsLatest.excl },
            { label: 'Last 7 days (Sep 22–28)', v: o.last7Pct, d: 2 },
          ].map((t) => {
            const good = allNum(t.v, o.target) ? t.v >= o.target : null;
            return (
              <div key={t.label} className={`rounded-xl p-4 ${good === null ? 'bg-gray-50' : good ? 'bg-green-50' : 'bg-amber-50'}`}>
                <p className="text-sm font-medium text-gray-600">{t.label}</p>
                <p className={`text-4xl font-bold ${good === null ? 'text-gray-900' : good ? 'text-green-700' : 'text-amber-700'}`}>
                  <V v={t.v} fmt={(v) => pct(v, t.d || 1)} />
                </p>
              </div>
            );
          })}
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-600">Target</p>
            <p className="text-4xl font-bold text-gray-900"><V v={o.target} fmt={(v) => pct(v, 0)} /></p>
            <p className="text-xs text-gray-500">Adjusted on time</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <p className="mb-2 text-sm font-semibold text-gray-700">Adjusted on-time % by month — including vs excluding partner carriers</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={o.months} margin={{ top: 20, right: 20, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <ReferenceArea x1="Jul" x2="Sep" fill="#7c3aed" fillOpacity={0.06} label={{ value: 'F27', position: 'insideTopRight', fill: '#7c3aed', fontSize: 12, fontWeight: 600 }} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis domain={[75, 100]} ticks={[75, 80, 85, 90, 95, 100]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => pct(v)} />
                <Legend />
                {isNum(o.target) && (
                  <ReferenceLine y={o.target} stroke="#059669" strokeDasharray="5 5" label={{ value: `Target ${o.target}%`, position: 'insideBottomLeft', fill: '#059669', fontSize: 11 }} />
                )}
                <Line type="monotone" dataKey="incl" name="Incl. partner carriers" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4 }}>
                  <LabelList dataKey="incl" position="bottom" style={{ fontSize: 10, fill: '#6d28d9' }} />
                </Line>
                <Line type="monotone" dataKey="excl" name="Excl. partner carriers" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }}>
                  <LabelList dataKey="excl" position="top" style={{ fontSize: 10, fill: '#0e7490' }} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
            <p className="mt-2 text-sm text-gray-600">
              Jan–Jun = F26 · Jul–Sep = F27. OTS has climbed every month since April (81.5%) and is above target since August.
            </p>
          </div>
          <div className="space-y-4 lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-left text-gray-500">
                    <th className="py-2 pr-2 font-semibold">{o.period}</th>
                    <th className="py-2 pr-2 text-right font-semibold">Incl. partners</th>
                    <th className="py-2 text-right font-semibold">Excl. partners</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-2 text-gray-700">Adj on time</td>
                    <td className="py-2 pr-2 text-right font-semibold"><V v={o.inclPartners.pct} fmt={(v) => pct(v, 2)} small /></td>
                    <td className="py-2 text-right font-semibold text-green-700"><V v={o.exclPartners.pct} fmt={(v) => pct(v, 2)} small /></td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-2 text-gray-700">Late FBs</td>
                    <td className="py-2 pr-2 text-right"><V v={o.inclPartners.lateFbs} fmt={num} small /></td>
                    <td className="py-2 text-right"><V v={o.exclPartners.lateFbs} fmt={num} small /></td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-2 text-gray-700">On-time FBs</td>
                    <td className="py-2 pr-2 text-right"><V v={o.inclPartners.onTimeFbs} fmt={num} small /></td>
                    <td className="py-2 text-right"><V v={o.exclPartners.onTimeFbs} fmt={num} small /></td>
                  </tr>
                </tbody>
              </table>
            </div>
            {isNum(x.partnerOnTimePct) && (
              <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-semibold">Partner-carrier (beyond interliner) freight</p>
                <p className="mt-1">
                  ≈{num(x.partnerFbs)} FBs, ≈{num(x.partnerLate)} late → only <span className="font-semibold">≈{pct(x.partnerOnTimePct, 0)} on time</span>. About{' '}
                  {pct(x.partnerVolShare, 0)} of volume but <span className="font-semibold">≈{pct(x.partnerLateShare, 0)} of all late FBs</span>.
                </p>
                <p className="mt-1 text-xs text-amber-800">Calculated: included minus excluded totals.</p>
              </div>
            )}
            <div>
              <p className="mb-1 text-sm font-semibold text-gray-700">Last 7 days</p>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={o.last7Days} margin={{ top: 16, right: 0, bottom: 0, left: -30 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis domain={[80, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => pct(v)} />
                  <Bar dataKey="pct" name="Adj on time %" radius={[3, 3, 0, 0]}>
                    {o.last7Days.map((r) => (
                      <Cell key={r.label} fill={isNum(o.target) && r.pct >= o.target ? '#059669' : '#f59e0b'} />
                    ))}
                    <LabelList dataKey="pct" position="top" style={{ fontSize: 10, fill: '#374151' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-700">Plan to hold and improve OTS</p>
            <Bullets items={o.actions} icon={ChevronRight} color="text-purple-600" />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-700">Lates by reason code</p>
            {x.codesHaveData ? (
              <div className="flex flex-wrap gap-2">
                {x.codeRows.filter((r) => isNum(r.count)).map((r) => (
                  <Chip key={r.code} tone={r.code === 'IN' || r.code === 'TB' ? 'gray' : 'purple'}>
                    {r.code}: {num(r.count)}
                  </Chip>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Late codes by reason (AS, BD, OT, TF, LH, DL, MS, IN, TB) to follow.
              </p>
            )}
            <Source>IN = agent / beyond-carrier delays · TB = transborder delays — outside terminal control.</Source>
          </div>
        </div>
        <Source>
          Source: Adj On Time dashboard — Mississauga, {o.period}. “Beyond interliner” = partner-carrier freight; the excluded view shows terminal-controlled performance.
        </Source>
      </Card>

      <MissedPuCard m={d.missedPu} />

      <Card title="Cargo claims & damage" subtitle={`Claims report · terminal ${d.claims.terminalCode} (Mississauga)`} icon={Shield} className="mb-8">
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Claims amount</p>
            <p className="text-4xl font-bold text-gray-900"><V v={d.claims.amount} fmt={(v) => money(v, 2)} /></p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Period</p>
            <p className="text-lg font-semibold text-gray-800"><V v={d.claims.period} /></p>
          </div>
          <p className="max-w-xl text-sm text-gray-600">
            Claims are up vs F26 on the P&L (Jul–Aug +$15.1K). The freight-handling equipment initiative (panel carts, racks) targets damage.
          </p>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-100 pt-5 lg:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-gray-600">Damaged freight bills · 7-day avg</p>
            <p className="text-4xl font-bold text-red-600"><V v={d.damage.last7Pct} fmt={(v) => pct(v, 2)} /></p>
            <p className="text-xs text-gray-500">Week 39 {isNum(d.damage.week39) ? pct(d.damage.week39, 2) : '—'} · week 40 {isNum(d.damage.week40) ? pct(d.damage.week40, 2) : '—'} (partial)</p>
            <p className="mt-2 text-sm text-gray-600">Daily rate {pct(d.damage.last7Days[0].pct, 2)} on Sep 22; latest day {pct(d.damage.last7Days[d.damage.last7Days.length - 1].pct, 2)} on Sep 28.</p>
          </div>
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={d.damage.last7Days} margin={{ top: 18, right: 5, bottom: 0, left: -25 }}>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => pct(v, 2)} />
                <Bar dataKey="pct" name="Damaged FB %" fill="#f87171" radius={[3, 3, 0, 0]}>
                  <LabelList dataKey="pct" position="top" formatter={(v) => `${v}%`} style={{ fontSize: 10, fill: '#374151' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <Source>Source: % Damaged FB dashboard — Mississauga (PU terminal), to Sep 28, 2026.</Source>
          </div>
        </div>
      </Card>

      <Card title="Scanning compliance — in/out of facility" subtitle={`Compliance Reporting · ${sc.dateRange} · all trip types`} icon={Activity}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {sc.measures.map((m) => {
            const good = allNum(m.pct, sc.target) ? m.pct >= sc.target : null;
            const deltaChip = (v, label) =>
              isNum(v) && (
                <Chip tone={v >= 0 ? 'green' : 'red'}>
                  {v >= 0 ? '↑' : '↓'} {Math.abs(v).toFixed(2)} {label}
                </Chip>
              );
            return (
              <div key={m.label} className={`rounded-xl p-5 ${good === null ? 'bg-gray-50' : good ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="text-sm font-medium text-gray-600">{m.label}</p>
                <p className="mt-1 text-4xl font-bold text-gray-900"><V v={m.pct} fmt={(v) => pct(v, 2)} /></p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {deltaChip(m.vsLast, 'vs last period')}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Sep 1–28: {isNum(m.scanned) ? num(m.scanned) : '—'} of {isNum(m.total) ? num(m.total) : '—'} scan events · Fiscal YTD <V v={m.fytd} fmt={(v) => pct(v, 2)} small />
                </p>
              </div>
            );
          })}
        </div>
        {allNum(sc.measures[0].scanned, sc.measures[0].total) && (
          <p className="mt-4 text-sm text-gray-600">
            September is in line with fiscal YTD ({pct(sc.measures[0].pct, 2)} vs {pct(sc.measures[0].fytd, 2)} of freight bills scanned). ≈{num(sc.measures[0].total - sc.measures[0].scanned)} freight bills were not scanned in/out Sep 1–28 — closing that gap also cuts the “already serviced” missed-PU false positives.
          </p>
        )}
        <Source>Source: Compliance Reporting — Scanning Efficiency In/Out of Terminals, D&R Commerce Mississauga.{isNum(sc.target) ? ` Target ${pct(sc.target, 0)}.` : ''}</Source>
      </Card>
    </>
  );
};

// --- Missed pickups (Service tab) ---------------------------------------------
const MissedPuCard = ({ m }) => {
  const trueMissPct =
    allNum(m.totalMissed, m.falsePositiveCount, m.totalMeasured) && m.totalMeasured > 0
      ? ((m.totalMissed - m.falsePositiveCount) / m.totalMeasured) * 100
      : null;
  const opsIssue = m.byCategory.find((c) => /^ops issue/i.test(c.label));
  const falsePos = m.byCategory.find((c) => /false/i.test(c.label));
  return (
    <Card title="Missed pickups" subtitle={`Missed PU dashboard · ${m.period}`} icon={Truck} className="mb-8">
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-red-50 p-4">
          <p className="text-sm font-medium text-gray-600">Missed PU % · all dates</p>
          <p className="text-4xl font-bold text-red-600"><V v={m.missedPct} fmt={(v) => pct(v, 2)} /></p>
          <p className="text-xs text-gray-500">
            <V v={m.totalMissed} fmt={num} small /> missed of <V v={m.totalMeasured} fmt={(v) => `${num(v / 1000, 0)}K`} small /> measured
          </p>
        </div>
        <div className="rounded-xl bg-green-50 p-4">
          <p className="text-sm font-medium text-gray-600">Last 7 days (to Sep 26)</p>
          <p className="text-4xl font-bold text-green-700"><V v={m.last7Pct} fmt={(v) => pct(v, 2)} /></p>
          <p className="text-xs text-gray-500">Sep MTD {isNum(m.byMonth[3] && m.byMonth[3].pct) ? pct(m.byMonth[3].pct, 2) : '—'}{isNum(m.byMonth[2] && m.byMonth[2].pct) ? ` (Aug ${pct(m.byMonth[2].pct, 2)})` : ''}</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-4">
          <p className="text-sm font-medium text-gray-600">OPS false positives</p>
          <p className="text-4xl font-bold text-amber-700">{falsePos ? pct(falsePos.pct) : <Tbc />}</p>
          <p className="text-xs text-gray-500">of missed PUs — pickup was made, not closed out</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-600">Excluding false positives</p>
          <p className="text-4xl font-bold text-gray-900"><V v={trueMissPct} fmt={(v) => `≈${pct(v)}`} /></p>
          <p className="text-xs text-gray-500">(missed − false positives) ÷ measured</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">By month</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={m.byMonth} margin={{ top: 20, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => pct(v, 2)} />
              <Bar dataKey="pct" name="Missed PU %" fill="#dc2626" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="pct" position="top" formatter={(v) => `${v}%`} style={{ fontSize: 11, fill: '#374151' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Last 7 days</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={m.last7Days} margin={{ top: 20, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => pct(v, 2)} />
              <Bar dataKey="pct" name="Missed PU %" fill="#f87171" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="pct" position="top" formatter={(v) => `${v}%`} style={{ fontSize: 11, fill: '#374151' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Why pickups were missed</p>
          <div className="space-y-2">
            {m.byCategory.map((c) => (
              <div key={c.label}>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{c.label}</span>
                  <span className="font-semibold">{isNum(c.count) ? `${num(c.count)} · ` : ''}{pct(c.pct)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className={`h-full ${/false/i.test(c.label) ? 'bg-amber-500' : /ops/i.test(c.label) ? 'bg-red-500' : 'bg-gray-400'}`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mb-1 mt-4 text-xs font-semibold uppercase text-gray-500">Top reasons</p>
          <ul className="space-y-1 text-sm text-gray-700">
            {m.topReasons.map((r) => (
              <li key={r.label} className="flex justify-between">
                <span>{r.label}</span>
                <span className="font-semibold">{num(r.count)} ({pct(r.pct)})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">What the data says</p>
          <p className="mt-1">
            Only {opsIssue ? pct(opsIssue.pct, 0) : '—'} of missed pickups are true OPS issues. {falsePos ? pct(falsePos.pct, 0) : '—'} are OPS false positives
            ({m.topReasons[0] ? `${pct(m.topReasons[0].pct, 0)} coded “${m.topReasons[0].label.toLowerCase()}”` : ''}) — a close-out and scanning fix, not a service failure.
          </p>
          <p className="mt-2 text-xs text-amber-800">{m.notes.join(' ')}</p>
        </div>
        <div>
          <Bullets items={m.actions} icon={ChevronRight} color="text-purple-600" />
        </div>
      </div>
    </Card>
  );
};

// --- Extra SCA / productivity cards -----------------------------------------
const AccessorialCard = ({ a }) => {
  const total = sum(a.monthly.map((r) => r.units));
  const top = a.monthly.slice(0, 6);
  const top3 = sum(a.monthly.slice(0, 3).map((r) => r.units));
  return (
    <Card title="Accessorial capture" subtitle="Accessorial unit volume report · current month" icon={DollarSign} className="mb-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Top accessorials this month · ≈{num(total)} units total</p>
          <div className="space-y-2">
            {top.map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-xs text-gray-600"><span>{r.label}</span><span className="font-semibold">{num(r.units)}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full bg-purple-500" style={{ width: `${(r.units / top[0].units) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-600">Private-residence, tailgate and appointment deliveries are ≈{pct((top3 / total) * 100, 0)} of volume — every one coded is revenue captured.</p>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Weekly accessorial units (thousands) · 12 weeks</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={a.weekly} margin={{ top: 20, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}K units`} />
              <Bar dataKey="k" name="Units (K)" fill="#7c3aed" radius={[3, 3, 0, 0]}>
                <LabelList dataKey="k" position="top" style={{ fontSize: 10, fill: '#374151' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <Source>*Week of Sep 28 is partial.</Source>
        </div>
      </div>
    </Card>
  );
};

const LabourCard = ({ l }) => {
  const rows = [
    ['Hours worked', 'hours', (v) => `${num(v / 1000, 1)}K`],
    ['Total paid', 'totalPaid', (v) => `$${num(v / 1000, 1)}K`],
    ['Dock Operations hours', 'dockHours', (v) => num(v, 0)],
    ['Dock regular cost', 'dockRegCost', money],
    ['Terminal Admin hours', 'adminHours', (v) => num(v, 0)],
    ['Terminal Admin regular cost', 'adminRegCost', money],
    ['OT hours', 'otHours', (v) => num(v, 1)],
    ['OT paid', 'otPaid', (v) => `$${num(v / 1000, 1)}K`],
    ['Head count', 'headCount', num],
    ['OT as % of hours', 'otPct', (v) => pct(v)],
  ];
  return (
    <Card title="Labour distribution — company employees" subtitle="Terminal Labor Distribution Report · Q1 (Jul–Sep) F26 vs F27 to date" icon={Users} className="mb-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="overflow-x-auto lg:col-span-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 text-left text-gray-500">
                <th className="py-2 pr-4 font-semibold">Metric</th>
                <th className="py-2 pr-4 text-right font-semibold">Q1 F26</th>
                <th className="py-2 text-right font-semibold">Q1 F27</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, key, fmt]) => (
                <tr key={key} className="border-b border-gray-100">
                  <td className="py-2 pr-4 text-gray-700">{label}</td>
                  <td className="py-2 pr-4 text-right text-gray-600"><V v={l.f26[key]} fmt={fmt} small /></td>
                  <td className="py-2 text-right font-semibold"><V v={l.f27[key]} fmt={fmt} small /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 text-sm lg:col-span-2">
          <div className="rounded-lg bg-green-50 p-4 text-green-900">
            <p className="font-semibold">Company dock hours flat</p>
            <p>{num(l.f26.dockHours)} → {num(l.f27.dockHours)} hrs, while agency hours were cut (see SCA hours above). OT held at {pct(l.f27.otPct)} of hours.</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-4 text-amber-900">
            <p className="font-semibold">Company Terminal Admin hours up (labour distribution)</p>
            <p>{num(l.f26.adminHours)} → {num(l.f27.adminHours)} hrs ({money(l.f26.adminRegCost)} → {money(l.f27.adminRegCost)}). Company admin wages doubled vs F26 but are below F24 and F25. Total Terminal Admin on the P&L is down (agency admin −$61.8K Jul–Aug; see Cost & Volume).</p>
          </div>
          <div>
            <p className="mb-1 text-sm font-semibold text-gray-700">Terminal Admin cost — Q1 by fiscal year</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={l.adminQ1CostByYear} margin={{ top: 18, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="fy" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}K`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => money(v)} />
                <Bar dataKey="cost" name="Admin cost" radius={[3, 3, 0, 0]}>
                  {l.adminQ1CostByYear.map((r) => <Cell key={r.fy} fill={r.fy === 'F27' ? '#7c3aed' : '#9ca3af'} />)}
                  <LabelList dataKey="cost" position="top" formatter={(v) => `$${(v / 1000).toFixed(1)}K`} style={{ fontSize: 10, fill: '#374151' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <Source>Summed from the weekly cost report, fiscal weeks 1–13.</Source>
          </div>
        </div>
      </div>
    </Card>
  );
};

const PdCard = ({ p }) => (
  <Card title="P&D — trip & stop measures" subtitle={`P&D daily totals dashboard · ${p.period}`} icon={Truck} className="mb-8">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {p.totals.map((t) => (
        <div key={t.label} className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">{t.label}</p>
          <p className="text-lg font-bold text-gray-900"><V v={t.v} fmt={num} small /></p>
        </div>
      ))}
    </div>
    <div className="mt-4 grid grid-cols-3 gap-3 lg:grid-cols-9">
      {p.ratios.map((t) => (
        <div key={t.label} className="rounded-lg bg-purple-50 p-3 text-center">
          <p className="text-xs text-gray-500">{t.label}</p>
          <p className="text-lg font-bold text-purple-700"><V v={t.v} fmt={(v) => num(v, t.d || 0)} small /></p>
        </div>
      ))}
    </div>
  </Card>
);

const ReweighCard = ({ r }) => {
  const tone = (v) => (!isNum(v) || !isNum(r.target) ? 'gray' : v >= r.target ? 'green' : v >= r.target * 0.8 ? 'amber' : 'red');
  const fill = { green: '#059669', amber: '#f59e0b', red: '#dc2626', gray: '#9ca3af' };
  const f27 = r.byMonth.filter((m) => m.fy === 'F27');
  return (
    <Card title="Revenue protection — fork truck reweighs" subtitle="Fork Truck Reweighs dashboard · Mississauga (origin)" icon={Gauge} className="mb-8">
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-green-50 p-4">
          <p className="text-sm font-medium text-gray-600">Last 7 days · vs target</p>
          <p className="text-4xl font-bold text-green-700"><V v={r.last7Pct} fmt={(v) => pct(v, 2)} /></p>
        </div>
        {f27.map((m) => (
          <div key={m.label} className="rounded-xl bg-green-50 p-4">
            <p className="text-sm font-medium text-gray-600">{m.label} (F27) · vs target</p>
            <p className="text-4xl font-bold text-green-700"><V v={m.pct} fmt={(v) => pct(v)} /></p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="mb-2 text-sm font-semibold text-gray-700">Reweighs to target % by month</p>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={r.byMonth} margin={{ top: 20, right: 10, bottom: 0, left: -15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => pct(v)} />
              {isNum(r.target) && <ReferenceLine y={r.target} stroke="#059669" strokeDasharray="5 5" />}
              <Bar dataKey="pct" name="Reweighs to target %" radius={[4, 4, 0, 0]}>
                {r.byMonth.map((m) => <Cell key={m.label} fill={fill[tone(m.pct)]} fillOpacity={m.fy === 'F27' ? 1 : 0.55} />)}
                <LabelList dataKey="pct" position="top" formatter={(v) => `${v}%`} style={{ fontSize: 11, fill: '#374151' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-1 text-xs text-gray-500">Solid bars = F27 (Jul–Sep). Target line = 100%.</p>
        </div>
        <div className="space-y-3 text-sm">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs text-gray-500">All selected dates</p>
            <p className="text-2xl font-bold text-gray-900">{isNum(r.totalReweighs) ? num(r.totalReweighs) : '—'} <span className="text-sm font-normal text-gray-500">of {isNum(r.totalTarget) ? `${num(r.totalTarget / 1000)}K` : '—'} target</span></p>
            <p className="text-amber-700"><V v={r.overallPct} fmt={(v) => `${pct(v, 2)} — includes the March ramp-up`} small /></p>
          </div>
          <div className="flex flex-wrap gap-2">
            {r.recentWeeks.map((w) => <Chip key={w.label} tone={tone(w.pct)}>{w.label}: {pct(w.pct)}</Chip>)}
          </div>
          <p className="text-gray-600">Every month since April is above target. Reweighs correct under-declared weights, protecting revenue on every reweighed bill.</p>
          <Source>*Wk 40 is partial.</Source>
        </div>
      </div>
    </Card>
  );
};

// --- Load factor with "excluding Moncton" toggle ------------------------------
const LoadFactorCard = ({ lf }) => {
  const [exMoncton, setExMoncton] = useState(false);
  const agg = (rows) => {
    const loads = sum(rows.map((r) => r.loads));
    const over80 = sum(rows.map((r) => r.over80));
    const loadW = sum(rows.map((r) => r.loads * r.loadPct));
    return { loads, over80, lfScore: loads ? (over80 / loads) * 100 : null, loadPct: loads ? loadW / loads : null };
  };
  const months = lf.months.map((m, i) => {
    if (!exMoncton) return m;
    const mo = lf.moncton[i];
    const loads = m.loads - mo.loads;
    const over80 = m.over80 - mo.over80;
    return { ...m, loads, over80, lfScore: +((over80 / loads) * 100).toFixed(1), loadPct: +((m.loads * m.loadPct - mo.loads * mo.loadPct) / loads).toFixed(1) };
  });
  const tot = agg(months);
  const billsAll = sum(lf.monthBills.map((m) => m.bills));
  const noCubeAll = sum(lf.monthBills.map((m) => m.noCube));
  const moBills = sum(lf.moncton.map((m) => m.bills));
  const moNoCube = sum(lf.moncton.map((m) => m.noCube));
  const bills = exMoncton ? billsAll - moBills : billsAll;
  const noCube = exMoncton ? noCubeAll - moNoCube : noCubeAll;
  const mo = agg(lf.moncton);
  const bands = lf.bands.map((b) => {
    const t = agg(b.months.map(([loads, over80, loadPct]) => ({ loads, over80, loadPct })));
    return { band: b.band, lanes: b.lanes, loads: t.loads, lfScore: +t.lfScore.toFixed(1), loadPct: +t.loadPct.toFixed(1) };
  });
  const lanes = exMoncton ? lf.lanes.filter((l) => l.lane !== 'Moncton') : lf.lanes;

  return (
    <Card
      title="Load factor — outbound"
      subtitle="Load factor report · Mississauga · F27 Jul–Sep"
      icon={Truck}
      right={
        <div className="flex rounded-lg bg-gray-100 p-1 text-xs font-medium">
          {[
            [false, 'All lanes'],
            [true, 'Excluding Moncton'],
          ].map(([v, label]) => (
            <button
              key={label}
              onClick={() => setExMoncton(v)}
              className={`rounded-md px-3 py-1.5 transition-colors ${exMoncton === v ? 'bg-white text-purple-700 shadow' : 'text-gray-600 hover:text-gray-800'}`}
            >
              {label}
            </button>
          ))}
        </div>
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-amber-50 p-3">
          <p className="text-xs text-gray-500">LF score</p>
          <p className="text-2xl font-bold text-amber-700">{isNum(tot.lfScore) ? pct(tot.lfScore) : <Tbc small />}</p>
          <p className="text-xs text-gray-500">loads over 80% full</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Avg load %</p>
          <p className="text-2xl font-bold text-gray-900">{isNum(tot.loadPct) ? pct(tot.loadPct) : <Tbc small />}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Loads</p>
          <p className="text-2xl font-bold text-gray-900">{num(tot.loads)}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Bills with no cube</p>
          <p className="text-2xl font-bold text-gray-900">{pct((noCube / bills) * 100)}</p>
          <p className="text-xs text-gray-500">{num(noCube)} of {num(bills)}</p>
        </div>
      </div>
      {exMoncton && <p className="mb-3 text-xs italic text-gray-500">Excluding the Moncton lane ({num(mo.loads)} loads) — calculated from the load factor report.</p>}

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={months} margin={{ top: 20, right: 10, bottom: 0, left: -15 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => pct(v)} />
          <Legend />
          <Bar dataKey="lfScore" name="LF score %" fill="#7c3aed" radius={[3, 3, 0, 0]}>
            <LabelList dataKey="lfScore" position="top" style={{ fontSize: 10, fill: '#374151' }} />
          </Bar>
          <Bar dataKey="loadPct" name="Load %" fill="#06b6d4" radius={[3, 3, 0, 0]}>
            <LabelList dataKey="loadPct" position="top" style={{ fontSize: 10, fill: '#374151' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="mb-2 mt-5 text-sm font-semibold text-gray-700">By distance band (as grouped in the report)</p>
      <div className="grid grid-cols-3 gap-3">
        {bands.map((b) => (
          <div key={b.band} className={`rounded-lg p-3 ${b.lfScore >= 50 ? 'bg-green-50' : b.lfScore < 25 ? 'bg-red-50' : 'bg-gray-50'}`}>
            <p className="text-xs font-semibold text-gray-700">{b.band}</p>
            <p className="text-lg font-bold text-gray-900">{pct(b.lfScore)} <span className="text-xs font-normal text-gray-500">LF score</span></p>
            <p className="text-xs text-gray-600">Load {pct(b.loadPct)} · {num(b.loads)} loads</p>
            <p className="mt-1 text-[11px] leading-tight text-gray-500">{b.lanes}</p>
          </div>
        ))}
      </div>
      <p className="mt-1 text-xs text-gray-500">The report has no headhaul/backhaul field (lane type is "Not Defined"), so lanes are grouped by the report's distance bands. Bands include Moncton.</p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-1.5 pr-2 font-semibold">Lane (LF score)</th>
              <th className="py-1.5 pr-2 text-right font-semibold">Jul</th>
              <th className="py-1.5 pr-2 text-right font-semibold">Aug</th>
              <th className="py-1.5 text-right font-semibold">Sep</th>
            </tr>
          </thead>
          <tbody>
            {lanes.map((l) => (
              <tr key={l.lane} className={`border-b border-gray-100 ${l.lane === 'Moncton' ? 'bg-amber-50' : ''}`}>
                <td className="py-1.5 pr-2 font-medium text-gray-700">{l.lane}{l.lane === 'Moncton' && ' *'}</td>
                {l.lf.map((v, i) => (
                  <td key={i} className={`py-1.5 pr-2 text-right font-semibold ${v >= 60 ? 'text-green-700' : v < 15 ? 'text-red-600' : 'text-gray-700'}`}>{pct(v)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
        <p className="font-semibold">* Toyota baseload footage</p>
        <p>{lf.toyotaNote}</p>
        <p className="mt-1">
          Moncton: <span className="font-semibold">{pct((moNoCube / moBills) * 100)} of bills have no cube</span> vs{' '}
          {pct(((noCubeAll - moNoCube) / (billsAll - moBills)) * 100)} on all other lanes, and many Moncton loads carry the same 24–27 no-cube bills — the pattern of an uncaptured baseload. Measured LF on those loads is understated.
        </p>
      </div>
      <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
        Western lanes are strong (Burnaby {pct(lf.lanes[0].lf[2])} in Sept). Windsor, Quebec City and Dartmouth run consistently light — consolidation / frequency review.
      </div>
      <Source>LF score = share of loads over 80% full · Load % = load-weighted average. Excluding-Moncton and band figures are calculated from the report.</Source>
    </Card>
  );
};

// --- Q&A prep — answers to the questions leadership is likely to ask ----------
const QaTab = ({ d, x }) => {
  const s = d.sca;
  const p = d.productivity;
  const lab = d.labour;
  const o = d.ots;
  const f = (v, fmt, fallback = 'TBC') => (isNum(v) ? fmt(v) : fallback);
  const perWd = allNum(s.f27TotalCost, s.wdMtd) && s.wdMtd > 0 ? s.f27TotalCost / s.wdMtd : null;
  const projSept = allNum(perWd, s.wdMonth) ? perWd * s.wdMonth : null;
  const projVsF26 = allNum(projSept, s.f26TotalCost) ? ((projSept - s.f26TotalCost) / s.f26TotalCost) * 100 : null;
  const agencyCostShare27 = allNum(s.f27AgencyCost, s.f27TotalCost) ? (s.f27AgencyCost / s.f27TotalCost) * 100 : null;
  const agencyCostShare26 = allNum(s.f26AgencyCost, s.f26TotalCost) ? (s.f26AgencyCost / s.f26TotalCost) * 100 : null;
  const agencyHrsShare27 = allNum(s.f27AgencyHours, s.f27Hours) ? (s.f27AgencyHours / s.f27Hours) * 100 : null;
  const agencyHrsShare26 = allNum(s.f26AgencyHours, s.f26Hours) ? (s.f26AgencyHours / s.f26Hours) * 100 : null;
  const identified = x.initHasAnnual ? x.initAnnual : null;
  const latest = x.otsLatest;
  const reductionValue = allNum(s.hourReductionTarget, p.f27.hourlyRate) ? s.hourReductionTarget * p.f27.hourlyRate : null;
  const monthsLeft = 9; // Oct 2026 – Jun 2027
  const gap = allNum(s.f27SavingsTarget) ? s.f27SavingsTarget - (identified || 0) : null;
  const gapPerMonth = isNum(gap) ? gap / monthsLeft : null;

  const qa = [
    {
      q: 'What is your SCA target?',
      a: [
        `September SCA target: ${f(s.scaTargetHours, num)} dock hours — F26 September ${f(s.f26Hours, num)} hrs less the ${f(s.hourReductionTarget, num)}-hour reduction target.`,
        `Daily: ${f(s.wdTargetPerDay, num)} hours per working day (${f(s.cdTargetPerDay, num)} per calendar day).`,
        `Cost per PRO target: ${f(s.costPerProTarget, (v) => money(v, 2))}.`,
      ],
    },
    {
      q: 'How are you tracking against target?',
      a: [
        `${f(s.f27Hours, num)} hours used vs ${f(s.wdAllowable, num)} allowed month-to-date = ${f(x.wdPctUsed, (v) => pct(v))} of allowance — ${f(x.hoursUnder, num)} hours under (≈${f(x.hoursUnderValue, kMoney)}).`,
        `On pace for ≈${f(x.paceHours, num)} hours in September vs the ${f(s.scaTargetHours, num)} target — ${f(x.paceVsReductionTarget, (v) => pct(v, 0))} of the hour-reduction target.`,
        `Cost per PRO ${f(s.costPerProMtd, (v) => money(v, 2))} vs ${f(s.costPerProTarget, (v) => money(v, 2))} = ${f(x.cppPctOfTarget, (v) => pct(v))} of target (amber watch band).`,
      ],
    },
    {
      q: 'How are you tracking to the year-end goal?',
      a: [
        `F27 cost take-out target: ${f(s.f27SavingsTarget, money)}.`,
        `Identified so far: ${f(identified, money)} per year — dispatcher role eliminated with dispatch centralized. More initiatives in development.`,
        `Run-rate evidence: cost per unit ${f(x.cpu26, (v) => money(v, 2))} → ${f(x.cpu27, (v) => money(v, 2))} (≈${f(x.cpuSavings, kMoney)} avoided in September to date), hours under SCA allowance, agency share down.`,
      ],
      calc: true,
    },
    {
      q: 'What savings are needed to hit your goals?',
      a: [
        `SCA hours: September requires ${f(s.hourReductionTarget, num)} fewer dock hours than F26 September (≈${f(reductionValue, kMoney)} at ${f(p.f27.hourlyRate, (v) => money(v, 2))}/hr). We are on pace for ≈${f(x.paceReduction, num)} — ${f(x.paceVsReductionTarget, (v) => pct(v, 0))} of the requirement.`,
        `Cost per PRO: stay under ${f(s.costPerProTarget, (v) => money(v, 2))} — currently ${f(x.cppUnder, (v) => money(v, 2))} under on average per PRO.`,
        isNum(s.f27SavingsTarget)
          ? `F27 take-out: ${money(s.f27SavingsTarget)} target − ${f(identified, money, '$0')} identified = ${money(gap)} still to find ≈ ${money(gapPerMonth)} per month over the ${monthsLeft} months left (Oct–Jun).`
          : `F27 take-out target: TBC — gap = target − ${f(identified, money, '$0')} identified, spread over the ${monthsLeft} months left (Oct–Jun). Enter the target in Edit data and this line calculates itself.`,
      ],
      calc: true,
    },
    {
      q: 'What is your spend rate?',
      a: [
        `Dock labour ${f(s.f27TotalCost, money)} September MTD over ${f(s.wdMtd, num)} working days ≈ ${f(perWd, money)} per working day.`,
        `Projected September ≈ ${f(projSept, kMoney)} vs ${f(s.f26TotalCost, kMoney)} F26 September (${f(projVsF26, (v) => pct(v, 0))}).`,
        `Cost per dock hour ${f(p.f27.hourlyRate, (v) => money(v, 2))} (${x.rateVsLy ? signed(x.rateVsLy.pct, (v) => pct(v)) : '—'} YoY — wage rate); cost per unit ${f(x.cpu27, (v) => money(v, 2))} vs ${f(x.cpu26, (v) => money(v, 2))}.`,
      ],
      calc: true,
    },
    {
      q: 'How much agency labour are you using?',
      a: [
        `Agency is ${f(agencyHrsShare27, (v) => pct(v))} of dock hours (${f(s.f27AgencyHours, num)} of ${f(s.f27Hours, num)}) vs ${f(agencyHrsShare26, (v) => pct(v))} in F26 September.`,
        `Agency cost ${f(s.f27AgencyCost, money)} = ${f(agencyCostShare27, (v) => pct(v, 0))} of dock labour vs ${f(agencyCostShare26, (v) => pct(v, 0))} in F26 September.`,
      ],
      calc: true,
    },
    {
      q: 'What about overtime?',
      a: [
        `September: ${f(p.f27.otHours, num)} OT hours (${f(p.f27.otPct, (v) => pct(v))} of dock hours).`,
        `Q1 company employees: ${f(lab.f27.otHours, (v) => num(v, 1))} OT hours, ${f(lab.f27.otPct, (v) => pct(v))} of hours (F26 Q1 ${f(lab.f26.otHours, (v) => num(v, 1))}).`,
      ],
    },
    {
      q: 'Why is PPH below goal?',
      a: [
        `PPH ${f(p.f27.pph, num)} vs ${f(p.f27.pphGoal, num)} goal (${x.pphVsGoal ? pct(x.pphVsGoal.pct) : '—'}); flat vs F26 (${f(p.f26.pph, num)}).`,
        `Freight got lighter — ${f(p.f27.lbsPerUnit, num)} vs ≈${f(x.lbsPerUnitF26, num)} lbs per unit — while units per hour rose ${x.uphVsLy ? pct(x.uphVsLy.pct) : '—'}.`,
        'Levers: load factor (Toyota baseload footage capture being fixed), consolidation on light lanes, shift start/end aligned to P&D.',
      ],
    },
    {
      q: 'Why are Terminal Admin hours up?',
      a: [
        `Q1 admin hours ${f(lab.f26.adminHours, num)} → ${f(lab.f27.adminHours, num)}; admin cost ${f(lab.f26.adminRegCost, money)} → ${f(lab.f27.adminRegCost, money)}.`,
        'F26 was the unusually low year — F27 is still below F24 (≈$21.5K) and F25 (≈$22.7K) for the same quarter.',
      ],
    },
    {
      q: 'How is service?',
      a: [
        `Adjusted on-time ${latest ? pct(latest.incl) : '—'} in ${latest ? latest.label : '—'} (${latest ? pct(latest.excl) : '—'} excluding partner carriers) vs ${f(o.target, (v) => pct(v, 0))} target; last 7 days ${f(o.last7Pct, (v) => pct(v, 2))}.`,
        `Missed pickups ${f(d.missedPu.missedPct, (v) => pct(v, 2))} overall, ${f(d.missedPu.last7Pct, (v) => pct(v, 2))} last 7 days — 45% are OPS false positives (close-out fix).`,
      ],
    },
    {
      q: 'What safety initiatives are in place — active vs completed?',
      a: [
        `Completed: ${d.safety.initiatives.filter((i) => i.status === 'Completed').map((i) => i.name.split(' — ')[0]).join('; ')}.`,
        `Active every shift: ${d.safety.initiatives.filter((i) => i.status === 'Active').map((i) => i.name.split(' — ')[0].split(';')[0]).join('; ')}.`,
        ...d.safety.initiatives.filter((i) => i.status === 'Planned').map((i) => `Planned: ${i.name}. ${i.note || ''}`),
      ],
    },
    {
      q: 'What safety ideas can you action at the terminal?',
      a: d.safety.ideas,
    },
    {
      q: 'How is safety?',
      a: [
        `Zero recordable incidents in F27 to date — TRIR ${f(d.safety.trirF27Ytd, (v) => num(v, 2))} vs ${f(d.safety.trirF26, (v) => num(v, 2))} in F26.`,
        `${f(x.daysSinceRecordable, num)} days since the last recordable (Sep 10, 2025).`,
      ],
    },
    {
      q: 'What about the building?',
      a: [d.terminal.relocation, d.terminal.relocationNote].filter(Boolean),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Backup"
        icon={ClipboardCheck}
        title="Q&A — likely questions"
        subtitle="Answers pulled from the same numbers as the dashboard. Click a question to open it."
      />
      <div className="space-y-3">
        {qa.map((item, i) => (
          <details key={item.q} open={i < 2} className="rounded-xl bg-white shadow-lg">
            <summary className="cursor-pointer select-none px-6 py-4 text-lg font-semibold text-gray-800">{item.q}</summary>
            <ul className="space-y-2 px-6 pb-5">
              {item.a.map((line, j) => (
                <li key={j} className="flex gap-3 text-gray-700">
                  <ChevronRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                  <span>{line}</span>
                </li>
              ))}
              {item.calc && <li className="pl-8 text-xs italic text-gray-500">Some figures calculated from the SCA and productivity reports.</li>}
            </ul>
          </details>
        ))}
      </div>
    </>
  );
};

// --- F27 Initiatives — tracked like the F26 cost transformation page ----------
const STATUS_STYLE = {
  Confirmed: { card: 'border-green-200 bg-gradient-to-r from-green-50 to-green-100', chip: 'green', color: '#059669' },
  'In progress': { card: 'border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100', chip: 'blue', color: '#2563eb' },
  Planned: { card: 'border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100', chip: 'amber', color: '#d97706' },
  Opportunity: { card: 'border-gray-200 bg-gray-50', chip: 'gray', color: '#6b7280' },
};
const PIE_COLORS = ['#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#6366f1'];

const DEPT_COLORS = { admin: '#7c3aed', dock: '#06b6d4', pd: '#f59e0b' };

const SpendTab = ({ d }) => {
  const s = d.spend;
  const rows = s.months.map((m) => {
    const cwtBase = m.lbs / 100;
    return {
      ...m,
      cpp: m.total / m.pros,
      cwt: m.total / cwtBase,
      adminK: m.admin / 1000,
      dockK: m.dock / 1000,
      pdK: m.pd / 1000,
      lbsM: m.lbs / 1e6,
    };
  });
  const f27 = rows.filter((r) => r.fy === 'F27');
  const ly = f27.map((r) => rows.find((q) => q.fy === 'F26' && q.label.slice(0, 3) === r.label.slice(0, 3))).filter(Boolean);
  const agg = (list) => {
    const t = (k) => sum(list.map((r) => r[k]));
    return { admin: t('admin'), dock: t('dock'), pd: t('pd'), total: t('total'), pros: t('pros'), lbs: t('lbs') };
  };
  const a27 = agg(f27);
  const a26 = agg(ly);
  const chg = (a, b) => (b ? ((a - b) / b) * 100 : null);
  const perPro = (a, k) => a[k] / a.pros;
  const perCwt = (a, k) => a[k] / (a.lbs / 100);
  const period = `${f27.map((r) => r.label.slice(0, 3)).join('–')}`;
  const firstF27 = f27.length ? f27[0].label : null;
  const lastLabel = rows[rows.length - 1].label;

  // Cost % of revenue: F25 history + months where the revenue allocation is still valid
  const validIdx = rows.findIndex((r) => r.label === s.revenueValidThrough);
  const ratioRows = [
    ...s.priorRatio.map((r) => ({ label: r.label, ratio: r.ratio })),
    ...rows.map((r, i) => ({ label: r.label, ratio: i <= validIdx && r.revenue > 0 ? (r.total / r.revenue) * 100 : null })),
  ];
  const firstInvalid = rows[validIdx + 1] ? rows[validIdx + 1].label : null;
  const validF26 = rows.filter((r, i) => i <= validIdx && r.fy === 'F26');
  const validF26Ratio = sum(validF26.map((r) => (r.total / r.revenue) * 100)) / validF26.length;
  const f25Ratio = s.priorRatio.slice(0, validF26.length);
  const f25SameMonths = sum(f25Ratio.map((r) => r.ratio)) / f25Ratio.length;

  const depts = [
    { k: 'admin', name: 'Terminal Admin (incl. claims)' },
    { k: 'dock', name: 'Dock' },
    { k: 'pd', name: 'P&D (incl. fuel subsidy)' },
    { k: 'total', name: 'Total terminal', bold: true },
  ];
  const drivers = s.drivers.map((r) => ({ ...r, delta: r.f27 - r.f26 })).sort((p, q) => p.delta - q.delta);
  const terminalNet = sum(drivers.filter((r) => r.type === 'Terminal').map((r) => r.delta));
  const maxAbs = Math.max(...drivers.map((r) => Math.abs(r.delta)));
  const TYPE_TONE = { Terminal: 'purple', 'P&D mix': 'amber', Fixed: 'gray' };
  const cellTone = (v) => (v <= 0 ? 'text-green-700' : 'text-red-600');

  return (
    <>
      <PageHeader
        eyebrow="Terminal P&L · Past to now"
        title="Cost & Volume"
        icon={BarChart3}
        subtitle={`Terminal cost tracked against freight bills (PROs) and weight, ${rows[0].label.replace(' ', ' 20')} → ${lastLabel.replace(' ', ' 20')}. F27 started July; ${period} compared with the same months last year.`}
      />

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={DollarSign} tone="purple" label={`Total terminal cost · F27 ${period}`} value={kMoney(a27.total)}
          sub={`vs ${kMoney(a26.total)} same months F26`}
          footer={<Delta d={{ abs: a27.total - a26.total, pct: chg(a27.total, a26.total) }} goodWhen="down" fmtAbs={kMoney} />} />
        <Kpi icon={Package} tone="blue" label="Freight bills (PROs in + out)" value={num(a27.pros)}
          sub={`vs ${num(a26.pros)} · weight ${(a27.lbs / 1e6).toFixed(1)}M vs ${(a26.lbs / 1e6).toFixed(1)}M lbs`}
          footer={<Delta d={{ abs: a27.pros - a26.pros, pct: chg(a27.pros, a26.pros) }} goodWhen="up" fmtAbs={num} />} />
        <Kpi icon={Target} tone="green" label="Total terminal cost per PRO (P&L)" value={money(perPro(a27, 'total'), 2)}
          sub={`vs ${money(perPro(a26, 'total'), 2)} · most of the drop is P&D driver mix (see below)`}
          footer={<Delta d={{ abs: perPro(a27, 'total') - perPro(a26, 'total'), pct: chg(perPro(a27, 'total'), perPro(a26, 'total')) }} goodWhen="down" fmtAbs={(v) => money(v, 2)} />} />
        <Kpi icon={Gauge} tone="amber" label="Total terminal cost per CWT (P&L)" value={money(perCwt(a27, 'total'), 2)}
          sub={`vs ${money(perCwt(a26, 'total'), 2)} · per 100 lbs handled`}
          footer={<Delta d={{ abs: perCwt(a27, 'total') - perCwt(a26, 'total'), pct: chg(perCwt(a27, 'total'), perCwt(a26, 'total')) }} goodWhen="down" fmtAbs={(v) => money(v, 2)} />} />
      </div>

      <Card title="Monthly terminal cost and total cost per PRO" subtitle={`${rows[0].label} → ${lastLabel} · bars = cost ($K) · line = total cost per PRO`} icon={BarChart3} className="mb-8">
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={rows} margin={{ top: 24, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            {firstF27 && <ReferenceArea yAxisId="k" x1={firstF27} x2={lastLabel} fill="#7c3aed" fillOpacity={0.07} label={{ value: 'F27', position: 'insideTop', fill: '#7c3aed', fontSize: 12, fontWeight: 700 }} />}
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="k" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}K`} />
            <YAxis yAxisId="p" orientation="right" domain={[20, 50]} tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => (n === 'Total cost per PRO (P&L)' ? money(v, 2) : `$${num(v, 1)}K`)} />
            <Legend />
            <Bar yAxisId="k" dataKey="adminK" name="Terminal Admin" stackId="c" fill={DEPT_COLORS.admin} />
            <Bar yAxisId="k" dataKey="dockK" name="Dock" stackId="c" fill={DEPT_COLORS.dock} />
            <Bar yAxisId="k" dataKey="pdK" name="P&D" stackId="c" fill={DEPT_COLORS.pd} radius={[3, 3, 0, 0]} />
            <Line yAxisId="p" type="monotone" dataKey="cpp" name="Total cost per PRO (P&L)" stroke="#111827" strokeWidth={3} dot={{ r: 4 }}>
              <LabelList dataKey="cpp" position="top" formatter={(v) => `$${v.toFixed(0)}`} style={{ fontSize: 10, fill: '#111827', fontWeight: 600 }} />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
        <p className="mt-2 text-sm text-gray-600">
          Cost per PRO peaked at {money(Math.max(...rows.map((r) => r.cpp)), 2)} ({rows.reduce((m, r) => (r.cpp > m.cpp ? r : m)).label}) and has run in the ${Math.min(...rows.slice(-6).map((r) => r.cpp)).toFixed(0)}–${Math.max(...rows.slice(-6).map((r) => r.cpp)).toFixed(0)} range for the last six months.
        </p>
      </Card>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card title="Volume — PROs and weight" subtitle="Bars = PROs in + out · line = LTL PRO weight (M lbs)" icon={Package}>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={rows} margin={{ top: 20, right: 0, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              {firstF27 && <ReferenceArea yAxisId="n" x1={firstF27} x2={lastLabel} fill="#7c3aed" fillOpacity={0.07} />}
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="n" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v / 1000}K`} />
              <YAxis yAxisId="w" orientation="right" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}M`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => (n === 'PROs' ? num(v) : `${num(v, 2)}M lbs`)} />
              <Legend />
              <Bar yAxisId="n" dataKey="pros" name="PROs" fill="#93c5fd" radius={[3, 3, 0, 0]} />
              <Line yAxisId="w" type="monotone" dataKey="lbsM" name="LTL weight" stroke="#1d4ed8" strokeWidth={3} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
          <Source>Weight excludes the transfer weight credits added from Mar 2026, so months compare like-for-like.</Source>
        </Card>

        <Card title="P&L cost per PRO by department" subtitle={`F27 ${period} vs same months F26`} icon={Target}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 text-left text-gray-500">
                  <th className="py-2 pr-2 font-semibold" />
                  <th className="py-2 pr-2 text-right font-semibold">Cost F26 → F27</th>
                  <th className="py-2 text-right font-semibold">Cost per PRO</th>
                </tr>
              </thead>
              <tbody>
                {depts.map((r) => {
                  const c = chg(a27[r.k], a26[r.k]);
                  const pp = chg(perPro(a27, r.k), perPro(a26, r.k));
                  return (
                    <tr key={r.k} className={`border-b border-gray-100 ${r.bold ? 'bg-gray-50 font-semibold' : ''}`}>
                      <td className="py-2 pr-2 text-gray-800">
                        {!r.bold && <span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm" style={{ background: DEPT_COLORS[r.k] }} />}
                        {r.name}
                      </td>
                      <td className="py-2 pr-2 text-right">
                        {kMoney(a26[r.k])} → {kMoney(a27[r.k])}
                        <div className={`text-xs font-semibold ${cellTone(c)}`}>{signed(c, (v) => pct(v))}</div>
                      </td>
                      <td className="py-2 text-right">
                        {money(perPro(a26, r.k), 2)} → {money(perPro(a27, r.k), 2)}
                        <div className={`text-xs font-semibold ${cellTone(pp)}`}>{signed(pp, (v) => pct(v))}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Source>PROs = PRO count in + out. Calculated from the Terminal Analysis.</Source>
        </Card>
      </div>

      <Card title="What moved — largest line changes" subtitle={`F27 ${period} vs same months F26 · green = lower cost`} icon={Activity} className="mb-8">
        <div className="space-y-2">
          {drivers.map((r) => (
            <div key={r.line} className="grid grid-cols-12 items-center gap-3 text-sm">
              <div className="col-span-12 flex items-center gap-2 md:col-span-4">
                <Chip tone={TYPE_TONE[r.type]}>{r.type}</Chip>
                <span className="text-gray-800">{r.line}</span>
              </div>
              <div className="col-span-8 md:col-span-6">
                <div className="flex h-5 w-full">
                  <div className="flex w-1/2 justify-end">
                    {r.delta < 0 && <div className="h-5 rounded-l bg-green-500" style={{ width: `${(Math.abs(r.delta) / maxAbs) * 100}%`, minWidth: 3 }} />}
                  </div>
                  <div className="w-px bg-gray-400" />
                  <div className="flex w-1/2">
                    {r.delta > 0 && <div className="h-5 rounded-r bg-red-400" style={{ width: `${(r.delta / maxAbs) * 100}%`, minWidth: 3 }} />}
                  </div>
                </div>
              </div>
              <div className={`col-span-4 text-right font-semibold md:col-span-2 ${cellTone(r.delta)}`}>{signed(r.delta, kMoney)}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-purple-50 p-4 text-sm text-purple-900">
            <p className="font-semibold">Terminal-controlled lines: net {signed(terminalNet, kMoney)} in two months (P&L variance, not booked savings)</p>
            <p className="mt-1">Agency labour down in Admin and on the dock, repairs and rentals down ahead of the building move, dock owner-operator cost gone. Offsets: cargo claims and company wages.</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">P&D mix — not claimed as terminal savings</p>
            <p className="mt-1">Agent drivers were replaced by owner operators (agent cost down, owner-operator base and accessorials up) and the fuel subsidy dropped. It lowers the P&L, but it is a network P&D change.</p>
          </div>
        </div>
        <Source>Source: net-amount pivot by department and Terminal Analysis, Aug 2026. Largest terminal lines shown; repairs include yard repairs. Cargo claims here are P&L (Aug $13,869); the claims report shows $13,432.53 for August.</Source>
      </Card>

      <Card title="Cost % of revenue — valid through Feb 2026" subtitle={`The F26 dashboard's cost-to-revenue model, carried forward · ${ratioRows[0].label} → ${lastLabel}`} icon={TrendingDown} className="mb-8">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ratioRows} margin={{ top: 24, right: 20, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            {firstInvalid && (
              <ReferenceArea x1={firstInvalid} x2={lastLabel} fill="#9ca3af" fillOpacity={0.18}
                label={{ value: 'Revenue not valid after Feb 26', position: 'insideTop', fill: '#4b5563', fontSize: 12, fontWeight: 600 }} />
            )}
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={50} />
            <YAxis domain={[40, 80]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => (isNum(v) ? pct(v) : 'not valid')} />
            <Line type="monotone" dataKey="ratio" name="Cost % of revenue" stroke="#7c3aed" strokeWidth={3} dot={{ r: 3 }} connectNulls={false}>
              <LabelList dataKey="ratio" position="top" formatter={(v) => (isNum(v) ? v.toFixed(0) : '')} style={{ fontSize: 9, fill: '#6d28d9' }} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
          <p className="text-sm text-gray-600">
            Last valid comparison: F26 {validF26[0].label}–{validF26[validF26.length - 1].label} ran at <span className="font-semibold">{pct(validF26Ratio)}</span> vs {pct(f25SameMonths)} for the same months of F25 (simple monthly averages).
          </p>
          <p className="text-sm text-gray-600">
            From {firstInvalid} the terminal is credited almost no revenue (between −$5K and $36K a month vs $1.6–3.0M before), so the ratio reads in the thousands of percent. Until that is fixed, cost is tracked per PRO and per CWT above.
          </p>
        </div>
        <Source>F25 months from the F26 cost-transformation dashboard; F26 months calculated from the Terminal Analysis (total terminal cost ÷ gross revenue).</Source>
      </Card>
    </>
  );
};

const InitiativesTab = ({ d, x }) => {
  const items = d.initiatives.filter((i) => i.name);
  const target = d.sca.f27SavingsTarget;
  const identified = sum(items.map((i) => i.annual));
  const realized = sum(items.map((i) => i.ytd));
  const hasIdentified = items.some((i) => isNum(i.annual));
  const pctOfTarget = hasIdentified && isNum(target) && target > 0 ? (identified / target) * 100 : null;
  const gap = isNum(target) ? target - identified : null;
  const monthsLeft = 9;
  const pieData = items.filter((i) => isNum(i.annual) && i.annual > 0).map((i) => ({ name: i.name, value: i.annual }));
  const counts = Object.keys(STATUS_STYLE).map((k) => ({ k, n: items.filter((i) => i.status === k).length })).filter((c) => c.n);

  return (
    <>
      <div className="mb-8 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 p-8 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-purple-200">F27 Cost Reduction Strategy</p>
        <h2 className="mt-1 text-3xl font-bold">F27 Savings Initiatives</h2>
        <p className="mt-2 text-lg opacity-95">
          {hasIdentified ? <><span className="font-bold text-yellow-300">{money(identified)}</span> identified per year so far</> : 'Initiatives identified'}
          {isNum(target) ? <> against a <span className="font-bold">{money(target)}</span> take-out target ({pct(pctOfTarget, 0)}).</> : '. F27 take-out target: TBC.'}
          {' '}{items.length} initiatives tracked — {counts.map((c) => `${c.n} ${c.k.toLowerCase()}`).join(' · ')}.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Target} tone="purple" label="F27 take-out target" value={<V v={target} fmt={money} />} sub="To be confirmed" />
        <Kpi icon={CheckCircle} tone="green" label="Identified (annual)" value={hasIdentified ? money(identified) : <Tbc />} footer={isNum(pctOfTarget) && <Chip tone={pctOfTarget >= 100 ? 'green' : 'amber'}>{pct(pctOfTarget, 0)} of target</Chip>} />
        <Kpi icon={TrendingDown} tone="amber" label="Still to identify" value={<V v={gap} fmt={money} />} sub={isNum(gap) ? `≈${money(gap / monthsLeft)} per month over ${monthsLeft} months (Oct–Jun)` : 'Needs the take-out target'} />
        <Kpi icon={Activity} tone="blue" label="Initiatives being sized" value={num(items.filter((i) => !isNum(i.annual)).length)} sub={items.some((i) => isNum(i.ytd)) ? `Realized YTD ${money(realized)}` : "$ values added as each one firms up"} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
        <Card title={pieData.length < 2 ? "Initiatives by status" : "Savings breakdown"} subtitle={pieData.length < 2 ? `${items.length} tracked; $ values added as they firm up` : "Initiatives with an annual $ value"} icon={BarChart3} className="lg:col-span-2">
          {pieData.length < 2 ? (
            <div className="space-y-3">
              {counts.map((c) => (
                <div key={c.k} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <Chip tone={(STATUS_STYLE[c.k] || STATUS_STYLE.Opportunity).chip}>{c.k}</Chip>
                  <span className="text-2xl font-bold text-gray-800">{c.n}</span>
                </div>
              ))}
              <p className="text-sm text-gray-700">
                {pieData.length === 1 ? <><span className="font-semibold">{money(pieData[0].value)}</span> confirmed — {pieData[0].name.toLowerCase()}.</> : 'No $ values confirmed yet.'}
              </p>
            </div>
          ) : pieData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((e, i) => <Cell key={e.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => money(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart height={260} label="Add annual $ values to initiatives" />
          )}
          {pieData.length >= 2 && <p className="mt-2 text-xs text-gray-500">Only initiatives with a confirmed annual $ value are in the chart.</p>}
        </Card>
        <Card title="September run-rate indicators" subtitle="From the SCA and productivity reports — indicators, not booked savings" icon={Award} className="lg:col-span-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-xs text-gray-600">Hours under SCA allowance</p>
              <p className="text-2xl font-bold text-green-700">{isNum(x.hoursUnder) ? `${num(x.hoursUnder)} hrs` : <Tbc small />}</p>
              <p className="text-xs text-gray-600">{isNum(x.hoursUnderValue) ? `≈${money(x.hoursUnderValue)} MTD` : ''}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-xs text-gray-600">Cost per unit vs F26</p>
              <p className="text-2xl font-bold text-green-700">{x.cpuVsLy ? pct(x.cpuVsLy.pct) : <Tbc small />}</p>
              <p className="text-xs text-gray-600">{isNum(x.cpuSavings) ? `≈${money(x.cpuSavings)} avoided MTD` : ''}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-xs text-gray-600">Agency share of dock hours</p>
              <p className="text-2xl font-bold text-green-700">{allNum(d.sca.f27AgencyHours, d.sca.f27Hours) ? pct((d.sca.f27AgencyHours / d.sca.f27Hours) * 100) : <Tbc small />}</p>
              <p className="text-xs text-gray-600">{allNum(d.sca.f26AgencyHours, d.sca.f26Hours) ? `vs ${pct((d.sca.f26AgencyHours / d.sca.f26Hours) * 100)} in F26 Sept` : ''}</p>
            </div>
          </div>
          <Source>Calculated from the SCA hours, cost-per-PRO and productivity reports (September MTD to Sep 26). Evidence of run-rate — not yet booked as initiative savings.</Source>
        </Card>
      </div>

      <Card title="Cost reduction initiatives" subtitle="Status, value and share of identified savings" icon={Target}>
        <div className="space-y-4">
          {items.map((i) => {
            const st = STATUS_STYLE[i.status] || STATUS_STYLE.Opportunity;
            return (
              <div key={i.name} className={`rounded-xl border-2 p-6 transition-all hover:shadow-lg ${st.card}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{i.category}</p>
                    <h3 className="mb-1 text-lg font-bold text-gray-800">{i.name}</h3>
                    <p className="mb-2 font-medium text-gray-700">{i.description}</p>
                    <p className="text-sm text-gray-600">{i.detail}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {isNum(i.annual) ? (
                      <>
                        <p className="text-3xl font-bold text-gray-800">{money(i.annual)}</p>
                        <p className="mt-1 text-sm text-gray-600">per year{identified > 0 ? ` · ${pct((i.annual / identified) * 100, 0)} of identified` : ''}</p>
                      </>
                    ) : (
                      <p className="text-lg font-semibold text-gray-500">$ to be sized</p>
                    )}
                    {isNum(i.ytd) && <p className="mt-1 text-xs text-gray-500">Realized YTD {money(i.ytd)}</p>}
                    <span className="mt-3 inline-block"><Chip tone={st.chip}>{i.status}</Chip></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold opacity-90">Total F27 identified</p>
              <p className="mt-1 text-sm opacity-70">{isNum(target) ? `Target ${money(target)}` : 'Target TBC'}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{hasIdentified ? money(identified) : 'TBC'}</p>
              {isNum(pctOfTarget) && <p className="mt-1 text-sm opacity-90">{pct(pctOfTarget, 0)} of target</p>}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

// --- SCA & Savings ---------------------------------------------------------
const ScaTab = ({ d, x }) => {
  const s = d.sca;
  const hoursData = [
    { period: 'F26 Sept', Company: s.f26CompanyHours, Agency: s.f26AgencyHours },
    { period: 'F27 Sept MTD', Company: s.f27CompanyHours, Agency: s.f27AgencyHours },
  ];
  const hoursReady = allNum(s.f26CompanyHours, s.f26AgencyHours, s.f27CompanyHours, s.f27AgencyHours);
  const labourData = [
    { period: 'F26 Sept', Company: s.f26CompanyCost, Agency: s.f26AgencyCost },
    { period: 'F27 Sept MTD', Company: s.f27CompanyCost, Agency: s.f27AgencyCost },
  ];
  const labourReady = allNum(s.f26CompanyCost, s.f26AgencyCost, s.f27CompanyCost, s.f27AgencyCost);
  const cppLabel = { green: 'On target', amber: 'Under target — watch', red: 'Over target', gray: '' }[x.cppTone];
  const periodNote = `F26 = full September 2025 · F27 = September MTD (${isNum(s.wdMtd) ? s.wdMtd : '—'} of ${isNum(s.wdMonth) ? s.wdMonth : '—'} working days)`;

  return (
    <>
      <PageHeader
        eyebrow="3 · SCA"
        icon={DollarSign}
        title="SCA — Hours, Cost per PRO & F27 Take-Out"
        subtitle={`Current status against the SCA targets and progress toward the F27 cost take-out target (target TBC). Mississauga · updated for ${s.updatedFor}.`}
        right={
          isNum(x.wdPctUsed) && (
            <div className="text-right">
              <p className="text-sm uppercase tracking-wider opacity-70">SCA hour allowance used</p>
              <p className={`text-4xl font-bold ${x.wdPctUsed <= 100 ? 'text-green-400' : 'text-red-400'}`}>{pct(x.wdPctUsed)}</p>
              <p className="text-sm opacity-70">{s.period} · working-day basis</p>
            </div>
          )
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card title="Dock hours vs SCA allowance" subtitle={`${s.period} · ${isNum(s.wdMtd) ? s.wdMtd : '—'} of ${isNum(s.wdMonth) ? s.wdMonth : '—'} working days`} icon={Clock}>
          <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
            <p className="text-6xl font-bold text-gray-900"><V v={s.f27Hours} fmt={num} /></p>
            <p className="pb-2 text-gray-600">
              hrs used of <span className="font-semibold"><V v={s.wdAllowable} fmt={num} small /></span> allowed
            </p>
          </div>
          {isNum(x.wdPctUsed) && (
            <div className="mt-4">
              <div className="h-4 overflow-hidden rounded-full bg-gray-100">
                <div className={`h-full rounded-full ${x.wdPctUsed <= 100 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, x.wdPctUsed)}%` }} />
              </div>
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>{pct(x.wdPctUsed)} of allowance used</span>
                <span>Target {isNum(s.wdTargetPerDay) ? `${num(s.wdTargetPerDay)} hrs/day` : 'TBC'}</span>
              </div>
            </div>
          )}
          {isNum(x.hoursUnder) && (
            <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold ${x.hoursUnder >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <CheckCircle className="h-5 w-5" />
              {num(Math.abs(x.hoursUnder))} hrs {x.hoursUnder >= 0 ? 'under' : 'over'} allowance
              {isNum(x.hoursUnderValue) && ` · ≈${money(Math.abs(x.hoursUnderValue))}`}
            </div>
          )}
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
            <div>
              <p className="text-xs text-gray-500">Month SCA target</p>
              <p className="font-bold text-gray-800"><V v={s.scaTargetHours} fmt={(v) => `${num(v)} hrs`} small /></p>
              <p className="text-xs text-gray-500">F26 {isNum(s.f26Hours) ? num(s.f26Hours) : '—'} − {isNum(s.hourReductionTarget) ? num(s.hourReductionTarget) : '—'} reduction</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Used of month target</p>
              <p className="font-bold text-gray-800"><V v={x.monthPctUsed} fmt={(v) => pct(v)} small /></p>
              <p className="text-xs text-gray-500">{isNum(x.wdElapsedPct) ? `${pct(x.wdElapsedPct)} of working days gone` : ''}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Calendar-day view</p>
              <p className="font-bold text-gray-800"><V v={x.cdPctUsed} fmt={(v) => pct(v)} small /></p>
              <p className="text-xs text-gray-500">of {isNum(s.cdAllowable) ? num(s.cdAllowable) : '—'} hrs allowed</p>
            </div>
          </div>
          {isNum(x.paceVsReductionTarget) && (
            <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-900">
              <span className="font-semibold">On pace:</span> ≈{num(x.paceHours)} hrs for September vs {num(s.scaTargetHours)} target — a ≈{num(x.paceReduction)}-hr reduction vs F26,{' '}
              <span className="font-semibold">{pct(x.paceVsReductionTarget, 0)} of the {num(s.hourReductionTarget)}-hr reduction target</span> (at current pace).
            </div>
          )}
        </Card>

        <Card title="SCA dock cost per PRO" subtitle={`National SCA Cost-per-PRO report · ${s.updatedFor}`} icon={Target}>
          <div className="text-center">
            <p className="text-6xl font-bold text-gray-900"><V v={s.costPerProMtd} fmt={(v) => money(v, 2)} /></p>
            <p className="mt-2 text-gray-600">
              MTD vs target <span className="font-semibold"><V v={s.costPerProTarget} fmt={(v) => money(v, 2)} small /></span>
            </p>
            {isNum(x.cppPctOfTarget) && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Chip tone={x.cppTone}>{pct(x.cppPctOfTarget)} of target</Chip>
                <Chip tone={x.cppTone}>{cppLabel}</Chip>
              </div>
            )}
            {isNum(x.cppUnder) && (
              <p className="mt-3 text-sm text-gray-600">
                {money(Math.abs(x.cppUnder), 2)} {x.cppUnder >= 0 ? 'under' : 'over'} target on average per PRO
                {isNum(x.cppBelowTargetValue) && ` · ≈${money(Math.abs(x.cppBelowTargetValue))} MTD`}
              </p>
            )}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 text-center">
            <div>
              <p className="text-xs text-gray-500">FB count MTD</p>
              <p className="font-bold text-gray-800"><V v={s.fbCountMtd} fmt={num} small /></p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Monthly dock S&B</p>
              <p className="font-bold text-gray-800"><V v={s.monthlyDockSb} fmt={money} small /></p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Prorated S&B MTD</p>
              <p className="font-bold text-gray-800"><V v={s.proratedSbMtd} fmt={money} small /></p>
            </div>
          </div>
          <Source>Status bands in the report: ≤95% green · 95–100% amber · over 100% red. FB count = IN + OUT, calendar MTD.</Source>
        </Card>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card title="Dock hours — F26 vs F27" subtitle="Company vs agency hours" icon={Users}>
          {hoursReady ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hoursData} layout="vertical" margin={{ top: 10, right: 30, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => num(v)} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="period" tick={{ fontSize: 12, fontWeight: 600 }} width={100} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${num(v)} hrs`} />
                <Legend />
                <Bar dataKey="Company" stackId="a" fill="#7c3aed" />
                <Bar dataKey="Agency" stackId="a" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart height={220} />
          )}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Total hours', d: x.hoursDelta.total },
              { label: 'Agency hours', d: x.hoursDelta.agency },
              { label: 'Company hours', d: x.hoursDelta.company },
            ].map((r) => (
              <div key={r.label} className="rounded-lg bg-green-50 p-3">
                <p className="text-xs font-medium text-gray-600">{r.label}</p>
                <p className="text-xl font-bold text-gray-900">{r.d ? signed(r.d.abs, num) : <Tbc small />}</p>
                {r.d && <Delta d={r.d} goodWhen="down" />}
              </div>
            ))}
          </div>
          <Source>{periodNote}.</Source>
        </Card>

        <Card title="Dock labour cost — F26 vs F27" subtitle="Company vs agency wages" icon={DollarSign}>
          {labourReady ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={labourData} layout="vertical" margin={{ top: 10, right: 30, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="period" tick={{ fontSize: 12, fontWeight: 600 }} width={100} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => money(v)} />
                <Legend />
                <Bar dataKey="Company" stackId="a" fill="#7c3aed" />
                <Bar dataKey="Agency" stackId="a" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart height={220} />
          )}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Total cost', d: x.labour.total },
              { label: 'Agency cost', d: x.labour.agency },
              { label: 'Company cost', d: x.labour.company },
            ].map((r) => (
              <div key={r.label} className="rounded-lg bg-green-50 p-3">
                <p className="text-xs font-medium text-gray-600">{r.label}</p>
                <p className="text-xl font-bold text-gray-900">{r.d ? signed(r.d.abs, money) : <Tbc small />}</p>
                {r.d && <Delta d={r.d} goodWhen="down" />}
              </div>
            ))}
          </div>
          <Source>{periodNote}. Rate view below removes the partial-month effect.</Source>
        </Card>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card title="Cost per unit — the like-for-like view" icon={Package}>
          <div className="flex items-end gap-3">
            <p className="text-5xl font-bold text-gray-900"><V v={x.cpu27} fmt={(v) => money(v, 2)} /></p>
            <p className="pb-1 text-gray-500">vs <V v={x.cpu26} fmt={(v) => money(v, 2)} small /> F26</p>
          </div>
          <div className="mt-2"><Delta d={x.cpuVsLy} goodWhen="down" /></div>
          {isNum(x.cpuSavings) && (
            <div className="mt-4 rounded-lg bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">Cost avoided vs F26 rate</p>
              <p className="text-3xl font-bold text-green-700">≈{money(x.cpuSavings)}</p>
              <p className="mt-1 text-xs text-gray-600">
                (F26 cost per unit − F27 cost per unit) × {num(d.productivity.f27.units)} F27 units, {d.productivity.period}.
              </p>
            </div>
          )}
        </Card>
        <Card title="Workforce mix — agency vs D&R" subtitle="SCA hours report · dock hours" icon={Users}>
          {(() => {
            const mix = [
              { label: 'F26 Sept', agency: s.f26AgencyHours, dr: s.f26CompanyHours },
              { label: `F27 ${s.period}`, agency: s.f27AgencyHours, dr: s.f27CompanyHours },
            ];
            return (
              <div className="space-y-3">
                {mix.map((m) => {
                  const ok = allNum(m.agency, m.dr) && m.agency + m.dr > 0;
                  const share = ok ? (m.agency / (m.agency + m.dr)) * 100 : null;
                  return (
                    <div key={m.label}>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span className="font-semibold">{m.label}</span>
                        <span>{ok ? `${pct(share, 1)} agency · ${num(m.agency / m.dr, 2)} agency hrs per D&R hr` : 'TBC'}</span>
                      </div>
                      <div className="mt-1 flex h-3 overflow-hidden rounded-full bg-gray-100">
                        {ok && <div className="bg-cyan-500" style={{ width: `${share}%` }} />}
                        {ok && <div className="bg-purple-600" style={{ width: `${100 - share}%` }} />}
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-gray-500"><span className="text-cyan-600">■</span> Agency <span className="ml-2 text-purple-600">■</span> D&R · ratios calculated from the SCA hours report.</p>
              </div>
            );
          })()}
          {!s.workforce.some((w) => isNum(w.drDock) || isNum(w.agencyDock)) ? (
            <p className="mt-4 text-xs text-gray-500">Per-shift headcount (dock + admin) to follow.</p>
          ) : (
          <>
          <p className="mb-2 mt-4 text-sm font-semibold text-gray-700">Per shift — headcount (dock + admin)</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-1 pr-2 font-semibold">Shift</th>
                <th className="py-1 pr-2 text-right font-semibold">D&R</th>
                <th className="py-1 pr-2 text-right font-semibold">Agency</th>
                <th className="py-1 text-right font-semibold">Agency : D&R</th>
              </tr>
            </thead>
            <tbody>
              {s.workforce.map((w) => {
                const dr = allNum(w.drDock) ? w.drDock + (w.drAdmin || 0) : null;
                const ag = allNum(w.agencyDock) ? w.agencyDock + (w.agencyAdmin || 0) : null;
                return (
                  <tr key={w.shift} className="border-b border-gray-100">
                    <td className="py-1.5 pr-2 font-medium text-gray-700">{w.shift}</td>
                    <td className="py-1.5 pr-2 text-right"><V v={dr} fmt={num} small /></td>
                    <td className="py-1.5 pr-2 text-right"><V v={ag} fmt={num} small /></td>
                    <td className="py-1.5 text-right font-semibold">{allNum(dr, ag) && dr > 0 ? `${num(ag / dr, 2)} : 1` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </>
          )}
        </Card>
        <Card title="How we are taking cost out" icon={Zap}>
          <Bullets items={s.actions} icon={ChevronRight} color="text-purple-600" />
        </Card>
      </div>

      <LabourCard l={d.labour} />
      <AccessorialCard a={d.accessorials} />
      <ReweighCard r={d.reweighs} />

    </>
  );
};

// --- Productivity ----------------------------------------------------------
const ProductivityTab = ({ d, x }) => {
  const P = d.productivity;
  const p27 = P.f27;
  const p26 = P.f26;
  const lf = d.loadFactor;
  const c = d.cico;
  const pphData = [
    { name: 'F26', value: p26.pph, fill: '#9ca3af' },
    { name: 'F27', value: p27.pph, fill: '#7c3aed' },
    { name: 'F27 goal', value: p27.pphGoal, fill: '#d1d5db' },
  ].filter((r) => isNum(r.value));
  const uphData = [
    { name: 'F26', value: p26.unitsPerHr, fill: '#9ca3af' },
    { name: 'F27', value: p27.unitsPerHr, fill: '#059669' },
  ].filter((r) => isNum(r.value));
  const cicoData = c.weeks.filter((w) => isNum(w.hoursSaved));
  const compareRows = [
    { label: 'Weight (lbs)', a: p27.weight, b: p26.weight, d: x.weightVsLy, fmt: num, good: 'up', note: 'F27 is MTD' },
    { label: 'Units', a: p27.units, b: p26.units, d: x.unitsVsLy, fmt: num, good: 'up', note: 'F27 is MTD' },
    { label: 'PPH (lbs / hr)', a: p27.pph, b: p26.pph, d: x.pphVsLy, fmt: num, good: 'up' },
    { label: 'Units per hour', a: p27.unitsPerHr, b: p26.unitsPerHr, d: x.uphVsLy, fmt: (v) => num(v, 2), good: 'up' },
    { label: 'Lbs per unit', a: p27.lbsPerUnit, b: x.lbsPerUnitF26, d: allNum(p27.lbsPerUnit, x.lbsPerUnitF26) ? { abs: p27.lbsPerUnit - x.lbsPerUnitF26, pct: ((p27.lbsPerUnit - x.lbsPerUnitF26) / x.lbsPerUnitF26) * 100 } : null, fmt: num, good: 'neutral', note: 'F26 = PPH ÷ units/hr' },
    { label: 'Cost per hour', a: p27.hourlyRate, b: p26.hourlyRate, d: x.rateVsLy, fmt: (v) => money(v, 2), good: 'down' },
    { label: 'Dock labour cost per CWT', a: p27.cwt, b: p26.cwt, d: x.cwtVsLy, fmt: (v) => money(v, 4), good: 'down' },
    { label: 'Dock labour cost per unit', a: x.cpu27, b: x.cpu26, d: x.cpuVsLy, fmt: (v) => money(v, 2), good: 'down' },
  ];

  return (
    <>
      <PageHeader
        eyebrow="4 · Productivity"
        icon={Gauge}
        title="PPH, Units per Hour, Load Factor & CICO"
        subtitle={`Terminal productivity dashboard · ${P.period} · updated for ${P.updatedFor}`}
        right={
          x.uphVsLy && (
            <div className="text-right">
              <p className="text-sm uppercase tracking-wider opacity-70">Units per hour vs F26</p>
              <p className="text-4xl font-bold text-green-400">{signed(x.uphVsLy.pct, (v) => pct(v))}</p>
              <p className="text-sm opacity-70">{num(p26.unitsPerHr, 2)} → {num(p27.unitsPerHr, 2)}</p>
            </div>
          )
        }
      />

      <div className="mb-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
        <Kpi
          icon={Gauge}
          tone="purple"
          label="PPH (lbs / dock hour)"
          value={<V v={p27.pph} fmt={num} />}
          sub={<>F26 <V v={p26.pph} fmt={num} small /> · goal <V v={p27.pphGoal} fmt={num} small /></>}
          footer={
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span>vs F26 <Delta d={x.pphVsLy} goodWhen="up" /></span>
              <span>vs goal <Delta d={x.pphVsGoal} goodWhen="up" /></span>
            </div>
          }
        />
        <Kpi
          icon={Package}
          tone="green"
          label="Units per hour"
          value={<V v={p27.unitsPerHr} fmt={(v) => num(v, 1)} />}
          sub={<>F26 <V v={p26.unitsPerHr} fmt={(v) => num(v, 2)} small /></>}
          footer={<Delta d={x.uphVsLy} goodWhen="up" fmtAbs={(v) => num(v, 1)} />}
        />
        <Kpi
          icon={DollarSign}
          tone="amber"
          label="Cost per dock hour"
          value={<V v={p27.hourlyRate} fmt={(v) => money(v, 2)} />}
          sub={<>F26 <V v={p26.hourlyRate} fmt={(v) => money(v, 2)} small /></>}
          footer={<Delta d={x.rateVsLy} goodWhen="down" fmtAbs={(v) => money(v, 2)} />}
        />
        <Kpi
          icon={Clock}
          tone="green"
          label="Overtime hours"
          value={<V v={p27.otHours} fmt={num} />}
          sub={<><V v={p27.otPct} fmt={(v) => pct(v)} small /> of {isNum(p27.hours) ? num(p27.hours) : '—'} dock hours</>}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card title="PPH — F26 vs F27 vs goal" subtitle={P.period} icon={BarChart3}>
          {pphData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pphData} margin={{ top: 24, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(1)}K`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => num(v)} />
                <Bar dataKey="value" name="PPH" radius={[4, 4, 0, 0]}>
                  {pphData.map((r) => <Cell key={r.name} fill={r.fill} />)}
                  <LabelList dataKey="value" position="top" formatter={(v) => num(v)} style={{ fontSize: 12, fill: '#374151', fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
          {x.pphVsGoal && (
            <p className="mt-2 text-sm text-gray-600">
              Gap to goal: <span className="font-semibold text-red-600">{signed(x.pphVsGoal.abs, num)} ({pct(x.pphVsGoal.pct)})</span> · the goal is weight-based and freight got lighter per unit
            </p>
          )}
        </Card>
        <Card title="Units per hour — F26 vs F27" subtitle={P.period} icon={Package}>
          {uphData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={uphData} margin={{ top: 24, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => num(v, 2)} />
                <Bar dataKey="value" name="Units / hr" radius={[4, 4, 0, 0]}>
                  {uphData.map((r) => <Cell key={r.name} fill={r.fill} />)}
                  <LabelList dataKey="value" position="top" formatter={(v) => num(v, 2)} style={{ fontSize: 12, fill: '#374151', fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
          {isNum(p27.lbsPerUnit) && isNum(x.lbsPerUnitF26) && (
            <p className="mt-2 text-sm text-gray-600">
              Freight got lighter — <span className="font-semibold">{num(x.lbsPerUnitF26)} → {num(p27.lbsPerUnit)} lbs per unit</span> — yet PPH held because the dock is moving more pieces every hour.
            </p>
          )}
        </Card>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
        <Card title="Cost & volume — F27 vs F26" subtitle={P.period} icon={Activity} className="lg:col-span-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 text-left text-gray-500">
                  <th className="py-2 pr-4 font-semibold">Metric</th>
                  <th className="py-2 pr-4 text-right font-semibold">F27</th>
                  <th className="py-2 pr-4 text-right font-semibold">F26</th>
                  <th className="py-2 text-right font-semibold">Change</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((r) => (
                  <tr key={r.label} className="border-b border-gray-100">
                    <td className="py-2.5 pr-4 font-medium text-gray-800">
                      {r.label}
                      {r.note && <span className="ml-2 text-xs font-normal text-gray-400">{r.note}</span>}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-semibold"><V v={r.a} fmt={r.fmt} small /></td>
                    <td className="py-2.5 pr-4 text-right text-gray-600"><V v={r.b} fmt={r.fmt} small /></td>
                    <td className="py-2.5 text-right">
                      {r.good === 'neutral' ? (r.d ? <span className="font-semibold text-gray-700">{signed(r.d.pct, (v) => pct(v))}</span> : '—') : <Delta d={r.d} goodWhen={r.good} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Dock hours', v: p27.hours, fmt: num },
              { label: 'Units', v: p27.units, fmt: num },
              { label: 'Costs', v: p27.costs, fmt: money },
              { label: 'Cost per unit', v: p27.cpu, fmt: (v) => money(v, 2) },
            ].map((t) => (
              <div key={t.label} className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">{t.label}</p>
                <p className="font-bold text-gray-900"><V v={t.v} fmt={t.fmt} small /></p>
              </div>
            ))}
          </div>
          <Source>Source: {d.meta.terminal} terminal productivity dashboard, updated for {P.updatedFor}. F27 September is month-to-date.</Source>
        </Card>
        <Card title="What it is worth" icon={DollarSign} className="lg:col-span-2">
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">Hours avoided — units basis</p>
              <p className="text-3xl font-bold text-green-700">
                {isNum(x.hoursAvoided) ? `≈${num(x.hoursAvoided)} hrs` : <Tbc />}
              </p>
              <p className="text-lg font-semibold text-green-700">{isNum(x.hoursAvoidedValue) ? `≈${money(x.hoursAvoidedValue)}` : ''}</p>
              <p className="mt-1 text-xs text-gray-600">
                At F26's {isNum(p26.unitsPerHr) ? num(p26.unitsPerHr, 2) : '—'} units/hr, {isNum(p27.units) ? num(p27.units) : '—'} units would have needed{' '}
                {isNum(x.hoursAtF26Rate) ? `≈${num(x.hoursAtF26Rate)}` : '—'} hrs vs {isNum(p27.hours) ? num(p27.hours) : '—'} actual, valued at{' '}
                {isNum(p27.hourlyRate) ? money(p27.hourlyRate, 2) : '—'}/hr.
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800">Still to close — PPH gap to goal</p>
              <p className="text-3xl font-bold text-amber-700">{x.pphVsGoal ? `${signed(x.pphVsGoal.abs, num)} lbs/hr` : <Tbc />}</p>
              <p className="mt-1 text-xs text-gray-600">
                {isNum(p27.pphGoal) && isNum(p27.weight) && isNum(p27.hours)
                  ? `At the ${num(p27.pphGoal)} PPH goal, ${num(p27.weight)} lbs needs ≈${num(p27.weight / p27.pphGoal)} hrs vs ${num(p27.hours)} used — ≈${num(p27.hours - p27.weight / p27.pphGoal)} hrs (≈${kMoney((p27.hours - p27.weight / p27.pphGoal) * (p27.hourlyRate || 0))}) left on the table this month.`
                  : 'Enter PPH goal, weight and hours.'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <PdCard p={d.pd} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <LoadFactorCard lf={lf} />
        <Card title="Load quality & securement" subtitle="Planned — decking and securement equipment" icon={Package}>
          <div className="grid grid-cols-2 gap-3">
            {[...d.loadQuality.good.map((g) => ({ ...g, ok: true })), ...d.loadQuality.poor.map((g) => ({ ...g, ok: false }))].map((ph) => (
              <figure key={ph.img} className="overflow-hidden rounded-lg border border-gray-200">
                <div className="relative">
                  <img src={ph.img} alt={ph.caption} className="h-44 w-full object-cover" loading="lazy" />
                  <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold text-white ${ph.ok ? 'bg-green-600' : 'bg-red-600'}`}>
                    {ph.ok ? 'Target' : 'Fix'}
                  </span>
                </div>
                <figcaption className="p-2 text-xs text-gray-600">{ph.caption}</figcaption>
              </figure>
            ))}
          </div>
          {d.loadQuality.useCase && (
            <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              <p>{d.loadQuality.useCase}</p>
              {d.loadQuality.glassPhotos && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {d.loadQuality.glassPhotos.map((ph) => (
                    <figure key={ph.img} className="overflow-hidden rounded-lg border border-amber-200 bg-white">
                      <img src={ph.img} alt={ph.caption} className="h-40 w-full object-cover" loading="lazy" />
                      <figcaption className="p-2 text-xs text-gray-600">{ph.caption}</figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          )}
          <p className="mb-1 mt-4 text-sm font-semibold text-gray-700">Equipment</p>
          <Bullets items={d.loadQuality.equipment} icon={ChevronRight} color="text-purple-600" />
          <p className="mb-1 mt-4 text-sm font-semibold text-gray-700">Why</p>
          <Bullets items={d.loadQuality.benefits} />
        </Card>
        <Card title="CICO — hours saved" subtitle="Clock-in / clock-out controls" icon={Clock}>
          {cicoData.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={c.weeks} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${num(v, 1)} hrs`} />
                <Bar dataKey="hoursSaved" name="Hours saved" fill="#7c3aed" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="hoursSaved" position="top" style={{ fontSize: 11, fill: '#374151' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart height={200} />
          )}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Hours saved</p>
              <p className="text-xl font-bold text-gray-900">{x.cicoHasHours ? num(x.cicoHours, 1) : <Tbc small />}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <p className="text-xs text-gray-500">$ saved</p>
              <p className="text-xl font-bold text-green-700">{isNum(x.cicoValue) ? money(x.cicoValue) : <Tbc small />}</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3">
              <p className="text-xs text-gray-500">Annualized</p>
              <p className="text-xl font-bold text-purple-700">{isNum(x.cicoAnnualized) ? kMoney(x.cicoAnnualized) : <Tbc small />}</p>
            </div>
          </div>
          <div className="mt-4">
            <Bullets items={c.drivers} icon={ChevronRight} color="text-purple-600" />
          </div>
          <Source>$ saved = hours × {isNum(c.avgHourlyRate) ? money(c.avgHourlyRate, 2) : 'TBC'}/hr (September cost per dock hour).</Source>
        </Card>
      </div>
    </>
  );
};

// --- Terminal --------------------------------------------------------------
const TerminalTab = ({ d }) => {
  const t = d.terminal;
  return (
    <>
      <PageHeader
        eyebrow="5 · Physical Terminal"
        icon={Wrench}
        title="Status of the Physical Terminal"
        subtitle="Terminal relocation planned — no major repair spend at the current site."
      />
      <Card title="Terminal relocation" icon={Home}>
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
            <Truck className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900"><V v={t.relocation} /></p>
            <p className="mt-2 text-gray-600"><V v={t.relocationNote} /></p>
          </div>
        </div>
      </Card>
    </>
  );
};

// --- F26 Recap ---------------------------------------------------------------
const F26Tab = ({ d }) => {
  const f = d.f26;
  return (
    <>
      <PageHeader
        eyebrow="Background"
        icon={Calendar}
        title="F26 Recap → F27"
        subtitle="The F26 plan set in July 2025 (Jul 1, 2025 – Jun 30, 2026) — the baseline we are building on in F27."
      />
      <div className="mb-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
        <Kpi icon={Calendar} tone="gray" label="F25 actual cost" value={<V v={f.f25ActualCost} fmt={money} />} />
        <Kpi icon={Target} tone="purple" label="F26 target cost" value={<V v={f.f26TargetCost} fmt={money} />} sub={<>F26 actual <V v={f.f26ActualCost} fmt={money} small /></>} />
        <Kpi icon={TrendingDown} tone="blue" label="Required reduction" value={<V v={f.requiredReduction} fmt={money} />} />
        <Kpi
          icon={CheckCircle}
          tone="green"
          label="F26 savings identified"
          value={<V v={f.identifiedSavings} fmt={money} />}
          sub={<>Actual <V v={f.f26ActualSavings} fmt={money} small /></>}
          footer={allNum(f.identifiedSavings, f.requiredReduction) && <Chip tone="green">{pct((f.identifiedSavings / f.requiredReduction) * 100, 0)} of target</Chip>}
        />
      </div>
      <F26Recap />
    </>
  );
};

// ---------------------------------------------------------------------------
// Edit panel — lets the presenter fill in TBC values without touching code
// ---------------------------------------------------------------------------
const parseNum = (raw) => {
  const cleaned = String(raw).replace(/[$,%\s]/g, '');
  if (cleaned === '') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
};

const Field = ({ field, value, onChange }) => {
  const [draft, setDraft] = useState(value === null || value === undefined ? '' : String(value));
  useEffect(() => {
    if (field.type === 'number') {
      if (parseNum(draft) !== (value === undefined ? null : value)) setDraft(value === null || value === undefined ? '' : String(value));
    } else if (draft !== (value || '')) {
      setDraft(value || '');
    }
  }, [value]);
  const empty = field.type === 'number' ? !isNum(value) : !value;
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-600">{field.label}</span>
      <input
        type="text"
        inputMode={field.type === 'number' ? 'decimal' : 'text'}
        value={draft}
        placeholder={field.type === 'number' ? 'TBC' : ''}
        onChange={(e) => {
          const raw = e.target.value;
          setDraft(raw);
          if (field.type === 'number') {
            const n = parseNum(raw);
            if (n !== undefined) onChange(field.path, n);
          } else {
            onChange(field.path, raw);
          }
        }}
        className={`mt-1 w-full rounded-md border px-2 py-1.5 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 ${
          empty && field.type === 'number' ? 'border-amber-300 bg-amber-50' : 'border-gray-300'
        }`}
      />
    </label>
  );
};

const EditPanel = ({ data, onChange, onReset, onClose, missing }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const text = `export const DEFAULT_DATA = ${JSON.stringify(data, null, 2)};`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      window.prompt('Copy this and paste it over DEFAULT_DATA in src/data.js:', text);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <Pencil className="h-5 w-5 text-purple-600" /> Edit data
            </h2>
            <p className="text-xs text-gray-500">Saves in this browser as you type · {missing} values still TBC</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {EDIT_SECTIONS.map((sec, i) => (
            <details key={sec.title} open={i === 0} className="rounded-lg border border-gray-200">
              <summary className="cursor-pointer select-none px-4 py-3 font-semibold text-gray-800">{sec.title}</summary>
              <div className="grid grid-cols-2 gap-3 px-4 pb-4">
                {sec.fields.map((fl) => (
                  <div key={fl.path} className={fl.type === 'text' && /name|item|status/i.test(fl.label) ? 'col-span-2' : ''}>
                    <Field field={fl} value={getIn(data, fl.path)} onChange={onChange} />
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
        <div className="flex gap-2 border-t border-gray-200 px-5 py-4">
          <button onClick={copy} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700">
            <Copy className="h-4 w-4" /> {copied ? 'Copied!' : 'Copy for data.js'}
          </button>
          <button
            onClick={() => {
              if (window.confirm('Clear everything typed in this browser and go back to the values in src/data.js?')) onReset();
            }}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </aside>
    </div>
  );
};

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
const App = () => {
  const [tab, setTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [overrides, setOverrides] = useState(() => readStore(STORAGE_KEY, {}));
  const [hideBanner, setHideBanner] = useState(() => readStore(BANNER_KEY, false));

  const data = useMemo(() => {
    try {
      return applyOverrides(DEFAULT_DATA, overrides);
    } catch (e) {
      return DEFAULT_DATA;
    }
  }, [overrides]);
  const x = useMemo(() => derive(data), [data]);

  const onChange = useCallback((path, value) => {
    setOverrides((prev) => {
      const next = { ...prev, [path]: value };
      writeStore(STORAGE_KEY, next);
      return next;
    });
  }, []);
  const onReset = useCallback(() => {
    setOverrides({});
    writeStore(STORAGE_KEY, {});
  }, []);

  const go = useCallback((id) => {
    setTab(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const idx = TABS.findIndex((t) => t.id === tab);
  const step = useCallback((dir) => go(TABS[(idx + dir + TABS.length) % TABS.length].id), [idx, go]);

  // Arrow keys move between sections while presenting
  useEffect(() => {
    const onKey = (e) => {
      if (editing || /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') step(1);
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, editing]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-lg">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-gray-800">{data.meta.terminal} Terminal</h1>
              <p className="truncate text-xs text-gray-500">
                {data.meta.fiscalYear} Leadership Review · {data.meta.presentationDate}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => step(-1)} className="hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 sm:block" aria-label="Previous section">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => step(1)} className="hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 sm:block" aria-label="Next section">
                <ChevronRight className="h-5 w-5" />
              </button>
              <a
                href="/Mississauga_F27_Leadership_Review.pptx"
                download
                className="hidden items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 md:flex"
              >
                <Download className="h-4 w-4" /> PowerPoint
              </a>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-purple-700"
              >
                <Pencil className="h-4 w-4" /> Edit data
              </button>
            </div>
          </div>
          <nav className="-mb-px flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => go(t.id)}
                className={`flex flex-shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  tab === t.id ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Missing-data banner (hide it while presenting) */}
      {x.missing > 0 && !hideBanner && (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-2 text-sm text-amber-800">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {x.missing} values still show <Tbc small /> — click “Edit data” to fill them in.
            </span>
            <button
              onClick={() => {
                setHideBanner(true);
                writeStore(BANNER_KEY, true);
              }}
              className="flex items-center gap-1 rounded px-2 py-1 font-medium hover:bg-amber-100"
            >
              <EyeOff className="h-4 w-4" /> Hide for presenting
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-6 py-8">
        {tab === 'overview' && <OverviewTab d={data} x={x} go={go} />}
        {tab === 'safety' && <SafetyTab d={data} x={x} />}
        {tab === 'service' && <ServiceTab d={data} x={x} />}
        {tab === 'sca' && <ScaTab d={data} x={x} />}
        {tab === 'spend' && <SpendTab d={data} />}
        {tab === 'productivity' && <ProductivityTab d={data} x={x} />}
        {tab === 'initiatives' && <InitiativesTab d={data} x={x} />}
        {tab === 'terminal' && <TerminalTab d={data} x={x} />}
        {tab === 'f26' && <F26Tab d={data} />}
        {tab === 'qa' && <QaTab d={data} x={x} />}

        {/* Section pager */}
        <div className="mt-10 flex items-center justify-between">
          <button onClick={() => step(-1)} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white hover:shadow">
            <ChevronLeft className="h-4 w-4" /> {TABS[(idx - 1 + TABS.length) % TABS.length].label}
          </button>
          <span className="text-xs text-gray-400">Use ← → keys to move between sections</span>
          <button onClick={() => step(1)} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white hover:shadow">
            {TABS[(idx + 1) % TABS.length].label} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </main>

      <footer className="mt-8 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center">
          <p className="text-sm opacity-70">
            {data.meta.terminal} Terminal · {data.meta.fiscalYear} ({data.meta.fiscalRange}) · Prepared for {data.meta.audience}
          </p>
        </div>
      </footer>

      {editing && <EditPanel data={data} onChange={onChange} onReset={onReset} onClose={() => setEditing(false)} missing={x.missing} />}
    </div>
  );
};

export default App;
