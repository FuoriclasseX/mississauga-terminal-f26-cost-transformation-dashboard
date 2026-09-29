// ============================================================================
// MISSISSAUGA TERMINAL — F27 SENIOR LEADERSHIP REVIEW — DATA FILE
// ----------------------------------------------------------------------------
// Fiscal year runs Jul 1 – Jun 30.  F27 = Jul 1, 2026 – Jun 30, 2027.
//
// HOW TO UPDATE
//   • Easiest: open the site, click "Edit data" (top-right), type the numbers.
//     They save in your browser immediately. "Copy JSON" lets you paste them
//     back here so they stick for everyone.
//   • Or edit the values below directly.  `null` = not provided yet → the
//     dashboard shows an amber "TBC" chip in its place.
//
// SOURCE NOTES
//   • sca.* = Mississauga rows of the SCA hours report and the national
//     Cost-per-PRO report, both updated Saturday, Sep 26, 2026.
//   • productivity.* = Mississauga terminal productivity dashboard (Sep 26).
//   • Talking points (the text lists) are adapted from the Brampton Sep 28
//     deck and are DRAFTS — confirm each one is true for Mississauga.
// ============================================================================

export const DEFAULT_DATA = {
  meta: {
    terminal: 'Mississauga',
    fiscalYear: 'F27',
    fiscalRange: 'Jul 1, 2026 – Jun 30, 2027',
    presentationDate: 'Sep 29, 2026',
    audience: 'SVP & Senior Leadership',
    presenter: '',
  },

  // --------------------------------------------------------------------------
  // SAFETY — TRIR
  // --------------------------------------------------------------------------
  safety: {
    trirF27Ytd: null,        // e.g. 2.1
    trirF26: null,           // full-year F26 TRIR
    trirTarget: null,        // F27 target
    recordablesF27Ytd: null, // count of recordable incidents Jul 1 – today
    daysSinceLastRecordable: null,
    stepObservationsMtd: null,
    // Mississauga talking points (from the presenter)
    practices: [
      'Tailgates with the team on safety topics and safe work practices, plus specific safety moments after incidents (e.g. avoiding pinch points).',
      'Pre- and post-shift forklift inspections by every operator — deficiencies identified and corrected immediately. Shunt pre-trip meetings every shift using the new checklist.',
      'No loading forklifts on straight trucks — prevents serious injuries to employees and damage to forklifts.',
      'Safety equipment and dock conditions inspected and documented on H&S inspection sheets, collected monthly by OHS and fully reviewed at JHSC.',
      'Supervisors and managers address any non-compliance on the spot and report it in their STEP observations.',
    ],
    incidentProcess: [
      'Incidents reported promptly — supervisors and managers work directly with OHS on WSIB forms and a safe return to work.',
      'Detailed incident descriptions; root cause identified with OHS; corrective action plans implemented, with follow-up prioritized so controls are in place to prevent recurrence.',
      'Monthly safety e-learning for managers and supervisors on topics tied to our operation.',
      'Forklift and TDG training completed before expiry.',
    ],
    f27Plans: [
      'Roofing work over the dock: work areas identified and barricaded so no one enters zones under overhead work (falling-debris risk).',
      'N95 masks made readily available on the dock during roofing work to minimize exposure to airborne debris.',
      'Safety moments after every incident so the whole team hears the specific learning.',
    ],
  },

  // --------------------------------------------------------------------------
  // SERVICE — OTS (On-Time Service)
  // Percentages are calculated for you from the counts.
  //   UNADJ% = On-time FBs / Total FBs
  //   ADJ%   = (Total FBs − ADJ lates) / Total FBs
  // --------------------------------------------------------------------------
  // Source: Adj On Time dashboard — Mississauga, calendar 2026 through Sep 28.
  // "Beyond interliner" = partner-carrier freight. inclPartners = filter "All"
  // (included), exclPartners = filter "N" (excluded) to show the difference.
  ots: {
    period: 'Jan – Sep 28, 2026',
    target: 90,               // dashboard green line (80–90 amber, <80 red)
    last7Pct: 94.35,          // Adj total on-time % 7-day avg (Sep 22–28, incl. partners)
    last7Days: [
      { label: 'Sep 22', pct: 90.1 },
      { label: 'Sep 23', pct: 94.6 },
      { label: 'Sep 24', pct: 93.6 },
      { label: 'Sep 25', pct: 95.4 },
      { label: 'Sep 26', pct: 95.0 },
      { label: 'Sep 27', pct: 100.0 },
      { label: 'Sep 28', pct: 95.8 },
    ],
    week40: { incl: 95.82, excl: 97.81 },
    inclPartners: { pct: 87.6, lateFbs: 12650, onTimeFbs: 89340 },   // dashboard shows 12.65K / 89.34K
    exclPartners: { pct: 92.24, lateFbs: 6910, onTimeFbs: 82070 },   // dashboard shows 6.91K / 82.07K
    months: [
      { label: 'Jan', fy: 'F26', incl: 87.5, excl: 87.5 },
      { label: 'Feb', fy: 'F26', incl: 87.8, excl: 87.9 },
      { label: 'Mar', fy: 'F26', incl: 84.9, excl: 88.4 },
      { label: 'Apr', fy: 'F26', incl: 81.5, excl: 88.8 },
      { label: 'May', fy: 'F26', incl: 83.6, excl: 92.1 },
      { label: 'Jun', fy: 'F26', incl: 85.5, excl: 91.8 },
      { label: 'Jul', fy: 'F27', incl: 89.3, excl: 94.4 },
      { label: 'Aug', fy: 'F27', incl: 91.7, excl: 94.7 },
      { label: 'Sep', fy: 'F27', incl: 93.7, excl: 96.7 },
    ],
    // Late reason codes (counts). IN = agent / beyond carrier, TB = transborder
    codes: {
      AS: null, BD: null, OT: null, TF: null, LH: null, DL: null,
      MS: null, IN: null, TB: null, OTHER: null, UNCODED: null,
    },
    actions: [
      'Drivers own the freight bill — ownership of the FB from inbound to delivery.',
      'Scanning compliance checked every shift (see Scanning slide).',
      'TF (terminal) and P&D working collectively on hand-offs.',
      'End-of-shift reporting on afternoons — every late coded before shift end.',
      'Partner-carrier (beyond interliner) lates reviewed weekly with the interline team — largely outside terminal control.',
    ],
  },

  // --------------------------------------------------------------------------
  // SERVICE — MISSED PICKUPS (Missed PU dashboard, Mississauga,
  // all dates in report through Sep 26, 2026)
  // --------------------------------------------------------------------------
  missedPu: {
    period: 'Jun – Sep 26, 2026',
    missedPct: 4.7,
    totalMissed: 3415,
    totalSuccessful: 69000,     // dashboard shows 69K
    totalMeasured: 73000,       // dashboard shows 73K
    byMonth: [
      { label: 'Jun', pct: 7.77 },
      { label: 'Jul', pct: 4.88 },
      { label: 'Aug', pct: 3.66 },
      { label: 'Sep MTD', pct: 5.23 },
    ],
    byWeek: [
      { label: 'Wk 27', pct: 7.11 }, { label: 'Wk 28', pct: 2.75 }, { label: 'Wk 29', pct: 6.66 },
      { label: 'Wk 30', pct: 4.84 }, { label: 'Wk 31', pct: 4.4 },  { label: 'Wk 32', pct: 2.81 },
      { label: 'Wk 33', pct: 3.48 }, { label: 'Wk 34', pct: 3.52 }, { label: 'Wk 35', pct: 5.04 },
      { label: 'Wk 36', pct: 4.43 }, { label: 'Wk 37', pct: 5.95 }, { label: 'Wk 38', pct: 6.47 },
      { label: 'Wk 39*', pct: 3.86 },
    ],
    byCategory: [
      { label: 'OPS – false positive', count: 1530, pct: 44.74 },
      { label: 'Customer issue',       count: 1190, pct: 34.73 },
      { label: 'OPS issue',            count: 510,  pct: 14.93 },
      { label: 'Cancelled / CCC / made', count: null, pct: 5.6 },
    ],
    topReasons: [
      { label: 'Already serviced',   count: 1390, pct: 40.73 },
      { label: 'Not ready',          count: 620,  pct: 18.24 },
      { label: 'Cust issue – log…',  count: 290,  pct: 8.46 },
      { label: 'Appointment',        count: 170,  pct: 4.83 },
    ],
    falsePositiveCount: 1530,   // OPS – false positive
    last7Pct: 3.75,             // Missed PU % 7-day avg (to Sep 26)
    last7Days: [
      { label: '22 Sep', pct: 3.28 },
      { label: '23 Sep', pct: 4.94 },
      { label: '24 Sep', pct: 4.1 },
      { label: '25 Sep', pct: 3.99 },
      { label: '26 Sep', pct: 0.33 },
    ],
    notes: [
      'Sep 7 spike (85.7%) = Labour Day — very low volume.',
      'Wk 39 is partial.',
    ],
    actions: [
      'Close-out discipline: every serviced pickup scanned/closed before the driver leaves — removes "already serviced" false positives.',
      'Daily review of the prior day\'s missed PU list by dispatch before 10:00.',
      '"Not ready" pickups re-booked the same day with the customer, and coded correctly.',
    ],
  },

  // --------------------------------------------------------------------------
  // SERVICE — SCANNING COMPLIANCE (Freight Bills Scanned %)
  // --------------------------------------------------------------------------
  // Compliance Reporting — Scanning Efficiency In/Out of Terminals,
  // D&R Commerce Mississauga, Sep 1–28, 2026 (28 days), all trip types
  scanning: {
    dateRange: 'Sep 1 – Sep 28, 2026',
    measures: [
      { label: 'Freight bills scanned', pct: 91.37, fytd: 91.55, vsLast: -0.22, vsFytd: 0.47, scanned: 48220, total: 52770 },
      { label: 'Freight bills completely scanned', pct: 90.5, fytd: 90.54, vsLast: -0.2, vsFytd: 0.6, scanned: 47760, total: 52770 },
      { label: 'Items scanned', pct: 90.66, fytd: 90.61, vsLast: -0.13, vsFytd: 1.54, scanned: 73850, total: 81460 },
    ],
    target: null,               // no target provided
  },

  // --------------------------------------------------------------------------
  // SCA — Mississauga only · updated Saturday, Sep 26, 2026 · September
  //   F26 = full September 2025 · F27 = September MTD
  //   Working days: 18 of 21 elapsed (85.7%) · Calendar days: 26 of 30 (86.7%)
  // --------------------------------------------------------------------------
  sca: {
    updatedFor: 'Sat, Sep 26, 2026',
    period: 'September MTD',
    wdMonth: 21,
    wdMtd: 18,
    cdMonth: 30,
    cdMtd: 26,
    // National SCA Cost-per-PRO report (Sep 26) — Mississauga row
    costPerProMtd: 6.6,
    costPerProTarget: 6.85,
    costPerProPctOfTarget: 96.3, // as published in the report (amber / watch)
    fbCountMtd: 26053,           // FB count (IN + OUT, CY MTD)
    monthlyDockSb: 44053,        // monthly dock S&B (input)
    proratedSbMtd: 38179.09,     // prorated S&B (MTD)
    f26TotalCost: 199739.12,
    f26CompanyCost: 69281.3,
    f26AgencyCost: 130457.82,
    f27TotalCost: 133692.34,
    f27CompanyCost: 58917.47,
    f27AgencyCost: 74774.87,
    // SCA hours report (Sep 26) — Mississauga row
    f26Hours: 6303,
    f26CompanyHours: 1860,
    f26AgencyHours: 4443,
    f27Hours: 3999,
    f27CompanyHours: 1542,
    f27AgencyHours: 2457,
    hourReductionTarget: 1181,
    scaTargetHours: 5122,        // month target = F26 hours − reduction target
    wdTargetPerDay: 244,
    wdAllowable: 4390,           // working-day allowance MTD (report: 91.1% used)
    cdTargetPerDay: 171,
    cdAllowable: 4439,           // calendar-day allowance MTD (report: 90.1% used)
    // Target dock hours per shift (per day) — aligned to P&D activity
    shiftHours: {
      days:      { low: null, high: null },
      afternoon: { low: null, high: null },
      midnight:  { low: null, high: null },
    },
    f27SavingsTarget: null,     // F27 cost take-out target ($)
    actions: [
      'Weekly SCA review meetings — hours vs allowance and cost per PRO tracked every week.',
      'Shift start/end times aligned to P&D activity, with target dock-hour bands per shift.',
      'Consolidating large-customer freight into fewer trailers.',
      'Demurrage and TL billing captured on every eligible shipment.',
      'Accessorial audit on freight bills (appointment, tailgate, storage, inside delivery) before invoicing.',
      'Clock-in / clock-out (CICO) discipline — late starts, missed lunches and early-offs captured as hours saved.',
    ],
  },

  // --------------------------------------------------------------------------
  // ACCESSORIALS — Accessorial unit volume report (month-reactive)
  // --------------------------------------------------------------------------
  accessorials: {
    monthly: [
      { label: 'Private residence delivery', units: 18400 },
      { label: 'Tailgate delivery', units: 6174 },
      { label: 'Appointment delivery', units: 5468 },
      { label: 'Appointment pick-up', units: 807 },
      { label: 'Tailgate pick-up', units: 630 },
      { label: 'Private residence pick-up', units: 578 },
      { label: 'Inside delivery', units: 315 },
      { label: 'Storage', units: 279 },
      { label: 'Limited access delivery', units: 90 },
      { label: 'Tradeshow delivery', units: 82 },
      { label: 'Inside pick-up', units: 64 },
      { label: 'Detention w/ power at delivery', units: 17 },
      { label: 'Limited access pick-up', units: 14 },
      { label: 'Tradeshow pick-up', units: 3 },
    ],
    weekly: [
      { label: 'Jul 13', k: 8.0 }, { label: 'Jul 20', k: 7.9 }, { label: 'Jul 27', k: 7.2 },
      { label: 'Aug 3', k: 6.3 }, { label: 'Aug 10', k: 7.6 }, { label: 'Aug 17', k: 7.1 },
      { label: 'Aug 24', k: 8.1 }, { label: 'Aug 31', k: 7.7 }, { label: 'Sep 7', k: 6.7 },
      { label: 'Sep 14', k: 7.5 }, { label: 'Sep 21', k: 6.6 }, { label: 'Sep 28*', k: 2.8 },
    ],
  },

  // --------------------------------------------------------------------------
  // LABOUR DISTRIBUTION — company employees, Terminal Labor Distribution Report
  // Q1 = Jul–Sep. F27 Q1 is to date.
  // --------------------------------------------------------------------------
  labour: {
    f26: { hours: 5700, totalPaid: 143500, regularCost: 140900, otHours: 56.7, otPaid: 2200, headCount: 16, otPct: 1.0,
           dockHours: 5205.4, dockRegCost: 131452.77, dockOtCost: 2203.88, adminHours: 446.35, adminRegCost: 9490.76 },
    f27: { hours: 6100, totalPaid: 155300, regularCost: 152300, otHours: 62.3, otPaid: 2400, headCount: 17, otPct: 1.0,
           dockHours: 5207.42, dockRegCost: 133939.99, dockOtCost: 2386.86, adminHours: 908.55, adminRegCost: 18400.58 },
    // Terminal Admin cost, Q1 (fiscal weeks 1–13), summed from the weekly cost report
    adminQ1CostByYear: [
      { fy: 'F24', cost: 21535 },
      { fy: 'F25', cost: 22665 },
      { fy: 'F26', cost: 9193 },
      { fy: 'F27', cost: 18428 },
    ],
  },

  // --------------------------------------------------------------------------
  // P&D — trip & stop measures, F27 Q1 (Jul–Sep), P&D daily totals dashboard
  // --------------------------------------------------------------------------
  pd: {
    period: 'F27 Q1 (Jul–Sep)',
    totals: [
      { label: 'Trips', v: 4608 }, { label: 'Stops', v: 45712 }, { label: 'Weight (lbs)', v: 32330382 },
      { label: 'Miles', v: 769055 }, { label: 'Bills', v: 63738 }, { label: 'Delivery bills', v: 41725 },
      { label: 'Pickup bills', v: 24401 }, { label: 'Hours', v: 21889 }, { label: 'Delivery attempts', v: 643 },
      { label: 'Pickup attempts', v: 1848 },
    ],
    ratios: [
      { label: 'Stops / trip', v: 9.92, d: 2 }, { label: 'Stops / hour', v: 2.09, d: 2 }, { label: 'Hours / trip', v: 4.75, d: 2 },
      { label: 'Bills / trip', v: 13.83, d: 2 }, { label: 'Weight / trip', v: 7017 }, { label: 'Weight / stop', v: 707 },
      { label: 'Miles / trip', v: 109.1, d: 1 }, { label: 'Miles / hour', v: 35.13, d: 2 }, { label: 'Miles / stop', v: 16.82, d: 2 },
    ],
  },

  // --------------------------------------------------------------------------
  // F27 SAVINGS PLAN — initiatives ($ per year). Edit names/amounts freely.
  // annual = F27 full-year plan, ytd = realized Jul 1 – today
  // --------------------------------------------------------------------------
  initiatives: [
    { name: 'Dock labour — shift hours aligned to P&D',     annual: null, ytd: null, status: 'In progress' },
    { name: 'Agency / contract labour reduction',            annual: null, ytd: null, status: 'In progress' },
    { name: 'CICO hours saved (late / lunch / early-off)',   annual: null, ytd: null, status: 'In progress' },
    { name: 'Accessorial billing recovery',                  annual: null, ytd: null, status: 'New' },
    { name: 'Load factor & trailer consolidation',           annual: null, ytd: null, status: 'New' },
    { name: 'Shunting optimization',                         annual: null, ytd: null, status: 'Sustained from F26' },
    { name: 'Forklift rentals returned',                     annual: null, ytd: null, status: 'Sustained from F26' },
    { name: 'Cargo claims reduction',                        annual: null, ytd: null, status: 'Sustained from F26' },
  ],

  // --------------------------------------------------------------------------
  // PRODUCTIVITY — Mississauga terminal productivity dashboard (Power BI)
  // Updated for Saturday, Sep 26, 2026 · F2027 · September MTD · Terminal
  //   PPH = weight / hours · Units/hr = units / hours · $/hr = costs / hours
  //   CWT = costs / (weight / 100) · CPU = costs / units
  // --------------------------------------------------------------------------
  productivity: {
    updatedFor: 'Sat, Sep 26, 2026',
    period: 'September MTD',
    f27: {
      pph: 3327,                  // dashboard
      pphGoal: 4258,              // dashboard — GOAL F27
      weight: 13305876,           // dashboard — lbs
      hours: 3999,                // dashboard
      units: 60933,               // dashboard
      costs: 133692,              // dashboard
      hourlyRate: 33.43,          // dashboard — $/HR F27
      unitsPerHr: 15.24,          // dashboard (15.237…)
      cwt: 1.0048,                // dashboard — cost per CWT
      cpu: 2.19,                  // dashboard — total var cost per unit
      lbsPerUnit: 218,            // dashboard
      otHours: 9,                 // dashboard
      otPct: 0.2,                 // dashboard — OT as % of hours
    },
    f26: {
      pph: 3313,                  // dashboard — PPH F2026
      weight: 20881181,           // dashboard — LBS TOTAL F2026 (September)
      hourlyRate: 31.69,          // dashboard — $/HR F26
      unitsPerHr: 12.03,          // dashboard — UNITS PER HR F2026
      cwt: 0.9566,                // dashboard — TOTAL CWT F2026
      units: 75801,               // dashboard — UNITS TOTAL F2026
      hours: 6303,                // dashboard — TOTAL HOURS F2026
      costs: 199739,              // dashboard — TOTAL COST F2026
      cpu: 2.64,                  // dashboard — TOTAL CPU F2026
    },
  },

  // --------------------------------------------------------------------------
  // LOAD FACTOR — weekly (September)
  // --------------------------------------------------------------------------
  loadFactor: {
    lfTarget: 80,
    loadTarget: 98,
    weeks: [
      { label: 'Wk 1 · Sep 1–5',   lfScore: null, loadPct: null },
      { label: 'Wk 2 · Sep 6–12',  lfScore: null, loadPct: null },
      { label: 'Wk 3 · Sep 13–19', lfScore: null, loadPct: null },
      { label: 'Wk 4 · Sep 20–26', lfScore: null, loadPct: null },
    ],
  },

  // --------------------------------------------------------------------------
  // CICO — hours saved (clock-in / clock-out controls)
  // --------------------------------------------------------------------------
  cico: {
    avgHourlyRate: 33.43,  // Sept MTD $/hr from the productivity dashboard
    weeks: [
      { label: 'Wk 1 · Sep 1–5',   hoursSaved: null },
      { label: 'Wk 2 · Sep 6–12',  hoursSaved: null },
      { label: 'Wk 3 · Sep 13–19', hoursSaved: null },
      { label: 'Wk 4 · Sep 20–26', hoursSaved: null },
    ],
    drivers: [
      'Late arrivals — pay starts at actual clock-in, not scheduled start.',
      'No-lunch punches reviewed daily by the shift supervisor.',
      'Part-time / early-off shifts released when volume is done.',
    ],
  },

  // --------------------------------------------------------------------------
  // STATUS OF THE PHYSICAL TERMINAL — urgent repairs
  // priority: 'Urgent' | 'High' | 'Planned'   status: free text
  // Rows with an empty item are hidden.
  // --------------------------------------------------------------------------
  terminal: {
    doorsTotal: null,
    doorsOutOfService: null,
    repairs: [
      { item: '', priority: 'Urgent',  estCost: null, status: '' },
      { item: '', priority: 'Urgent',  estCost: null, status: '' },
      { item: '', priority: 'High',    estCost: null, status: '' },
      { item: '', priority: 'High',    estCost: null, status: '' },
      { item: '', priority: 'Planned', estCost: null, status: '' },
    ],
  },

  // --------------------------------------------------------------------------
  // F26 RECAP — plan set July 2025 (from the F26 dashboard)
  // --------------------------------------------------------------------------
  f26: {
    f25ActualCost: 3868598,
    f26TargetCost: 3482009,
    requiredReduction: 386589,
    identifiedSavings: 427001,
    f26ActualCost: null,       // fill in F26 actual when closed
    f26ActualSavings: null,
  },
};

