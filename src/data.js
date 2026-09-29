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
    practices: [
      'Supervisors and managers are accountable for STEP observations — non-compliance is addressed on the spot and documented on the OHS shared drive.',
      'Tailgates every shift; forklift pre- and post-shift inspections; shunt pre-trip meeting every shift using the new checklist.',
      'Chock check on every door (spares on hand). Daily placard check with the yard check; drivers remove placards when shunts are called.',
      'No loading forklifts on straight trucks — prevents serious injuries and equipment damage.',
      'Safety equipment and dock conditions inspected and logged on the H&S inspection sheet, collected monthly by OHS and reviewed at JHSC.',
    ],
    incidentProcess: [
      'Every incident reported promptly; supervisors work directly with OHS on WSIB forms and a safe return to work.',
      'Root cause and action plan reviewed with OHS for every incident to prevent repeats.',
      'Monthly safety e-learning for supervisors and managers on topics tied to our operation.',
      'Forklift and TDG certifications renewed before they expire.',
    ],
    f27Plans: [
      'Weekly STEP observation target per supervisor, reviewed in the Monday ops meeting.',
      'Near-miss reporting push — every near miss logged and discussed at the next tailgate.',
      'Certification tracker (forklift / TDG) with 30-day expiry alerts.',
    ],
  },

  // --------------------------------------------------------------------------
  // SERVICE — OTS (On-Time Service)
  // Percentages are calculated for you from the counts.
  //   UNADJ% = On-time FBs / Total FBs
  //   ADJ%   = (Total FBs − ADJ lates) / Total FBs
  // --------------------------------------------------------------------------
  ots: {
    period: 'Sept MTD',
    target: null,           // e.g. 95 (% adjusted)
    totalFbs: null,
    onTimeFbs: null,
    unadjLates: null,
    adjLates: null,
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
      'Interline (IN) and transborder (TB) lates reviewed with the interline team — outside terminal control.',
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
  scanning: {
    dateRange: 'Sep 6 – Sep 11, 2026',
    deliveryPct: null,          // Delivery trips
    deliveryFytdPct: null,
    lineHaulOutPct: null,       // Line Haul (Outbound)
    lineHaulOutFytdPct: null,
    lineHaulInPct: null,        // Line Haul (Inbound)
    pickupPct: null,            // Pickup trips
    target: 98,
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
    costPerProTarget: 6.85,      // report shows 96.3% of target (amber / watch)
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
    title: 'Service — OTS',
    fields: [
      f('ots.period', 'Period label', 'text'),
      f('ots.target', 'OTS target (adj %)'),
      f('ots.totalFbs', "Total FB's"),
      f('ots.onTimeFbs', "On-time FB's"),
      f('ots.unadjLates', 'UNADJ lates'),
      f('ots.adjLates', 'ADJ lates'),
      ...['AS', 'BD', 'OT', 'TF', 'LH', 'DL', 'MS', 'IN', 'TB', 'OTHER', 'UNCODED'].map((c) =>
        f(`ots.codes.${c}`, `Late code ${c}`)
      ),
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
      f('scanning.deliveryPct', 'Delivery trips %'),
      f('scanning.deliveryFytdPct', 'Delivery fiscal YTD %'),
      f('scanning.lineHaulOutPct', 'Line haul outbound %'),
      f('scanning.lineHaulOutFytdPct', 'Line haul outbound fiscal YTD %'),
      f('scanning.lineHaulInPct', 'Line haul inbound %'),
      f('scanning.pickupPct', 'Pickup trips %'),
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
