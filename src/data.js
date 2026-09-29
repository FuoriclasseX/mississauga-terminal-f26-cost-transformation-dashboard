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
    // Management Control Report — F27 TRIR, Aug-26 · "Mississauga - Commerce Solutions"
    trirAugMonth: 0,
    trirF27Ytd: 0,
    trirF26: 1.21,
    trir12mmAvg: 1.21,
    trirTarget: null,        // no target given
    recordablesF27Ytd: 0,    // employee + contractor incidents YTD
    lastRecordableDate: '2025-09-10', // days since is calculated from today
    daysSinceLastRecordable: null,
    stepObservationsMtd: null,
    // Safety initiatives — status (confirm "Completed" items)
    initiatives: [
      { name: 'Roofing work zones barricaded — no access under overhead work', status: 'Completed', note: 'In place while roofing continues' },
      { name: 'N95 masks made readily available on the dock during roofing', status: 'Completed', note: 'Supply in place' },
      { name: 'New shunt pre-trip checklist rolled out — used every shift', status: 'Completed', note: 'Now part of every shift' },
      { name: 'Freight-handling equipment — panel carts, cages and racks', status: 'Planned', note: 'Glass, TVs, panels, car parts — see Equipment & Terminal' },
      { name: 'Load securement & decking — ANCRA decks, divider kits, collapsible tables', status: 'Planned', note: 'Second tier, loads locked in place' },
      { name: 'Driver safety reps at the monthly safety meeting', status: 'Planned', note: 'To agree with Safety' },
      { name: 'Manager & supervisor ride-alongs — quarterly quota', status: 'Planned', note: 'To agree with Safety' },
      { name: 'Peak ramp-up onboarding with Safety — new temp (agency) staff', status: 'Planned', note: 'Supported by Safety · when peak needs 10%+ new temps' },
      { name: 'Tailgates + safety moments after every incident (e.g. pinch points)', status: 'Active' },
      { name: 'Forklift pre/post-shift inspections by every operator', status: 'Active' },
      { name: 'No loading forklifts on straight trucks', status: 'Active' },
      { name: 'Monthly H&S inspections → OHS, reviewed at JHSC', status: 'Active' },
      { name: 'STEP observations — non-compliance addressed and logged', status: 'Active' },
      { name: 'Incident reporting, root cause and corrective-action follow-up with OHS', status: 'Active' },
      { name: 'Monthly safety e-learning; forklift & TDG renewed before expiry', status: 'Active' },
    ],
    // Ideas to action (drafts — edit freely)
    // Driver-led safety — proposal to take to Safety (OHS)
    quote: 'If we prioritize safety, then service, productivity and cost all fall into place. When a workplace is safe and people feel heard and respected, the rest follows.',
    driverProgram: {
      drivers: 50,                 // example fleet size — set to the actual Mississauga driver count
      rampPct: [0.6, 0.8, 1],      // Q2, Q3, Q4 as a share of full pace (every driver once a year)
      rampLabels: ['Q2 (Oct–Dec)', 'Q3 (Jan–Mar)', 'Q4 (Apr–Jun)'],
    },
    ideas: [
      'New-building safety plan: pre-move hazard walk, dock door / leveler / lighting inspection, traffic and pedestrian plan, layout training before go-live.',
      'Near-miss reporting: every near miss logged and reviewed at the next tailgate; monthly trend at JHSC.',
      'Pedestrian–forklift separation: marked walkways and blue-spot lights on forklifts.',
      'Trailer securement audit each shift: chocks / dock locks and trailer-creep checks.',
      'Winter readiness: yard salting schedule, ice cleats and slip-hazard checks before first frost.',
      'Recognition for zero-incident shifts to reinforce safe behaviour.',
    ],
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
    ],
  },

  // F27 KPI goal plan (company goals) vs Mississauga — months = Jul, Aug, Sep actuals
  kpiGoals: [
    { kpi: 'On-time service', sub: 'incl. interliners', unit: '%', better: 'up', months: [89.3, 91.7, 93.7], current: 93.7, currentLabel: 'Sep', goal: 91, stretch: 94,
      bands: 'Achieved 91–92% · Exceeded 92–94% · S. Exceeded >94%', rating: 'Exceeded', plan: 'On track — up every month since July. Hold 92%+ through peak.' },
    { kpi: 'Missed pickups', sub: '% of pickups', unit: '%', better: 'down', months: [4.88, 3.66, 5.23], current: 5.23, currentLabel: 'Sep MTD', goal: 1, stretch: 0.5,
      bands: 'Achieved 1% · Exceeded 0.6–0.9% · S. Exceeded ≤0.5%', rating: 'Needs improvement', plan: 'Gap to goal. ≈45% are OPS false positives — the close-out fix and daily PU review close most of it.' },
    { kpi: 'Load factor — headhaul', sub: 'average load %', unit: '%', better: 'up', months: [79.6, 71.5, 72.8], current: 74.9, currentLabel: 'Jul–Sep', goal: 74, stretch: 76,
      bands: 'Achieved 74% · Exceeded 75–76% · S. Exceeded >76%', rating: 'Achieved', plan: 'At goal for F27 so far (75.7% excl. Moncton). Sep dipped to 72.8% — Toyota footage fix and decking lift it.' },
    { kpi: 'Damages', sub: 'claims per 1,000 FBs', bands: 'Achieved 3.5 · Exceeded 3.3–3.49 · S. Exceeded <3.3', rating: null, plan: 'Measure to confirm' },
    { kpi: 'Reweighs', sub: 'national goal', bands: 'Achieved 4,760–5,236 · Exceeded 5,237–5,712 · S. Exceeded >5,712', rating: null, plan: 'Sep at 131.8% of the terminal target' },
    { kpi: 'Cubing', sub: '', bands: 'Achieved 0.45–0.5% · Exceeded 0.40–0.45% · S. Exceeded <0.40%', rating: null, plan: 'Measure to confirm' },
  ],

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
    // Terminal OTS report — Mississauga weekly. Late codes are shares of unadjusted lates; AS is not a service fail.
    weeks: [
      { label: 'Week 39', note: 'full week', fbs: 3458, onTime: 2957, unadjLates: 501, adjLates: 180, unadjPct: 85.51, adjPct: 94.79,
        codes: { AS: 435, TF: 22, UNCODED: 14, IN: 9, OTHER: 9, DL: 8, OT: 3, LH: 1 } },
      { label: 'Week 40', note: 'Sep 27–28, partial', fbs: 840, onTime: 750, unadjLates: 90, adjLates: 29, unadjPct: 89.29, adjPct: 96.55,
        codes: { AS: 82, UNCODED: 3, OT: 2, IN: 2, OTHER: 1 } },
    ],
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
      'Scanning compliance checked every shift.',
      'Terminal and P&D teams working together on hand-offs.',
      'End-of-shift reporting on afternoons — every late coded before shift end.',
      'Partner-carrier (beyond interliner) lates reviewed weekly with the interline team.',
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
      { label: 'Cancelled / other', count: null, pct: 5.6 },
    ],
    topReasons: [
      { label: 'Already serviced',   count: 1390, pct: 40.73 },
      { label: 'Not ready',          count: 620,  pct: 18.24 },
      { label: 'Customer issue – other',  count: 290,  pct: 8.46 },
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
    ],
    actions: [
      'Close-out discipline: every serviced pickup scanned/closed before the driver leaves — removes "already serviced" false positives.',
      'Daily review of the prior day\'s missed PU list before 10:00.',
      '"Not ready" pickups re-booked the same day with the customer, and coded correctly.',
    ],
  },

  // Cargo claims — claims report, terminal T-0502 (Mississauga)
  claims: {
    terminalCode: 'T-0502',
    amount: 13432.53,
    period: 'August 2026',    // September not closed yet
  },

  // --------------------------------------------------------------------------
  // SERVICE — SCANNING COMPLIANCE (Freight Bills Scanned %)
  // --------------------------------------------------------------------------
  // % Damaged FB dashboard — Mississauga (PU terminal), to Sep 28, 2026
  damage: {
    last7Pct: 1.61,
    last7Days: [
      { label: 'Sep 22', pct: 3.34 },
      { label: 'Sep 23', pct: 2.32 },
      { label: 'Sep 24', pct: 2.22 },
      { label: 'Sep 25', pct: 1.9 },
      { label: 'Sep 27', pct: 0.39 },
      { label: 'Sep 28', pct: 0.31 },
    ],
    week39: 2.1,
    week40: 0.31,              // partial week
  },

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
    // Workforce mix per shift — headcount (dock + admin), agency vs D&R
    // Example day — Wed Sep 9, 2026. Hours: shift report (target vs actual, dock).
    // Headcount: timesheet, people who worked that day; not Day & Ross = agency; dock/admin by department (admin incl. dispatch).
    workforceDate: 'Wed Sep 9, 2026',
    workforce: [
      { shift: 'AM (Inbound)', target: 40, actual: 42.63, drDock: 2, agencyDock: 6, drAdmin: 0, agencyAdmin: 2 },
      { shift: 'Day', target: 64, actual: 62.67, drDock: 5, agencyDock: 7, drAdmin: 0, agencyAdmin: 13 },
      { shift: 'PM (Outbound)', target: 96, actual: 95.03, drDock: 4, agencyDock: 9, drAdmin: 1, agencyAdmin: 7 },
    ],
    driverLoaders: { target: 8, actual: 7 },
    f27SavingsTarget: null,     // F27 cost take-out target ($)
    actions: [
      'Weekly SCA review meetings — hours vs allowance and cost per PRO tracked every week.',
      'Shift start/end times aligned to P&D activity; agency vs D&R mix managed per shift.',
      'Accessorials checked on freight bills (appointment, tailgate, storage, inside delivery) before invoicing.',
      'Clock-in / clock-out (CICO) discipline — late starts, missed lunches and early-offs tracked every shift.',
    ],
  },

  // --------------------------------------------------------------------------
  // ACCESSORIALS — Accessorial report, D&R Commerce Mississauga, ON
  // Responsible party Driver / Terminal / Auto-billed · Mar 30 – Sep 29 2026
  // target = report "Monthly Dollar Target" ($ per unit) · Sep = to Sep 29
  // --------------------------------------------------------------------------
  accessorials: {
    period: 'Apr – Sep 2026 · Sep to the 29th',
    months: [
      { m: 'Apr', usd: 329060, units: 41891 },
      { m: 'May', usd: 283452, units: 42620 },
      { m: 'Jun', usd: 254927, units: 46561 },
      { m: 'Jul', usd: 266881, units: 45213 },
      { m: 'Aug', usd: 253490, units: 38154 },
      { m: 'Sep*', usd: 238339, units: 35052 },
    ],
    f27ToDate: { usd: 758710, units: 118419, label: 'Jul 1 – Sep 29' },
    // Sep 2026 by code, sorted by F27-to-date $ (Jul–Sep)
    codes: [
      { code: 'TLGDL', label: 'Tailgate delivery', units: 5775, usd: 89072, avg: 15.42, target: 16.15, f27: 304286 },
      { code: 'PRESDL', label: 'Private residence delivery', units: 17659, usd: 81174, avg: 4.60, target: 4.76, f27: 261470 },
      { code: 'APPTDL', label: 'Appointment delivery', units: 5245, usd: 22204, avg: 4.23, target: 3.97, f27: 68752 },
      { code: 'APPTPU', label: 'Appointment pick-up', units: 762, usd: 11935, avg: 15.66, target: 14.51, f27: 36955 },
      { code: 'TLGPU', label: 'Tailgate pick-up', units: 628, usd: 8911, avg: 14.19, target: 13.98, f27: 23303 },
      { code: 'STORAG', label: 'Storage', units: 269, usd: 7648, avg: 28.43, target: 31.65, f27: 15649 },
      { code: 'PRESPU', label: 'Private residence pick-up', units: 560, usd: 4263, avg: 7.61, target: 7.23, f27: 13105 },
      { code: 'REDELY', label: 'Redelivery', units: 97, usd: 2400, avg: 24.75, target: null, f27: 10972 },
      { code: 'TRDSDL', label: 'Tradeshow delivery', units: 77, usd: 5748, avg: 74.65, target: 87.79, f27: 7387 },
      { code: 'AFHRDL', label: 'After-hours delivery', units: 3130, usd: 2250, avg: 0.72, target: null, f27: 7045 },
      { code: 'INSDDL', label: 'Inside delivery', units: 292, usd: 1873, avg: 6.42, target: 5.82, f27: 6450 },
      { code: 'DRREWEIGH', label: 'D&R reweigh', units: 380, usd: 252, avg: 0.66, target: null, f27: 1318 },
      { code: 'DETPDL', label: 'Detention w/ power at delivery', units: 14, usd: 0, avg: 0, target: 14.08, f27: 812 },
      { code: 'INSDPU', label: 'Inside pick-up', units: 63, usd: 141, avg: 2.23, target: 3.47, f27: 540 },
      { code: 'LTDADL', label: 'Limited access delivery', units: 84, usd: 335, avg: 3.99, target: 2.40, f27: 405 },
      { code: 'LTDAPU', label: 'Limited access pick-up', units: 14, usd: 133, avg: 9.46, target: 7.39, f27: 260 },
    ],
    gapBelowTarget: 9230,   // Sep: Σ (target − avg) × units on codes below target
    actions: [
      'Tailgate and residential delivery are 74% of accessorial $ — both a little under the $/unit target in Sep. Check every one is rated before invoicing.',
      'Detention: 14 units in Sep billed $0 — driver times recorded so it can be billed.',
      'After-hours delivery: 3,130 units at $0.72 each — review which ones should bill.',
    ],
  },

  // --------------------------------------------------------------------------
  // FORK TRUCK REWEIGHS — Fork Truck Reweighs dashboard, Mississauga (origin)
  // Target = 100% of reweigh target (80–100 amber, <80 red)
  // --------------------------------------------------------------------------
  reweighs: {
    target: 100,
    last7Pct: 123.28,
    totalReweighs: 44283,
    totalTarget: 52000,          // dashboard shows 52K
    overallPct: 85.16,           // all selected scan dates, incl. March ramp-up
    byMonth: [
      { label: 'Mar', fy: 'F26', pct: 75.4 },
      { label: 'Apr', fy: 'F26', pct: 144.3 },
      { label: 'May', fy: 'F26', pct: 111.5 },
      { label: 'Jun', fy: 'F26', pct: 124.1 },
      { label: 'Jul', fy: 'F27', pct: 143.9 },
      { label: 'Aug', fy: 'F27', pct: 126.4 },
      { label: 'Sep', fy: 'F27', pct: 131.8 },
    ],
    recentWeeks: [
      { label: 'Wk 38', pct: 128.2 },
      { label: 'Wk 39', pct: 130.8 },
      { label: 'Wk 40*', pct: 93.2 },
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
      { label: 'Bills / trip', v: 13.83, d: 2 }, { label: 'Lbs / trip', v: 7017 }, { label: 'Lbs / stop', v: 707 },
      { label: 'Miles / hour', v: 35.13, d: 2 }, { label: 'Miles / stop', v: 16.82, d: 2 },
    ],
  },

  // --------------------------------------------------------------------------
  // F27 SAVINGS PLAN — initiatives ($ per year). Edit names/amounts freely.
  // annual = F27 full-year plan, ytd = realized Jul 1 – today
  // --------------------------------------------------------------------------
  // status: 'Confirmed' | 'In progress' | 'Planned' | 'Opportunity'
  initiatives: [
    { name: 'Dispatcher role eliminated', category: 'Admin labour', annual: 61000, ytd: null, status: 'Confirmed',
      description: 'Dispatch centralized — dispatcher seat no longer needed.', detail: 'Permanent role reduction; full-year value once effective.' },
    { name: 'Agency labour mix', category: 'Dock labour', annual: null, ytd: null, status: 'In progress',
      description: 'Keep agency share of dock hours down (61.4% Sept MTD vs 70.5% in F26 Sept).', detail: 'Agency hours 4,443 → 2,457 and agency cost $130K → $75K (F26 Sept full month vs F27 Sept MTD).' },
    { name: 'Hours under SCA allowance', category: 'Dock labour', annual: null, ytd: null, status: 'In progress',
      description: 'Run at or below the monthly SCA hour target (Sept 5,122 hrs).', detail: 'Sept MTD 391 hrs under allowance ≈ $13.1K; on pace for 139% of the hour-reduction target.' },
    { name: 'Load securement & decking', category: 'Linehaul / load factor', annual: null, ytd: null, status: 'Planned',
      description: 'ANCRA decks, divider deck-board kits and collapsible load tables — use the top half of the trailer; tables fold and stack when empty.', detail: 'Load factor score 36.4% in F27 — every point of load factor reduces linehaul cost per lb.' },
    { name: 'Freight-handling equipment', category: 'Claims & damage', annual: null, ytd: null, status: 'Planned',
      description: 'Panel carts / racks for glass shower doors, TVs, panels, car parts.', detail: 'Damaged FB 1.61% (7-day); claims $13.4K in August.' },
    { name: 'Accessorial capture', category: 'Revenue protection', annual: null, ytd: null, status: 'In progress',
      description: 'Every accessorial coded before invoicing (residential, tailgate, appointment…).', detail: 'Sep: 7 of 13 codes at or above the $/unit target; tailgate and residential delivery slightly under.', captured: 758710, capturedLabel: 'accessorial revenue F27 to date (Jul 1 – Sep 29)' },
    { name: 'Toyota baseload footage capture', category: 'Revenue / load factor', annual: null, ytd: null, status: 'In progress',
      description: 'Capture Toyota (Bowmanville) linear footage correctly.', detail: 'Moncton lane (Toyota baseload): 20.5% of bills have no cube recorded vs 3.0% on other lanes.' },
  ],

  // --------------------------------------------------------------------------
  // PRODUCTIVITY — Mississauga terminal productivity dashboard (Power BI)
  // Updated for Saturday, Sep 26, 2026 · F2027 · September MTD · Terminal
  //   PPH = weight / hours · Units/hr = units / hours · $/hr = costs / hours
  //   CWT = costs / (weight / 100) · CPU = costs / units
  // --------------------------------------------------------------------------
  spend: {
    source: 'Terminal Analysis (Aug 2026) and net-amount pivot by department — Mississauga 1514',
    period: 'F27 YTD = Jul–Aug 2026 vs same months F26 (Jul–Aug 2025)',
    // Monthly P&L. admin incl. Accidents & Damages; pd incl. fuel subsidy and TL. pros = PRO count in + out (LTL + TL).
    // lbs = LTL PRO weight in + out, excl. transfer weight credits (credits added to shipped weight from Mar 2026).
    months: [
      { label: 'Jul 25', fy: 'F26', admin: 404948, dock: 344250, pd: 934448, total: 1683646, pros: 42253, lbs: 12035180, xferLbs: null, revenue: 3011897 },
      { label: 'Aug 25', fy: 'F26', admin: 366709, dock: 343455, pd: 860325, total: 1570489, pros: 35096, lbs: 10461184, xferLbs: null, revenue: 2357788 },
      { label: 'Sep 25', fy: 'F26', admin: 359887, dock: 300474, pd: 677415, total: 1337777, pros: 35611, lbs: 10296765, xferLbs: null, revenue: 2396899 },
      { label: 'Oct 25', fy: 'F26', admin: 353504, dock: 312285, pd: 732174, total: 1397963, pros: 34980, lbs: 10506168, xferLbs: null, revenue: 2382063 },
      { label: 'Nov 25', fy: 'F26', admin: 336971, dock: 285101, pd: 757672, total: 1379744, pros: 35686, lbs: 9220554, xferLbs: null, revenue: 2284738 },
      { label: 'Dec 25', fy: 'F26', admin: 351869, dock: 297280, pd: 631732, total: 1280881, pros: 32768, lbs: 7922310, xferLbs: null, revenue: 2037918 },
      { label: 'Jan 26', fy: 'F26', admin: 338760, dock: 280044, pd: 575791, total: 1194595, pros: 28426, lbs: 7374565, xferLbs: null, revenue: 1729661 },
      { label: 'Feb 26', fy: 'F26', admin: 285408, dock: 212451, pd: 429431, total: 927290, pros: 24040, lbs: 6942234, xferLbs: null, revenue: 1618171 },
      { label: 'Mar 26', fy: 'F26', admin: 319908, dock: 297461, pd: 550893, total: 1168261, pros: 35457, lbs: 6858984, xferLbs: 2002743, revenue: -5347 },
      { label: 'Apr 26', fy: 'F26', admin: 333624, dock: 304078, pd: 672564, total: 1310267, pros: 42906, lbs: 11205341, xferLbs: 4429928, revenue: 21189 },
      { label: 'May 26', fy: 'F26', admin: 338450, dock: 272374, pd: 653371, total: 1264195, pros: 48409, lbs: 12786872, xferLbs: 3871203, revenue: 35873 },
      { label: 'Jun 26', fy: 'F26', admin: 382078, dock: 410023, pd: 704605, total: 1496706, pros: 42956, lbs: 12421602, xferLbs: 3885371, revenue: 26162 },
      { label: 'Jul 26', fy: 'F27', admin: 369345, dock: 324421, pd: 692345, total: 1386110, pros: 38409, lbs: 10970615, xferLbs: 4214283, revenue: 34308 },
      { label: 'Aug 26', fy: 'F27', admin: 339960, dock: 271401, pd: 567934, total: 1179295, pros: 32983, lbs: 9148530, xferLbs: 3521113, revenue: 23009 },
    ],
    // Cost % of revenue before the break — F25 months from the F26 cost-transformation dashboard (Terminal Analysis)
    priorRatio: [
      { label: 'Jul 24', ratio: 58.82 }, { label: 'Aug 24', ratio: 58.29 }, { label: 'Sep 24', ratio: 62.84 },
      { label: 'Oct 24', ratio: 60.02 }, { label: 'Nov 24', ratio: 76.12 }, { label: 'Dec 24', ratio: 74.98 },
      { label: 'Jan 25', ratio: 73.83 }, { label: 'Feb 25', ratio: 60.79 }, { label: 'Mar 25', ratio: 53.1 },
      { label: 'Apr 25', ratio: 54.55 }, { label: 'May 25', ratio: 55.3 }, { label: 'Jun 25', ratio: 55.78 },
    ],
    revenueValidThrough: 'Feb 26',
    // Largest line changes, F27 Jul–Aug vs F26 Jul–Aug
    drivers: [
      { line: 'Agent driver cost (P&D)', f26: 645928, f27: 23067, type: 'P&D mix' },
      { line: 'Terminal fuel subsidy', f26: 127325, f27: 10508, type: 'P&D mix' },
      { line: 'Owner operator accessorial (P&D)', f26: 204620, f27: 307673, type: 'P&D mix' },
      { line: 'Contract labour — Terminal Admin', f26: 244520, f27: 182708, type: 'Terminal' },
      { line: 'Contract labour — dock', f26: 328741, f27: 310298, type: 'Terminal' },
      { line: 'Repairs & maintenance (dock + building)', f26: 100841, f27: 55386, type: 'Terminal' },
      { line: 'D&R employee wages & benefits (dock + admin)', f26: 356556, f27: 365089, type: 'Terminal' },
      { line: 'Cargo claims (Aug per claims report)', f26: 24024, f27: 38651, type: 'Terminal' },
      { line: 'Property tax', f26: 41578, f27: 55550, type: 'Fixed' },
    ],
  },

  // F27 savings outlook — P&L lines, F26 (Jul 25–Jun 26) by month and F27 actuals (Jul, Aug 26).
  // Outlook: each line's Jul–Aug % change vs the same months F26, applied to the remaining F26 months.
  savingsOutlook: {
    months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    actualMonths: 2,
    lines: [
      { group: 'Admin labour', line: 'Contract labour — Admin (agency)', f26: [135047,  109473,  110074,  99252,  91964,  74834,  88977,  75197,  90275,  96708,  79029,  128244], f27: [95401,  87307] },
      { group: 'Dock labour', line: 'Contract labour — Dock (agency temp workers)', f26: [179106,  149635,  130011,  135846,  114485,  85915,  104657,  86199,  139323,  143129,  125961,  248494], f27: [172146,  138152] },
    ],
  },

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
  // Load factor report — Mississauga outbound, F27 (ready date: all)
  // LF score = % of loads with LF > 80% · Load % = average load percentage
  loadFactor: {
    lfTarget: null,          // no target provided
    loadTarget: null,
    months: [
      { label: 'Jul', loads: 316, lfScore: 38.9, loadPct: 79.6, over80: 123 },
      { label: 'Aug', loads: 293, lfScore: 33.4, loadPct: 71.5, over80: 98 },
      { label: 'Sep', loads: 245, lfScore: 36.7, loadPct: 72.8, over80: 90 },
    ],
    total: { loads: 854, lfScore: 36.4, loadPct: 74.9, over80: 311, over100: 100, bills: 55862, billsNoCube: 3166 },
    buckets: [
      { label: '≤60%', loads: 237 },
      { label: '61–79%', loads: 306 },
      { label: '80–90%', loads: 150 },
      { label: '≥91%', loads: 161 },
    ],
    // LF score / load % by lane: [Jul, Aug, Sep]
    lanes: [
      { lane: 'Burnaby', lf: [69.6, 81.8, 89.5], load: [91.4, 93.8, 95.6] },
      { lane: 'Winnipeg', lf: [61.3, 57.7, 76.5], load: [94.7, 103.0, 86.6] },
      { lane: 'Calgary', lf: [59.1, 57.9, 54.5], load: [83.4, 94.9, 82.1] },
      { lane: 'Edmonton', lf: [47.4, 46.7, 35.7], load: [81.1, 77.5, 80.9] },
      { lane: 'Montreal', lf: [47.8, 42.9, 34.5], load: [77.3, 71.3, 72.7] },
      { lane: 'Woodstock', lf: [42.6, 34.0, 17.9], load: [89.4, 76.6, 62.7] },
      { lane: 'Ottawa', lf: [22.2, 29.4, 37.5], load: [69.3, 70.8, 76.7] },
      { lane: 'Moncton', lf: [26.2, 13.6, 33.3], load: [81.3, 54.7, 79.2] },
      { lane: 'Dartmouth', lf: [7.1, 14.3, 8.3], load: [67.3, 69.1, 63.5] },
      { lane: 'Quebec City', lf: [12.5, 0.0, 0.0], load: [60.6, 45.1, 42.4] },
      { lane: 'Windsor', lf: [6.7, 0.0, 0.0], load: [38.5, 36.6, 33.5] },
    ],
    // Moncton lane by month (for the "excluding Moncton" view)
    moncton: [
      { label: 'Jul', loads: 61, over80: 16, loadPct: 81.3, bills: 3266, noCube: 627 },
      { label: 'Aug', loads: 59, over80: 8, loadPct: 54.7, bills: 2897, noCube: 600 },
      { label: 'Sep', loads: 48, over80: 16, loadPct: 79.2, bills: 2466, noCube: 544 },
    ],
    monthBills: [
      { label: 'Jul', bills: 21169, noCube: 1230 },
      { label: 'Aug', bills: 18759, noCube: 968 },
      { label: 'Sep', bills: 15934, noCube: 968 },
    ],
    // Distance bands as grouped in the report (lane type = "Not Defined" for all loads)
    bands: [
      { band: '<500', lanes: 'Montreal, Ottawa, Windsor, Woodstock', months: [[128, 49, 78.6], [118, 37, 68.4], [97, 24, 64.7]] },
      { band: '<1,000', lanes: 'Moncton, Quebec City', months: [[75, 16, 72.7], [75, 8, 52.6], [62, 16, 70.9]] },
      { band: '>1,000', lanes: 'Burnaby, Calgary, Winnipeg, Edmonton, Dartmouth, Saskatoon', months: [[113, 58, 85.2], [100, 53, 89.2], [86, 50, 83.3]] },
    ],
    monctonNoCube: 1771,     // Moncton lane bills with no cube, Jul–Sep (627 + 600 + 544)
    toyotaNote: 'Toyota loads our trailer at Bowmanville; we fill the rest in Mississauga before the linehaul departs. Toyota footage is not being captured correctly — being fixed now.',
  },

  // --------------------------------------------------------------------------
  // LOAD QUALITY & SECUREMENT — planned equipment, with trailer photos
  // --------------------------------------------------------------------------
  loadQuality: {
    good: [
      { img: '/img/load-decked-570260.jpg', caption: 'Deck beam builds a second tier over palletized freight' },
      { img: '/img/load-deckboard-470275.jpg', caption: 'Deck board overhead, strap securing the load' },
    ],
    poor: [
      { img: '/img/load-loose-470236.jpg', caption: 'Freight loose and stacked on a diagonal: damage risk, wasted cube' },
      { img: '/img/load-floor-only-570419.jpg', caption: 'Floor-loaded only, upper half of the trailer empty' },
    ],
    equipment: [
      'ANCRA knock-down pallet decks (intermodal) — second tier over short or fragile freight',
      'ANCRA security divider deck-board kits (E-track) — lock loads in place, stop shifting',
      'Panel trucks and reconfigurable racks (Sawtrax, Rack and Shelf, Grainger, Uline) — long, flat and awkward freight: windows, doors, panels, car parts',
      'Load bars and straps on every mixed load',
    ],
    glassPhotos: [
      { img: '/img/glass-aframe-57937.jpg', caption: 'Glass shower doors on improvised wooden A-frames' },
      { img: '/img/glass-leaning.jpg', caption: 'Shower door boxes leaning and toppling into each other in transit' },
    ],
    useCase: 'Example: MAAX shower doors and bases (thin, all glass) and 75" TVs currently ride standing loose in the trailer. Slot them into panel carts instead — the yellow cart rolls in and out by hand, the grey cage is picked up by forklift. Secured in transit, faster to load and unload, far less breakage.',
    // Handling equipment we plan to use — and what for
    products: [
      { name: 'Collapsible load tables', img: '/img/collapsible-extended.jpg', use: 'Second tier in the trailer over short or fragile freight.', how: 'Fold flat and stack when empty; a forklift moves them. Frees dock space here and at the receiving terminal.' },
      { name: 'ANCRA knock-down pallet decks', use: 'A second deck level for palletized freight (E-track).', how: 'Uses the top half of the trailer; freight is not stacked on freight, so less crushing.' },
      { name: 'ANCRA divider deck-board kits', use: 'Deck boards across the trailer to lock loads in place.', how: 'Stops shifting in transit; nothing falls when the doors open.' },
      { name: 'Yellow panel cart', use: 'MAAX glass shower doors and bases, 75-inch TVs, panels.', how: 'Freight rides upright and secured; rolls in and out of the trailer by hand.' },
      { name: 'Grey cage / bin cart', use: 'Glass, TVs and small loose freight; staging for final mile or transfer.', how: 'Lifted in and out by forklift: one move instead of many hand-carries.' },
      { name: 'Panel trucks & reconfigurable racks', use: 'Windows, doors, panels and car parts — long, flat, awkward freight.', how: 'Options: Sawtrax, Rack and Shelf, Grainger vertical panel truck (1,800 lb), Uline carpeted panel truck (30×60).' },
    ],
    collapsible: {
      photos: [
        { img: '/img/collapsible-extended.jpg', caption: 'Extended — second tier in the trailer' },
        { img: '/img/collapsible-folded.jpg', caption: 'Folded — lifted by forklift' },
        { img: '/img/collapsible-stackable.jpg', caption: 'Stacked — small footprint when not in use' },
      ],
      problem: 'Today our load tables are large fixed metal tables that take up dock space when not in use.',
      points: [
        'Fold flat and stack when empty — frees dock space here, and smaller terminals can store them.',
        'Forklift picks them up extended or folded — less manual handling, faster unload.',
        'Network benefit: our outbound trailers unload faster and cleaner at the receiving terminals across the country; same for their inbound trailers to us.',
        'With yellow and grey bin carts, freight rolls straight out of the trailer and is staged for final mile or transfer.',
        'Fewer damages and claims, less handling, safer unloading.',
      ],
    },
    benefits: [
      'Uses the top half of the trailer — lifts load factor (LF score 36.4% F27)',
      'Less shifting and crushing — fewer damaged freight bills (1.61% 7-day avg) and claims',
      'Safer unloading — no freight falling when doors open',
    ],
  },

  // --------------------------------------------------------------------------
  // CICO — hours saved (clock-in / clock-out controls)
  // --------------------------------------------------------------------------
  cico: {
    avgHourlyRate: 33.43,  // Sept MTD $/hr from the productivity dashboard
    status: 'OK — under review',
    weeks: [
      { label: 'Wk 1 · Sep 1–5',   hoursSaved: null },
      { label: 'Wk 2 · Sep 6–12',  hoursSaved: null },
      { label: 'Wk 3 · Sep 13–19', hoursSaved: null },
      { label: 'Wk 4 · Sep 20–26', hoursSaved: null },
    ],
    drivers: [
      'SCA team: CICO is currently OK for our freight-bill volume, building size and operation.',
      'Admin roles form completed for the SCA team — every admin role and its duties documented.',
      'Still under review — any changes will come out of that review.',
    ],
  },

  // --------------------------------------------------------------------------
  // STATUS OF THE PHYSICAL TERMINAL — urgent repairs
  // priority: 'Urgent' | 'High' | 'Planned'   status: free text
  // Rows with an empty item are hidden.
  // --------------------------------------------------------------------------
  terminal: {
    relocation: 'Moving to a new building — expected before the end of calendar 2026.',
    relocationNote: 'No major repair spend planned at the current site; the focus is a clean transition with no service disruption.',
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
      f('safety.trir12mmAvg', 'TRIR 12-month avg'),
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
    title: 'Cargo claims',
    fields: [
      f('claims.amount', 'Claims amount ($)'),
      f('claims.period', 'Claims period', 'text'),
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
      f('sca.workforce.0.drDock', 'AM — D&R dock'),
      f('sca.workforce.0.agencyDock', 'AM — agency dock'),
      f('sca.workforce.0.drAdmin', 'AM — D&R admin'),
      f('sca.workforce.0.agencyAdmin', 'AM — agency admin'),
      f('sca.workforce.1.drDock', 'Day — D&R dock'),
      f('sca.workforce.1.agencyDock', 'Day — agency dock'),
      f('sca.workforce.1.drAdmin', 'Day — D&R admin'),
      f('sca.workforce.1.agencyAdmin', 'Day — agency admin'),
      f('sca.workforce.2.drDock', 'PM — D&R dock'),
      f('sca.workforce.2.agencyDock', 'PM — agency dock'),
      f('sca.workforce.2.drAdmin', 'PM — D&R admin'),
      f('sca.workforce.2.agencyAdmin', 'PM — agency admin'),
    ],
  },
  {
    title: 'F27 Savings Initiatives',
    fields: [
      f('sca.f27SavingsTarget', 'F27 cost take-out target ($)'),
      f('initiatives.0.annual', 'Dispatcher role ($/yr)'),
      f('initiatives.0.ytd', 'Dispatcher role realized YTD ($)'),
      f('initiatives.0.status', 'Dispatcher role status', 'text'),
      f('initiatives.1.annual', 'Agency mix ($/yr)'),
      f('initiatives.1.ytd', 'Agency mix realized YTD ($)'),
      f('initiatives.1.status', 'Agency mix status', 'text'),
      f('initiatives.2.annual', 'Hours under SCA ($/yr)'),
      f('initiatives.2.ytd', 'Hours under SCA realized YTD ($)'),
      f('initiatives.2.status', 'Hours under SCA status', 'text'),
      f('initiatives.3.annual', 'Load securement ($/yr)'),
      f('initiatives.3.ytd', 'Load securement realized YTD ($)'),
      f('initiatives.3.status', 'Load securement status', 'text'),
      f('initiatives.4.annual', 'Handling equipment ($/yr)'),
      f('initiatives.4.ytd', 'Handling equipment realized YTD ($)'),
      f('initiatives.4.status', 'Handling equipment status', 'text'),
      f('initiatives.5.annual', 'Accessorials ($/yr)'),
      f('initiatives.5.ytd', 'Accessorials realized YTD ($)'),
      f('initiatives.5.status', 'Accessorials status', 'text'),
      f('initiatives.6.annual', 'Toyota footage ($/yr)'),
      f('initiatives.6.ytd', 'Toyota footage realized YTD ($)'),
      f('initiatives.6.status', 'Toyota footage status', 'text'),
    ],
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
    fields: [
      f('loadFactor.months.0.lfScore', 'Jul LF score %'),
      f('loadFactor.months.0.loadPct', 'Jul load %'),
      f('loadFactor.months.1.lfScore', 'Aug LF score %'),
      f('loadFactor.months.1.loadPct', 'Aug load %'),
      f('loadFactor.months.2.lfScore', 'Sep LF score %'),
      f('loadFactor.months.2.loadPct', 'Sep load %'),
    ],
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
      f('terminal.relocation', 'Relocation', 'text'),
      f('terminal.relocationNote', 'Relocation note', 'text'),
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