// ----------------------------------------------------------------------------
// Fields exposed in the "Edit data" panel.  path = location in DEFAULT_DATA.
// ----------------------------------------------------------------------------
const f = (path, label, type = 'number') => ({ path, label, type });

export const EDIT_SECTIONS = [
  {
    title: 'Safety — TRIR',
    fields: [
      f('safety.trirF27Ytd', 'TRIR F27 YTD'),
      f('safety.trirF26', 'TRIR F26 (full year)'),
      f('safety.trirTarget', 'TRIR F27 target'),
      f('safety.recordablesF27Ytd', 'Recordables F27 YTD'),
      f('safety.daysSinceLastRecordable', 'Days since last recordable'),
      f('safety.stepObservationsMtd', 'STEP observations MTD'),
    ],
  },
  {
    title: 'Service — OTS (adjusted)',
    fields: [
      f('ots.period', 'Period label', 'text'),
      f('ots.target', 'OTS target %'),
      f('ots.last7Pct', '7-day avg %'),
      f('ots.months.8.incl', 'Sept % incl. partners'),
      f('ots.months.8.excl', 'Sept % excl. partners'),
      f('ots.inclPartners.pct', 'YTD % incl. partners'),
      f('ots.inclPartners.lateFbs', 'YTD late FBs incl. partners'),
      f('ots.inclPartners.onTimeFbs', 'YTD on-time FBs incl. partners'),
      f('ots.exclPartners.pct', 'YTD % excl. partners'),
      f('ots.exclPartners.lateFbs', 'YTD late FBs excl. partners'),
      f('ots.exclPartners.onTimeFbs', 'YTD on-time FBs excl. partners'),
    ],
  },
  {
    title: 'Service — Missed Pickups',
    fields: [
      f('missedPu.missedPct', 'Missed PU % (all dates)'),
      f('missedPu.last7Pct', 'Missed PU % 7-day avg'),
      f('missedPu.totalMissed', 'Total missed PUs'),
      f('missedPu.totalMeasured', 'Total measured PUs'),
      f('missedPu.falsePositiveCount', 'OPS false positives'),
    ],
  },
  {
    title: 'Service — Scanning',
    fields: [
      f('scanning.dateRange', 'Date range', 'text'),
      f('scanning.target', 'Scanning target % (optional)'),
      f('scanning.measures.0.pct', 'FBs scanned %'),
      f('scanning.measures.1.pct', 'FBs completely scanned %'),
      f('scanning.measures.2.pct', 'Items scanned %'),
    ],
  },
  {
    title: 'SCA — Hours & Cost (Sept MTD)',
    fields: [
      f('sca.updatedFor', 'Updated for', 'text'),
      f('sca.wdMtd', 'Working days elapsed'),
      f('sca.wdMonth', 'Working days in month'),
      f('sca.costPerProMtd', 'Cost per PRO MTD ($)'),
      f('sca.costPerProTarget', 'Cost per PRO target ($)'),
      f('sca.costPerProPctOfTarget', 'Cost per PRO % of target'),
      f('sca.fbCountMtd', 'FB count MTD'),
      f('sca.f27Hours', 'F27 total hours'),
      f('sca.f27CompanyHours', 'F27 company hours'),
      f('sca.f27AgencyHours', 'F27 agency hours'),
      f('sca.f26Hours', 'F26 total hours'),
      f('sca.f26CompanyHours', 'F26 company hours'),
      f('sca.f26AgencyHours', 'F26 agency hours'),
      f('sca.hourReductionTarget', 'Hour reduction target'),
      f('sca.scaTargetHours', 'SCA target hours (month)'),
      f('sca.wdAllowable', 'Allowable hours MTD (working days)'),
      f('sca.cdAllowable', 'Allowable hours MTD (calendar days)'),
      f('sca.f27TotalCost', 'F27 total cost ($)'),
      f('sca.f27CompanyCost', 'F27 company cost ($)'),
      f('sca.f27AgencyCost', 'F27 agency cost ($)'),
      f('sca.f26TotalCost', 'F26 total cost ($)'),
      f('sca.f26CompanyCost', 'F26 company cost ($)'),
      f('sca.f26AgencyCost', 'F26 agency cost ($)'),
      f('sca.f27SavingsTarget', 'F27 cost take-out target ($)'),
      f('sca.shiftHours.days.low', 'Days — dock hrs low'),
      f('sca.shiftHours.days.high', 'Days — dock hrs high'),
      f('sca.shiftHours.afternoon.low', 'Afternoon — dock hrs low'),
      f('sca.shiftHours.afternoon.high', 'Afternoon — dock hrs high'),
      f('sca.shiftHours.midnight.low', 'Midnight — dock hrs low'),
      f('sca.shiftHours.midnight.high', 'Midnight — dock hrs high'),
    ],
  },
  {
    title: 'F27 Savings Initiatives',
    fields: DEFAULT_DATA.initiatives.flatMap((_, i) => [
      f(`initiatives.${i}.name`, `#${i + 1} name`, 'text'),
      f(`initiatives.${i}.annual`, `#${i + 1} F27 plan ($)`),
      f(`initiatives.${i}.ytd`, `#${i + 1} realized YTD ($)`),
      f(`initiatives.${i}.status`, `#${i + 1} status`, 'text'),
    ]),
  },
  {
    title: 'Productivity (Sept MTD)',
    fields: [
      f('productivity.updatedFor', 'Updated for', 'text'),
      f('productivity.period', 'Period label', 'text'),
      f('productivity.f27.pph', 'PPH F27'),
      f('productivity.f27.pphGoal', 'PPH goal F27'),
      f('productivity.f26.pph', 'PPH F26'),
      f('productivity.f27.weight', 'Weight F27 (lbs)'),
      f('productivity.f26.weight', 'Weight F26 (lbs)'),
      f('productivity.f27.hours', 'Hours F27'),
      f('productivity.f27.units', 'Units F27'),
      f('productivity.f27.costs', 'Costs F27 ($)'),
      f('productivity.f27.hourlyRate', '$/hr F27'),
      f('productivity.f26.hourlyRate', '$/hr F26'),
      f('productivity.f27.unitsPerHr', 'Units/hr F27'),
      f('productivity.f26.unitsPerHr', 'Units/hr F26'),
      f('productivity.f27.cwt', 'Cost per CWT F27 ($)'),
      f('productivity.f26.cwt', 'Cost per CWT F26 ($)'),
      f('productivity.f27.cpu', 'Cost per unit F27 ($)'),
      f('productivity.f26.cpu', 'Cost per unit F26 ($)'),
      f('productivity.f26.units', 'Units F26'),
      f('productivity.f27.lbsPerUnit', 'Lbs per unit F27'),
      f('productivity.f27.otHours', 'OT hours'),
      f('productivity.f27.otPct', 'OT as % of hours'),
    ],
  },
  {
    title: 'Load Factor',
    fields: DEFAULT_DATA.loadFactor.weeks.flatMap((w, i) => [
      f(`loadFactor.weeks.${i}.label`, `Week ${i + 1} label`, 'text'),
      f(`loadFactor.weeks.${i}.lfScore`, `Week ${i + 1} LF score %`),
      f(`loadFactor.weeks.${i}.loadPct`, `Week ${i + 1} load %`),
    ]),
  },
  {
    title: 'CICO Hours Saved',
    fields: [
      f('cico.avgHourlyRate', 'Avg loaded hourly rate ($)'),
      ...DEFAULT_DATA.cico.weeks.flatMap((w, i) => [
        f(`cico.weeks.${i}.label`, `Week ${i + 1} label`, 'text'),
        f(`cico.weeks.${i}.hoursSaved`, `Week ${i + 1} hours saved`),
      ]),
    ],
  },
  {
    title: 'Physical Terminal',
    fields: [
      f('terminal.doorsTotal', 'Total dock doors'),
      f('terminal.doorsOutOfService', 'Doors out of service'),
      ...DEFAULT_DATA.terminal.repairs.flatMap((_, i) => [
        f(`terminal.repairs.${i}.item`, `Repair ${i + 1} — item`, 'text'),
        f(`terminal.repairs.${i}.priority`, `Repair ${i + 1} — priority`, 'text'),
        f(`terminal.repairs.${i}.estCost`, `Repair ${i + 1} — est. cost ($)`),
        f(`terminal.repairs.${i}.status`, `Repair ${i + 1} — status`, 'text'),
      ]),
    ],
  },
  {
    title: 'F26 Recap',
    fields: [
      f('f26.f26ActualCost', 'F26 actual cost ($)'),
      f('f26.f26ActualSavings', 'F26 actual savings ($)'),
    ],
  },
];
