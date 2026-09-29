import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell, LabelList
} from 'recharts';
import {
  Shield, Clock, DollarSign, Target, TrendingDown, TrendingUp, CheckCircle,
  AlertTriangle, Truck, Activity, BarChart3, Wrench, Gauge, Users, Pencil, X,
  Copy, RotateCcw, ChevronLeft, ChevronRight, Calendar, Package, EyeOff, Zap,
  ClipboardCheck, Home, Award
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
const kMoney = (v) => (Math.abs(v) >= 1e6 ? `$${(v / 1e6).toFixed(2)}M` : `$${(v / 1000).toFixed(1)}K`);

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
  const otsUnadj = allNum(o.onTimeFbs, o.totalFbs) && o.totalFbs > 0 ? (o.onTimeFbs / o.totalFbs) * 100 : null;
  const otsAdj = allNum(o.adjLates, o.totalFbs) && o.totalFbs > 0 ? ((o.totalFbs - o.adjLates) / o.totalFbs) * 100 : null;
  const codeRows = Object.entries(o.codes).map(([code, count]) => ({
    code,
    count,
    pct: allNum(count, o.unadjLates) && o.unadjLates > 0 ? (count / o.unadjLates) * 100 : null,
  }));

  const s = d.sca;
  const cppPctOfTarget = allNum(s.costPerProMtd, s.costPerProTarget) ? (s.costPerProMtd / s.costPerProTarget) * 100 : null;
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

  const repairs = d.terminal.repairs.filter((r) => r.item && String(r.item).trim());
  const repairCost = sum(repairs.map((r) => r.estCost));

  const missing = EDIT_SECTIONS.flatMap((sec) => sec.fields)
    .filter((fl) => fl.type === 'number')
    .filter((fl) => !fl.path.startsWith('terminal.repairs') && !fl.path.startsWith('f26.'))
    .filter((fl) => !isNum(getIn(d, fl.path))).length;

  return {
    otsUnadj, otsAdj, codeRows, cppPctOfTarget, cppUnder, cppTone, cppBelowTargetValue, labour,
    hoursDelta, wdPctUsed, cdPctUsed, monthPctUsed, wdElapsedPct, hoursUnder, hoursUnderValue,
    paceHours, paceReduction, paceVsReductionTarget,
    initAnnual, initYtd, initHasAnnual, initHasYtd,
    pphVsLy, pphVsGoal, uphVsLy, rateVsLy, cwtVsLy, weightVsLy, lbsPerUnitF26,
    hoursAtF26Rate, hoursAvoided, hoursAvoidedValue,
    cpu27, cpu26, cpuVsLy, cpuSavings, unitsVsLy,
    cicoHours, cicoHasHours, cicoValue, cicoAnnualized,
    repairs, repairCost, missing,
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
    <span className="text-xs text-amber-600">Click “Edit data” in the top bar</span>
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
  { id: 'productivity', label: 'Productivity', icon: Gauge },
  { id: 'terminal', label: 'Terminal', icon: Wrench },
  { id: 'f26', label: 'F26 Recap', icon: Calendar },
];

// --- Overview --------------------------------------------------------------
const OverviewTab = ({ d, x, go }) => {
  const fp = fiscalProgress();
  const p27 = d.productivity.f27;
  const agenda = [
    { id: 'safety', icon: Shield, title: 'Safety', text: 'Current TRIR, what we do every shift, and what we are adding in F27.' },
    { id: 'service', icon: Clock, title: 'Service', text: 'OTS and late codes, plus scanning compliance by trip type.' },
    { id: 'sca', icon: DollarSign, title: 'SCA & Savings', text: 'Cost per PRO vs target and the F27 cost take-out plan.' },
    { id: 'productivity', icon: Gauge, title: 'Productivity', text: 'PPH, units per hour, load factor and CICO hours saved.' },
    { id: 'terminal', icon: Wrench, title: 'Physical Terminal', text: 'Condition of the building and urgent repairs.' },
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
          tone="blue"
          label="Safety · TRIR F27 YTD"
          value={<V v={d.safety.trirF27Ytd} fmt={(v) => num(v, 2)} />}
          sub={<>Target <V v={d.safety.trirTarget} fmt={(v) => num(v, 2)} small /> · F26 <V v={d.safety.trirF26} fmt={(v) => num(v, 2)} small /></>}
        />
        <Kpi
          icon={Clock}
          tone="purple"
          label={`Service · OTS adjusted (${d.ots.period})`}
          value={<V v={x.otsAdj} fmt={(v) => pct(v, 2)} />}
          sub={<>Unadjusted <V v={x.otsUnadj} fmt={(v) => pct(v, 2)} small /> · Target <V v={d.ots.target} fmt={(v) => pct(v, 1)} small /></>}
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
                  ? `Agency hours ${num(d.sca.f26AgencyHours)} → ${num(d.sca.f27AgencyHours)} (${pct(x.hoursDelta.agency.pct)}); agency cost ${money(d.sca.f26AgencyCost)} → ${money(d.sca.f27AgencyCost)} (F26 full Sept vs F27 MTD).`
                  : '',
              },
              {
                show: isNum(x.cppPctOfTarget),
                icon: Target,
                title: `Cost per PRO ${isNum(d.sca.costPerProMtd) ? money(d.sca.costPerProMtd, 2) : ''} vs ${isNum(d.sca.costPerProTarget) ? money(d.sca.costPerProTarget, 2) : ''} target`,
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
const SafetyTab = ({ d }) => {
  const s = d.safety;
  const trirGood = allNum(s.trirF27Ytd, s.trirTarget) ? s.trirF27Ytd <= s.trirTarget : null;
  return (
    <>
      <PageHeader
        eyebrow="1 · Safety"
        icon={Shield}
        title="TRIR — Total Recordable Incident Rate"
        subtitle="Where we are today, the processes in place, and what we are adding to improve in F27."
      />
      <div className="mb-8 grid grid-cols-2 gap-6 lg:grid-cols-5">
        <Kpi
          icon={Shield}
          tone={trirGood === null ? 'blue' : trirGood ? 'green' : 'red'}
          label="TRIR F27 YTD"
          value={<V v={s.trirF27Ytd} fmt={(v) => num(v, 2)} />}
        />
        <Kpi icon={Target} tone="purple" label="F27 target" value={<V v={s.trirTarget} fmt={(v) => num(v, 2)} />} />
        <Kpi icon={Calendar} tone="gray" label="TRIR F26" value={<V v={s.trirF26} fmt={(v) => num(v, 2)} />} />
        <Kpi icon={AlertTriangle} tone="amber" label="Recordables YTD" value={<V v={s.recordablesF27Ytd} fmt={num} />} />
        <Kpi icon={CheckCircle} tone="green" label="Days since last recordable" value={<V v={s.daysSinceLastRecordable} fmt={num} />} />
      </div>
      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card title="What we do every shift" icon={ClipboardCheck}>
          <Bullets items={s.practices} />
        </Card>
        <div className="space-y-8">
          <Card title="Incident reporting & training" icon={Users}>
            <Bullets items={s.incidentProcess} icon={CheckCircle} color="text-blue-600" />
          </Card>
          <Card title="New for F27" icon={Zap}>
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
  const codeData = x.codeRows.filter((r) => isNum(r.count));
  const scanTiles = [
    { label: 'Delivery trips', v: sc.deliveryPct, ytd: sc.deliveryFytdPct },
    { label: 'Line haul — outbound', v: sc.lineHaulOutPct, ytd: sc.lineHaulOutFytdPct },
    { label: 'Line haul — inbound', v: sc.lineHaulInPct },
    { label: 'Pickup trips', v: sc.pickupPct },
  ];
  return (
    <>
      <PageHeader
        eyebrow="2 · Service"
        icon={Clock}
        title="OTS — On-Time Service"
        subtitle="Current OTS, what is driving the lates, and the plan to improve in F27."
      />
      <div className="mb-8 grid grid-cols-2 gap-6 lg:grid-cols-5">
        <Kpi icon={Package} tone="gray" label={`Total FB's · ${o.period}`} value={<V v={o.totalFbs} fmt={num} />} />
        <Kpi icon={CheckCircle} tone="green" label="On-time FB's" value={<V v={o.onTimeFbs} fmt={num} />} />
        <Kpi icon={Clock} tone="purple" label="OTS unadjusted" value={<V v={x.otsUnadj} fmt={(v) => pct(v, 2)} />} sub={<>UNADJ lates <V v={o.unadjLates} fmt={num} small /></>} />
        <Kpi
          icon={Target}
          tone={allNum(x.otsAdj, o.target) ? (x.otsAdj >= o.target ? 'green' : 'red') : 'purple'}
          label="OTS adjusted"
          value={<V v={x.otsAdj} fmt={(v) => pct(v, 2)} />}
          sub={<>ADJ lates <V v={o.adjLates} fmt={num} small /></>}
        />
        <Kpi icon={Award} tone="blue" label="OTS target" value={<V v={o.target} fmt={(v) => pct(v, 1)} />} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
        <Card title="Lates by reason code" subtitle="Share of unadjusted lates" icon={BarChart3} className="lg:col-span-3">
          {codeData.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={codeData} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="code" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => num(v)} />
                <Bar dataKey="count" name="Lates" radius={[4, 4, 0, 0]}>
                  {codeData.map((r) => (
                    <Cell key={r.code} fill={r.code === 'IN' || r.code === 'TB' ? '#9ca3af' : '#7c3aed'} />
                  ))}
                  <LabelList dataKey="count" position="top" style={{ fontSize: 11, fill: '#374151' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart height={280} />
          )}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500">
                  {x.codeRows.map((r) => (
                    <th key={r.code} className="px-1 py-1 text-center font-semibold">{r.code}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {x.codeRows.map((r) => (
                    <td key={r.code} className="px-1 py-1 text-center font-medium text-gray-800"><V v={r.count} fmt={num} small /></td>
                  ))}
                </tr>
                <tr className="text-gray-500">
                  {x.codeRows.map((r) => (
                    <td key={r.code} className="px-1 py-1 text-center">{isNum(r.pct) ? pct(r.pct) : '—'}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <Source>IN = agent / beyond-carrier delays · TB = transborder delays — outside terminal control (shown in grey).</Source>
        </Card>
        <Card title="Plan to improve OTS" icon={Zap} className="lg:col-span-2">
          <Bullets items={o.actions} icon={ChevronRight} color="text-purple-600" />
        </Card>
      </div>

      <MissedPuCard m={d.missedPu} />

      <Card title="Scanning compliance — freight bills scanned" subtitle={`In/out of facility · ${sc.dateRange}`} icon={Activity}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {scanTiles.map((t) => {
            const good = isNum(t.v) ? t.v >= sc.target : null;
            return (
              <div key={t.label} className={`rounded-xl p-5 ${good === null ? 'bg-gray-50' : good ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="text-sm font-medium text-gray-600">{t.label}</p>
                <p className={`mt-1 text-4xl font-bold ${good === null ? 'text-gray-900' : good ? 'text-green-700' : 'text-red-700'}`}>
                  <V v={t.v} fmt={(v) => pct(v, 2)} />
                </p>
                {'ytd' in t && (
                  <p className="mt-2 text-xs text-gray-500">
                    Fiscal YTD <V v={t.ytd} fmt={(v) => pct(v, 2)} small />
                  </p>
                )}
                {isNum(t.v) && isNum(sc.target) && (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                    <div className={`h-full ${good ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, t.v)}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <Source>Target {isNum(sc.target) ? pct(sc.target, 0) : 'TBC'} of freight bills scanned. Source: Compliance Reporting — Scanning Efficiency In/Out of Terminals.</Source>
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
          <p className="text-xs text-gray-500">Trending down from Sep MTD {isNum(m.byMonth[3] && m.byMonth[3].pct) ? pct(m.byMonth[3].pct, 2) : '—'}</p>
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
  const shifts = [
    { label: 'Days', v: s.shiftHours.days },
    { label: 'Afternoons', v: s.shiftHours.afternoon },
    { label: 'Midnights', v: s.shiftHours.midnight },
  ];
  const coverage = x.initHasAnnual && isNum(s.f27SavingsTarget) && s.f27SavingsTarget > 0 ? (x.initAnnual / s.f27SavingsTarget) * 100 : null;
  const statusTone = (st) => (/new/i.test(st) ? 'blue' : /sustain/i.test(st) ? 'green' : 'purple');
  const cppLabel = { green: 'On target', amber: 'Under target — watch', red: 'Over target', gray: '' }[x.cppTone];
  const periodNote = `F26 = full September 2025 · F27 = September MTD (${isNum(s.wdMtd) ? s.wdMtd : '—'} of ${isNum(s.wdMonth) ? s.wdMonth : '—'} working days)`;

  return (
    <>
      <PageHeader
        eyebrow="3 · SCA"
        icon={DollarSign}
        title="SCA — Hours, Cost per PRO & F27 Take-Out"
        subtitle={`Current status against target and the plan to achieve — and over-achieve — the F27 cost take-out target. Mississauga · updated for ${s.updatedFor}.`}
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

        <Card title="Cost per PRO" subtitle={`National SCA Cost-per-PRO report · ${s.updatedFor}`} icon={Target}>
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
                {money(Math.abs(x.cppUnder), 2)} {x.cppUnder >= 0 ? 'under' : 'over'} target on every PRO
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
          <div className="mt-2"><Delta d={x.cpuVsLy} goodWhen="down" fmtAbs={(v) => money(v, 2)} /></div>
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
        <Card title="Target dock hours per shift" subtitle="Shift start/end aligned to P&D activity" icon={Clock}>
          <div className="grid grid-cols-3 gap-3">
            {shifts.map((sh) => (
              <div key={sh.label} className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-xs font-medium text-gray-500">{sh.label}</p>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  {allNum(sh.v.low, sh.v.high) ? `${num(sh.v.low)}–${num(sh.v.high)}` : <Tbc small />}
                </p>
                <p className="text-xs text-gray-500">hrs / day</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Daily SCA target: <span className="font-semibold">{isNum(s.wdTargetPerDay) ? `${num(s.wdTargetPerDay)} hrs per working day` : 'TBC'}</span>
          </p>
        </Card>
        <Card title="How we are taking cost out" icon={Zap}>
          <Bullets items={s.actions} icon={ChevronRight} color="text-purple-600" />
        </Card>
      </div>

      <Card
        title="F27 savings plan"
        subtitle="Initiatives, full-year plan and realized to date"
        icon={Target}
        right={
          <div className="text-right">
            <p className="text-xs uppercase text-gray-500">F27 take-out target</p>
            <p className="text-2xl font-bold text-gray-900"><V v={s.f27SavingsTarget} fmt={money} /></p>
            {isNum(coverage) && <Chip tone={coverage >= 100 ? 'green' : 'amber'}>{pct(coverage, 0)} of target planned</Chip>}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 text-left text-gray-500">
                <th className="py-2 pr-4 font-semibold">Initiative</th>
                <th className="py-2 pr-4 font-semibold">Status</th>
                <th className="py-2 pr-4 text-right font-semibold">F27 plan</th>
                <th className="py-2 pr-4 text-right font-semibold">Realized YTD</th>
                <th className="py-2 text-right font-semibold">% realized</th>
              </tr>
            </thead>
            <tbody>
              {d.initiatives.filter((i) => i.name).map((i, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-medium text-gray-800">{i.name}</td>
                  <td className="py-3 pr-4"><Chip tone={statusTone(i.status || '')}>{i.status || '—'}</Chip></td>
                  <td className="py-3 pr-4 text-right font-semibold"><V v={i.annual} fmt={money} small /></td>
                  <td className="py-3 pr-4 text-right"><V v={i.ytd} fmt={money} small /></td>
                  <td className="py-3 text-right text-gray-600">{allNum(i.annual, i.ytd) && i.annual > 0 ? pct((i.ytd / i.annual) * 100, 0) : '—'}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td className="py-3 pr-4" colSpan={2}>Total</td>
                <td className="py-3 pr-4 text-right">{x.initHasAnnual ? money(x.initAnnual) : <Tbc small />}</td>
                <td className="py-3 pr-4 text-right">{x.initHasYtd ? money(x.initYtd) : <Tbc small />}</td>
                <td className="py-3 text-right">{x.initHasAnnual && x.initHasYtd && x.initAnnual > 0 ? pct((x.initYtd / x.initAnnual) * 100, 0) : '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
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
  const lfData = lf.weeks.filter((w) => isNum(w.lfScore) || isNum(w.loadPct));
  const cicoData = c.weeks.filter((w) => isNum(w.hoursSaved));
  const compareRows = [
    { label: 'Weight (lbs)', a: p27.weight, b: p26.weight, d: x.weightVsLy, fmt: num, good: 'up', note: 'F27 is MTD' },
    { label: 'Units', a: p27.units, b: p26.units, d: x.unitsVsLy, fmt: num, good: 'up', note: 'F27 is MTD' },
    { label: 'PPH (lbs / hr)', a: p27.pph, b: p26.pph, d: x.pphVsLy, fmt: num, good: 'up' },
    { label: 'Units per hour', a: p27.unitsPerHr, b: p26.unitsPerHr, d: x.uphVsLy, fmt: (v) => num(v, 2), good: 'up' },
    { label: 'Lbs per unit', a: p27.lbsPerUnit, b: x.lbsPerUnitF26, d: allNum(p27.lbsPerUnit, x.lbsPerUnitF26) ? { abs: p27.lbsPerUnit - x.lbsPerUnitF26, pct: ((p27.lbsPerUnit - x.lbsPerUnitF26) / x.lbsPerUnitF26) * 100 } : null, fmt: num, good: 'neutral', note: 'F26 = PPH ÷ units/hr' },
    { label: 'Cost per hour', a: p27.hourlyRate, b: p26.hourlyRate, d: x.rateVsLy, fmt: (v) => money(v, 2), good: 'down' },
    { label: 'Cost per CWT', a: p27.cwt, b: p26.cwt, d: x.cwtVsLy, fmt: (v) => money(v, 4), good: 'down' },
    { label: 'Cost per unit', a: x.cpu27, b: x.cpu26, d: x.cpuVsLy, fmt: (v) => money(v, 2), good: 'down' },
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
              Gap to goal: <span className="font-semibold text-red-600">{signed(x.pphVsGoal.abs, num)} ({pct(x.pphVsGoal.pct)})</span> · hour-reduction target{' '}
              <span className="font-semibold">{isNum(d.sca.hourReductionTarget) ? `${num(d.sca.hourReductionTarget)} hrs` : 'TBC'}</span>
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card title="Load factor — weekly" subtitle={`Targets: LF score ${lf.lfTarget}% · load ${lf.loadTarget}%`} icon={Truck}>
          {lfData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={lf.weeks} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => pct(v)} />
                <Legend />
                <ReferenceLine y={lf.lfTarget} stroke="#7c3aed" strokeDasharray="5 5" />
                <ReferenceLine y={lf.loadTarget} stroke="#059669" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="lfScore" name="LF score %" stroke="#7c3aed" strokeWidth={3} dot={{ r: 5 }} connectNulls />
                <Line type="monotone" dataKey="loadPct" name="Load %" stroke="#059669" strokeWidth={3} dot={{ r: 5 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
          <table className="mt-4 w-full text-sm">
            <tbody>
              {lf.weeks.map((w) => (
                <tr key={w.label} className="border-b border-gray-100">
                  <td className="py-2 text-gray-700">{w.label}</td>
                  <td className="py-2 text-right">LF <span className="font-semibold"><V v={w.lfScore} fmt={(v) => pct(v)} small /></span></td>
                  <td className="py-2 text-right">Load <span className="font-semibold"><V v={w.loadPct} fmt={(v) => pct(v)} small /></span></td>
                </tr>
              ))}
            </tbody>
          </table>
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
const TerminalTab = ({ d, x }) => {
  const t = d.terminal;
  const available = allNum(t.doorsTotal, t.doorsOutOfService) && t.doorsTotal > 0 ? ((t.doorsTotal - t.doorsOutOfService) / t.doorsTotal) * 100 : null;
  const prTone = (p) => (/urgent/i.test(p) ? 'red' : /high/i.test(p) ? 'amber' : 'blue');
  return (
    <>
      <PageHeader
        eyebrow="5 · Physical Terminal"
        icon={Wrench}
        title="Status of the Physical Terminal"
        subtitle="Review of the building and the urgent repairs required."
      />
      <div className="mb-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
        <Kpi icon={Home} tone="gray" label="Dock doors" value={<V v={t.doorsTotal} fmt={num} />} />
        <Kpi icon={AlertTriangle} tone="red" label="Doors out of service" value={<V v={t.doorsOutOfService} fmt={num} />} />
        <Kpi icon={CheckCircle} tone="green" label="Door availability" value={<V v={available} fmt={(v) => pct(v)} />} />
        <Kpi icon={DollarSign} tone="amber" label="Est. repair cost" value={x.repairs.some((r) => isNum(r.estCost)) ? money(x.repairCost) : <Tbc />} />
      </div>
      <Card title="Urgent repairs & capital needs" icon={Wrench}>
        {x.repairs.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 text-left text-gray-500">
                  <th className="py-2 pr-4 font-semibold">Item</th>
                  <th className="py-2 pr-4 font-semibold">Priority</th>
                  <th className="py-2 pr-4 text-right font-semibold">Est. cost</th>
                  <th className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {x.repairs.map((r, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-medium text-gray-800">{r.item}</td>
                    <td className="py-3 pr-4"><Chip tone={prTone(r.priority || '')}>{r.priority || '—'}</Chip></td>
                    <td className="py-3 pr-4 text-right"><V v={r.estCost} fmt={money} small /></td>
                    <td className="py-3 text-gray-600">{r.status || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyChart height={220} label="Add urgent repairs (item, priority, estimated cost, status)" />
        )}
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
        {tab === 'productivity' && <ProductivityTab d={data} x={x} />}
        {tab === 'terminal' && <TerminalTab d={data} x={x} />}
        {tab === 'f26' && <F26Tab d={data} />}

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
